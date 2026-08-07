-- ====================================================================
-- CITIZEN NOTIFICATION SYSTEM MIGRATION (SECURED & SECURE RPC INTEGRATED)
-- ====================================================================
-- This migration file is designed to safely extend the canonical database schema
-- of the Municipality of Talibon Digital Core v2 with citizen notification preferences
-- and robust delivery logging features, secured from arbitrary public-client access.
-- ====================================================================

-- 0. Safe, additive schema correction of the existing production baseline
-- Drop NOT NULL constraint on email to support phone-only submissions securely
ALTER TABLE public.certificate_requests ALTER COLUMN email DROP NOT NULL;

-- 1. Citizen Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.citizen_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  email_address text,
  mobile_number text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Foreign key reference with cascade delete
  CONSTRAINT fk_citizen_notification_preferences_request
    FOREIGN KEY (request_id) 
    REFERENCES public.certificate_requests(id) 
    ON DELETE CASCADE,

  -- Integrity check: At least one contact channel must be provided with non-empty content
  CONSTRAINT check_at_least_one_contact_method CHECK (
    (email_address IS NOT NULL AND trim(email_address) <> '') OR 
    (mobile_number IS NOT NULL AND trim(mobile_number) <> '')
  )
);

-- B-Tree Performance Index on request_id foreign key
CREATE INDEX IF NOT EXISTS idx_citizen_notification_preferences_request_id 
  ON public.citizen_notification_preferences(request_id);


-- 2. Notification Delivery Logs Table (Tracks delivery attempts)
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  ticket_id text,
  channel text NOT NULL, -- 'email', 'sms'
  recipient text,
  notification_type text NOT NULL, -- 'request_received', 'status_update', 'additional_requirements', 'approved', 'rejected', 'completed'
  status text NOT NULL, -- 'queued', 'sent', 'failed', 'skipped'
  provider_message_id text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Foreign key reference with cascade delete
  CONSTRAINT fk_notification_delivery_logs_request
    FOREIGN KEY (request_id) 
    REFERENCES public.certificate_requests(id) 
    ON DELETE CASCADE,

  -- Allowed channels and statuses constraint matching system spec
  CONSTRAINT check_delivery_channel CHECK (channel IN ('email', 'sms')),
  CONSTRAINT check_delivery_status CHECK (status IN ('queued', 'sent', 'failed', 'skipped'))
);

-- B-Tree Performance Indexes for audit trail lookup speed
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_request_id 
  ON public.notification_delivery_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_ticket_id 
  ON public.notification_delivery_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_logs_channel 
  ON public.notification_delivery_logs(channel);


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on both tables to secure private contact data
ALTER TABLE public.citizen_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Citizen insert own notification preference" ON public.citizen_notification_preferences;
DROP POLICY IF EXISTS "Staff manage notification preferences" ON public.citizen_notification_preferences;
DROP POLICY IF EXISTS "System/Citizen insert delivery logs" ON public.notification_delivery_logs;
DROP POLICY IF EXISTS "Staff manage delivery logs" ON public.notification_delivery_logs;
DROP POLICY IF EXISTS "Staff select delivery logs" ON public.notification_delivery_logs;

-- Policies for citizen_notification_preferences:
-- 1. NO PUBLIC SELECT, INSERT, UPDATE, or DELETE policies exist.
-- 2. Allow verified LGU staff full administrative privileges
CREATE POLICY "Staff manage notification preferences" 
  ON public.citizen_notification_preferences 
  FOR ALL 
  USING (public.is_verified_staff(auth.uid()))
  WITH CHECK (public.is_verified_staff(auth.uid()));

-- Policies for notification_delivery_logs:
-- 1. NO PUBLIC SELECT, INSERT, UPDATE, or DELETE policies exist.
-- 2. Allow verified LGU staff to SELECT/query and audit delivery histories (READ-ONLY)
CREATE POLICY "Staff select delivery logs" 
  ON public.notification_delivery_logs 
  FOR SELECT 
  USING (public.is_verified_staff(auth.uid()));


-- ====================================================================
-- AUTOMATED TRIGGER FOR TIMESTAMPS
-- ====================================================================
DROP TRIGGER IF EXISTS set_citizen_notification_preferences_updated_at ON public.citizen_notification_preferences;
CREATE TRIGGER set_citizen_notification_preferences_updated_at
  BEFORE UPDATE ON public.citizen_notification_preferences
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ====================================================================
-- SECURED ATOMIC SUBMISSION GATEWAY (SECURITY DEFINER RPC)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.submit_certificate_request(
  p_document_type text,
  p_barangay_id text,
  p_full_name text,
  p_email text,
  p_mobile_number text,
  p_purpose text,
  p_attachments text[]
)
RETURNS jsonb AS $$
DECLARE
  v_ticket_id text;
  v_sequence_num integer;
  v_normalized_mobile text;
  v_new_request public.certificate_requests;
BEGIN
  -- 1. Validate that at least one contact method exists and has content
  IF (p_email IS NULL OR trim(p_email) = '') AND (p_mobile_number IS NULL OR trim(p_mobile_number) = '') THEN
    RAISE EXCEPTION 'Validation failed: At least one contact method (Email or Mobile Number) must be provided.';
  END IF;

  -- 2. Validate email format if provided
  IF p_email IS NOT NULL AND trim(p_email) <> '' THEN
    IF p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Validation failed: Invalid email address format.';
    END IF;
  END IF;

  -- 3. Validate and normalize PH mobile number if provided
  v_normalized_mobile := p_mobile_number;
  IF p_mobile_number IS NOT NULL AND trim(p_mobile_number) <> '' THEN
    DECLARE
      v_digits text := regexp_replace(p_mobile_number, '\D', '', 'g');
    BEGIN
      IF length(v_digits) < 10 OR length(v_digits) > 12 THEN
        RAISE EXCEPTION 'Validation failed: Invalid Philippine mobile number.';
      END IF;
      
      IF v_digits LIKE '09%' AND length(v_digits) = 11 THEN
        v_normalized_mobile := '+63' || substring(v_digits FROM 2);
      ELIF v_digits LIKE '9%' AND length(v_digits) = 10 THEN
        v_normalized_mobile := '+63' || v_digits;
      ELIF v_digits LIKE '639%' AND length(v_digits) = 12 THEN
        v_normalized_mobile := '+' || v_digits;
      END IF;
    END;
  END IF;

  -- 4. Generate unique Ticket ID matching established production behavior safely under concurrent requests
  -- Acquire an exclusive transaction-level advisory lock based on the current date integer representation (e.g., 20260721)
  -- to serialize sequence generation and insert within the current day, eliminating race conditions.
  PERFORM pg_advisory_xact_lock(to_char(current_date, 'YYYYMMDD')::bigint);

  SELECT count(*) + 1 INTO v_sequence_num
  FROM public.certificate_requests
  WHERE submitted_at::date = current_date;

  v_ticket_id := 'TAL-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(v_sequence_num::text, 4, '0');

  -- 5. Insert certificate_requests row with exact column and value counts
  INSERT INTO public.certificate_requests (
    ticket_id,
    document_type,
    barangay_id,
    full_name,
    email,
    mobile_number,
    purpose,
    attachments,
    status
  )
  VALUES (
    v_ticket_id,
    p_document_type,
    p_barangay_id,
    trim(p_full_name),
    nullif(trim(p_email), ''),
    nullif(trim(v_normalized_mobile), ''),
    trim(p_purpose),
    p_attachments,
    'Submitted'::public.request_status_type
  )
  RETURNING * INTO v_new_request;

  -- 6. Insert corresponding citizen_notification_preferences record atomically in same TX
  INSERT INTO public.citizen_notification_preferences (
    request_id,
    email_address,
    mobile_number,
    email_enabled,
    sms_enabled
  )
  VALUES (
    v_new_request.id,
    v_new_request.email,
    v_new_request.mobile_number,
    (v_new_request.email IS NOT NULL),
    false -- SMS notifications MUST remain disabled until SMS gateway integrated
  );

  RETURN to_jsonb(v_new_request);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant EXECUTE permission to public so anonymous submittals work
GRANT EXECUTE ON FUNCTION public.submit_certificate_request(text, text, text, text, text, text, text[]) TO public, anon, authenticated;
