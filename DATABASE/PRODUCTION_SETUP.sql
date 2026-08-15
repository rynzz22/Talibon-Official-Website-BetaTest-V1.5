-- ====================================================================
-- LGU TALIBON DIGITAL CORE - PRODUCTION DATABASE PROVISIONING SCRIPT
-- ====================================================================
-- This unified script is organized into 10 logical migration steps
-- for a clean-slate setup on a fresh, empty Supabase project.
-- Run this in your Supabase SQL Editor.
-- ====================================================================

-- ====================================================================
-- MIGRATION 01: SYSTEM EXTENSIONS & DATA TYPES
-- ====================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Setup custom status types
do $$
begin
  if not exists (select 1 from pg_type where typname = 'news_status_type' and typnamespace = 'public'::regnamespace) then
    create type public.news_status_type as enum ('draft', 'published', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'downloadable_status_type' and typnamespace = 'public'::regnamespace) then
    create type public.downloadable_status_type as enum ('draft', 'published');
  end if;
  if not exists (select 1 from pg_type where typname = 'service_status_type' and typnamespace = 'public'::regnamespace) then
    create type public.service_status_type as enum ('available', 'coming-soon', 'maintenance');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status_type' and typnamespace = 'public'::regnamespace) then
    create type public.payment_status_type as enum ('pending', 'completed', 'failed', 'refunded');
  end if;
  if not exists (select 1 from pg_type where typname = 'request_status_type' and typnamespace = 'public'::regnamespace) then
    create type public.request_status_type as enum ('Submitted', 'Assigned', 'Processing', 'Returned', 'Approved', 'Rejected', 'Completed', 'Archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'audit_action_type' and typnamespace = 'public'::regnamespace) then
    create type public.audit_action_type as enum ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EMAIL_SENT', 'EMAIL_FAILED');
  end if;
  if not exists (select 1 from pg_type where typname = 'notification_category_type' and typnamespace = 'public'::regnamespace) then
    create type public.notification_category_type as enum ('SYSTEM', 'NEWS', 'WORKFLOW', 'PAYMENT');
  end if;
end;
$$;


-- Ensure new enum values exist for existing databases
alter type public.audit_action_type add value if not exists 'EMAIL_SENT';
alter type public.audit_action_type add value if not exists 'EMAIL_FAILED';


-- ====================================================================
-- MIGRATION 02: CORE TABLES (STANDALONE / BASE TABLES)
-- ====================================================================

-- 1. Roles Lookup Table
create table if not exists public.roles (
  id text primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Barangays Lookup Table
create table if not exists public.barangays (
  id text primary key,
  name text not null unique,
  captain text,
  population integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Departments Table
create table if not exists public.departments (
  id text primary key,
  name text not null,
  official_name text not null,
  description text not null,
  type text not null default 'OFFICE',
  head_of_office text,
  contact_number text,
  email text,
  office_hours text default 'Monday to Friday, 8:00 AM - 5:00 PM',
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Citizen Profiles (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  full_name text,
  role text not null default 'guest',
  barangay_id text,
  department_id text,
  is_verified boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 5. News Announcements CMS Table
create table if not exists public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  summary text not null,
  content text not null,
  image_url text,
  file_url text,
  category text not null default 'ARTICLE' check (category in ('ARTICLE', 'UPDATE', 'ANNOUNCEMENT')),
  author text,
  date date not null default current_date,
  status public.news_status_type not null default 'draft',
  barangay_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 6. Downloadable Files CMS Table
create table if not exists public.downloadables (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null default 'forms',
  file_url text not null,
  file_size text default '1.2 MB',
  status public.downloadable_status_type not null default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 7. Tourism Spots CMS Table
create table if not exists public.tourism_spots (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  gallery_images text[] default array[]::text[],
  location text not null,
  google_maps_link text,
  opening_hours text default 'Always Open',
  contact_details text,
  featured_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 8. LGU Officials Council Table
create table if not exists public.officials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  level integer not null default 3,
  display_order integer not null default 0,
  image_url text,
  biography text,
  contact_info text,
  department text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 9. Services Information CMS Table
create table if not exists public.services_cms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  purpose text,
  requirements text[] default array[]::text[],
  processing_time text not null default '3 to 5 business days',
  fees text default 'None',
  office_responsible text not null,
  office_hours text default 'Monday to Friday, 8:00 AM - 5:00 PM',
  contact_info text,
  physical_address text,
  status public.service_status_type not null default 'available',
  downloadable_forms jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 10. Citizen's Charter Manuals Table
create table if not exists public.citizens_charter_cms (
  id uuid default gen_random_uuid() primary key,
  office text not null,
  service_name text not null,
  requirements text[] default array[]::text[],
  processing_time text not null,
  fees text not null default 'No Fees',
  steps jsonb default '[]'::jsonb,
  downloadable_forms jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 11. Community Events Table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  date date not null,
  time text not null,
  venue text not null,
  banner_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 12. Local Ordinances Repository Table
create table if not exists public.ordinances (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  year text not null,
  file_url text not null,
  file_size text,
  barangay_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 13. Sangguniang Bayan Resolutions Table
create table if not exists public.resolutions (
  id uuid default gen_random_uuid() primary key,
  no text not null,
  date date not null,
  author text not null,
  title text not null,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 14. Session Minutes AI Transcripts Table
create table if not exists public.meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  summary text not null,
  transcription text not null,
  date timestamp with time zone,
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 15. Header Navigation Settings Table
create table if not exists public.navigation (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  href text not null,
  section text not null,
  "order" integer default 0,
  is_external boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 16. Gender & Development Beneficiary Profiling Table
create table if not exists public.gad_beneficiaries (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  sex text not null,
  barangay_id text,
  civil_status text not null,
  sectoral_classification text[] default array[]::text[],
  birthdate date,
  contact_info text,
  unique_id text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 17. Certificate & Clearances Applications Queue Table
create table if not exists public.certificate_requests (
  id uuid default gen_random_uuid() primary key,
  ticket_id text not null unique,
  document_type text not null,
  barangay_id text,
  full_name text not null,
  email text not null,
  mobile_number text,
  purpose text,
  attachments text[] default array[]::text[],
  submitted_at timestamp with time zone default timezone('utc'::text, now()),
  status public.request_status_type not null default 'Submitted',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 18. Application Workflow History Log Table
create table if not exists public.workflow_history (
  id uuid default gen_random_uuid() primary key,
  request_id uuid not null,
  status public.request_status_type not null,
  assigned_to uuid,
  remarks text,
  actor_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 19. Payments Register Table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  request_id uuid,
  ticket_id text not null,
  amount numeric(10,2) not null,
  currency text not null default 'PHP',
  status public.payment_status_type not null default 'pending',
  payment_method text not null,
  transaction_reference text unique,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 20. Notification Registry Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  category public.notification_category_type not null default 'SYSTEM',
  department_id text,
  user_id uuid,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 21. Action Compliance Audit Logs (Immutable Ledger)
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  action public.audit_action_type not null,
  target_table text not null,
  target_id text,
  old_data jsonb,
  new_data jsonb,
  actor_id uuid,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);


-- ====================================================================
-- MIGRATION 03: CONSTRAINTS, INDEXES & FOREIGN KEYS
-- ====================================================================

-- Foreign Key Connections
alter table public.profiles
  add constraint fk_profiles_auth_user foreign key (id) references auth.users (id) on delete cascade,
  add constraint fk_profiles_role foreign key (role) references public.roles (id) on update cascade,
  add constraint fk_profiles_barangay foreign key (barangay_id) references public.barangays (id) on delete set null on update cascade,
  add constraint fk_profiles_department foreign key (department_id) references public.departments (id) on delete set null on update cascade;

alter table public.news
  add constraint fk_news_barangay foreign key (barangay_id) references public.barangays (id) on delete set null on update cascade;

alter table public.officials
  add constraint fk_officials_department foreign key (department) references public.departments (id) on delete set null on update cascade;

alter table public.services_cms
  add constraint fk_services_cms_dept foreign key (office_responsible) references public.departments (id) on update cascade;

alter table public.citizens_charter_cms
  add constraint fk_citizens_charter_cms_dept foreign key (office) references public.departments (id) on update cascade;

alter table public.ordinances
  add constraint fk_ordinances_barangay foreign key (barangay_id) references public.barangays (id) on delete set null on update cascade;

alter table public.gad_beneficiaries
  add constraint fk_gad_beneficiaries_barangay foreign key (barangay_id) references public.barangays (id) on update cascade;

alter table public.certificate_requests
  add constraint fk_certificate_requests_barangay foreign key (barangay_id) references public.barangays (id) on delete set null on update cascade;

alter table public.workflow_history
  add constraint fk_workflow_history_request foreign key (request_id) references public.certificate_requests (id) on delete cascade,
  add constraint fk_workflow_history_assigned foreign key (assigned_to) references public.profiles (id) on delete set null,
  add constraint fk_workflow_history_actor foreign key (actor_id) references public.profiles (id) on delete set null;

alter table public.payments
  add constraint fk_payments_request foreign key (request_id) references public.certificate_requests (id) on delete set null;

alter table public.notifications
  add constraint fk_notifications_dept foreign key (department_id) references public.departments (id) on delete set null on update cascade,
  add constraint fk_notifications_user foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.audit_logs
  add constraint fk_audit_logs_actor foreign key (actor_id) references public.profiles (id) on delete set null;

-- B-Tree Performance Indexes
create index if not exists idx_profiles_verification on public.profiles(is_verified);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_barangay on public.profiles(barangay_id);
create index if not exists idx_profiles_department on public.profiles(department_id);
create index if not exists idx_news_category on public.news(category);
create index if not exists idx_news_status on public.news(status);
create index if not exists idx_news_date on public.news(date desc);
create index if not exists idx_news_barangay on public.news(barangay_id);
create index if not exists idx_downloadables_status on public.downloadables(status);
create index if not exists idx_officials_display_order on public.officials(level, display_order);
create index if not exists idx_services_cms_slug on public.services_cms(slug);
create index if not exists idx_services_cms_office on public.services_cms(office_responsible);
create index if not exists idx_ordinances_year on public.ordinances(year);
create index if not exists idx_resolutions_no on public.resolutions(no);
create index if not exists idx_gad_beneficiaries_unique on public.gad_beneficiaries(unique_id);
create index if not exists idx_gad_beneficiaries_barangay on public.gad_beneficiaries(barangay_id);
create index if not exists idx_certificate_requests_ticket on public.certificate_requests(ticket_id);
create index if not exists idx_certificate_requests_status on public.certificate_requests(status);
create index if not exists idx_certificate_requests_email on public.certificate_requests(email);
create index if not exists idx_workflow_history_request on public.workflow_history(request_id);
create index if not exists idx_payments_ticket on public.payments(ticket_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_department on public.notifications(department_id);
create index if not exists idx_notifications_flags on public.notifications(is_read, is_archived);
create index if not exists idx_audit_logs_table on public.audit_logs(target_table, target_id);
create index if not exists idx_audit_logs_timestamp on public.audit_logs(timestamp desc);

-- Trigram Search Performance Indexes
create index if not exists idx_news_title_trgm on public.news using gin (title gin_trgm_ops);
create index if not exists idx_news_content_trgm on public.news using gin (content gin_trgm_ops);
create index if not exists idx_ordinances_title_trgm on public.ordinances using gin (title gin_trgm_ops);
create index if not exists idx_resolutions_title_trgm on public.resolutions using gin (title gin_trgm_ops);
create index if not exists idx_services_cms_name_trgm on public.services_cms using gin (name gin_trgm_ops);


-- ====================================================================
-- MIGRATION 04: VIEWS (DASHBOARD ANALYTICS & STATS)
-- ====================================================================

-- 1. Combined Stats view
create or replace view public.view_dashboard_aggregates as
select
  (select count(*) from public.news where status = 'published'::public.news_status_type) as total_news,
  (select count(*) from public.downloadables where status = 'published'::public.downloadable_status_type) as total_downloadables,
  (select count(*) from public.tourism_spots) as total_tourism,
  (select count(*) from public.officials) as total_officials,
  (select count(*) from public.departments) as total_departments,
  (select count(*) from public.services_cms where status = 'available'::public.service_status_type) as total_services,
  (select count(*) from public.events) as total_events,
  (select count(*) from public.certificate_requests where status = 'Submitted'::public.request_status_type) as pending_applications,
  (select count(*) from public.gad_beneficiaries) as total_gad_beneficiaries;

-- 2. Document requests trends
create or replace view public.view_monthly_request_stats as
select
  to_char(submitted_at, 'YYYY-MM') as month,
  document_type,
  status,
  count(*) as total_requests
from public.certificate_requests
group by month, document_type, status
order by month desc;

-- 3. GAD demographics distribution
create or replace view public.view_gad_sectoral_stats as
select
  sex,
  civil_status,
  count(*) as count
from public.gad_beneficiaries
group by sex, civil_status;


-- ====================================================================
-- MIGRATION 05: RPC SECURITY DEFINER HELPERS
-- ====================================================================

create or replace function public.get_user_role(p_user_id uuid)
returns text as $$
declare
  v_role text;
begin
  select role into v_role from public.profiles where id = p_user_id;
  return coalesce(v_role, 'guest');
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_user_verified(p_user_id uuid)
returns boolean as $$
declare
  v_verified boolean;
begin
  select is_verified into v_verified from public.profiles where id = p_user_id;
  return coalesce(v_verified, false);
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_verified_admin(p_user_id uuid)
returns boolean as $$
declare
  v_role text;
  v_verified boolean;
begin
  select role, is_verified into v_role, v_verified from public.profiles where id = p_user_id;
  return (v_role in ('super_admin', 'admin') and coalesce(v_verified, false));
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_verified_staff(p_user_id uuid)
returns boolean as $$
declare
  v_role text;
  v_verified boolean;
begin
  select role, is_verified into v_role, v_verified from public.profiles where id = p_user_id;
  return (v_role in ('super_admin', 'admin', 'municipal_admin', 'department_admin', 'barangay_admin', 'editor') and coalesce(v_verified, false));
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.get_user_department(p_user_id uuid)
returns text as $$
declare
  v_dept text;
begin
  select department_id into v_dept from public.profiles where id = p_user_id;
  return v_dept;
end;
$$ language plpgsql security definer set search_path = public;

-- Verification approval endpoint
create or replace function public.approve_user(p_user_id uuid, p_role text)
returns jsonb as $$
declare
  v_caller_role text;
  v_updated_profile public.profiles;
begin
  v_caller_role := public.get_user_role(auth.uid());
  if v_caller_role not in ('super_admin', 'admin') then
    raise exception 'Unauthorized: Only administrators can approve users.';
  end if;

  if not exists (select 1 from public.roles where id = p_role) then
    raise exception 'Invalid role specified.';
  end if;

  update public.profiles
  set is_verified = true, role = p_role, updated_at = now()
  where id = p_user_id
  returning * into v_updated_profile;

  return to_jsonb(v_updated_profile);
end;
$$ language plpgsql security definer set search_path = public;

-- News quick publisher endpoint
create or replace function public.publish_news(p_news_id uuid)
returns jsonb as $$
declare
  v_is_staff boolean;
  v_updated_news public.news;
begin
  v_is_staff := public.is_verified_staff(auth.uid());
  if not v_is_staff then
    raise exception 'Unauthorized: Only verified staff can publish news.';
  end if;

  update public.news
  set status = 'published'::public.news_status_type, updated_at = now()
  where id = p_news_id
  returning * into v_updated_news;

  return to_jsonb(v_updated_news);
end;
$$ language plpgsql security definer set search_path = public;

-- Advanced sequence ticket submission transaction
create or replace function public.submit_certificate_request(
  p_document_type text,
  p_barangay_id text,
  p_full_name text,
  p_email text,
  p_mobile_number text,
  p_purpose text,
  p_attachments text[]
)
returns jsonb as $$
declare
  v_ticket_id text;
  v_sequence_num integer;
  v_new_request public.certificate_requests;
begin
  select count(*) + 1 into v_sequence_num
  from public.certificate_requests
  where submitted_at::date = current_date;

  v_ticket_id := 'TAL-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(v_sequence_num::text, 4, '0');

  insert into public.certificate_requests (
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
  values (
    v_ticket_id,
    p_document_type,
    p_barangay_id,
    p_full_name,
    p_email,
    p_mobile_number,
    p_purpose,
    p_attachments,
    'Submitted'::public.request_status_type
  )
  returning * into v_new_request;

  return to_jsonb(v_new_request);
end;
$$ language plpgsql security definer set search_path = public;

-- Request status transitional transaction
create or replace function public.update_request_status(
  p_request_id uuid,
  p_status public.request_status_type,
  p_remarks text
)
returns jsonb as $$
declare
  v_is_staff boolean;
  v_updated_request public.certificate_requests;
begin
  v_is_staff := public.is_verified_staff(auth.uid());
  if not v_is_staff then
    raise exception 'Unauthorized: Only verified staff can update request status.';
  end if;

  update public.certificate_requests
  set status = p_status, updated_at = now()
  where id = p_request_id
  returning * into v_updated_request;

  update public.workflow_history
  set remarks = p_remarks
  where request_id = p_request_id and status = p_status;

  return to_jsonb(v_updated_request);
end;
$$ language plpgsql security definer set search_path = public;

-- Clear single read updates
create or replace function public.mark_notification_read(p_notification_id uuid)
returns boolean as $$
declare
  v_owner_id uuid;
begin
  select user_id into v_owner_id from public.notifications where id = p_notification_id;
  
  if v_owner_id is null or v_owner_id = auth.uid() or public.is_verified_admin(auth.uid()) then
    update public.notifications
    set is_read = true, updated_at = now()
    where id = p_notification_id;
    return true;
  else
    raise exception 'Unauthorized to modify this notification.';
  end if;
end;
$$ language plpgsql security definer set search_path = public;


-- Secure Public Request Status Tracker (Security Definer to bypass Select RLS)
create or replace function public.get_request_status_by_ticket(p_ticket_id text)
returns jsonb as $$
declare
  v_request record;
  v_history jsonb;
begin
  select * into v_request
  from public.certificate_requests
  where ticket_id = p_ticket_id or id::text = p_ticket_id
  limit 1;
  
  if v_request.id is null then
    return null;
  end if;

  select json_agg(h) into v_history
  from (
    select id, status, remarks, created_at, request_id, actor_id
    from public.workflow_history
    where request_id = v_request.id
    order by created_at desc
  ) h;

  return jsonb_build_object(
    'id', v_request.id,
    'ticket_id', v_request.ticket_id,
    'document_type', v_request.document_type,
    'barangay_id', v_request.barangay_id,
    'full_name', v_request.full_name,
    'email', v_request.email,
    'mobile_number', v_request.mobile_number,
    'purpose', v_request.purpose,
    'attachments', v_request.attachments,
    'submitted_at', v_request.submitted_at,
    'status', v_request.status,
    'created_at', v_request.created_at,
    'updated_at', v_request.updated_at,
    'history', coalesce(v_history, '[]'::jsonb)
  );
end;
$$ language plpgsql security definer set search_path = public;


-- ====================================================================
-- MIGRATION 06: AUTOMATED TRIGGERS & PROCEDURES
-- ====================================================================

-- 1. General Update Timestamp modifier
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Profile insertion interception
create or replace function public.handle_profile_insert_before()
returns trigger as $$
begin
  if new.role is null then
    new.role := 'guest';
  end if;
  if new.is_verified is null then
    new.is_verified := false;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_profile_insert_before
  before insert on public.profiles
  for each row execute procedure public.handle_profile_insert_before();

-- 3. Automatic Auth registration hook
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, is_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'guest',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- 4. User profile approval notifications generator
create or replace function public.handle_profile_verified()
returns trigger as $$
begin
  if new.is_verified = true and (old.is_verified = false or old.is_verified is null) then
    insert into public.notifications (user_id, title, message, category)
    values (
      new.id,
      'Welcome to Talibon Digital Services!',
      'Your account profile has been verified. You can now access online certificate requests, track tax declarations, and query GAD details.',
      'SYSTEM'
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_profile_verified
  after update of is_verified on public.profiles
  for each row execute procedure public.handle_profile_verified();

-- 5. News Announcements Broadcast trigger
create or replace function public.handle_news_published()
returns trigger as $$
begin
  if new.status = 'published'::public.news_status_type and (old.status = 'draft'::public.news_status_type or old.status is null) then
    insert into public.notifications (title, message, category, action_url)
    values (
      'New Announcement: ' || new.title,
      new.summary,
      'NEWS',
      '/news/' || new.slug
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_news_published
  after update of status on public.news
  for each row execute procedure public.handle_news_published();

-- 6. Ticket setup and registration trigger
create or replace function public.handle_certificate_request_created()
returns trigger as $$
begin
  insert into public.workflow_history (request_id, status, remarks)
  values (new.id, 'Submitted', 'Application successfully submitted online.');

  insert into public.notifications (title, message, category, action_url)
  values (
    'New Clearance Request Submited',
    'A citizen has submitted a new application for ' || new.document_type || '. Ticket reference: ' || new.ticket_id,
    'WORKFLOW',
    '/admin/requests/' || new.id
  );
  return new;
end;
$$ language plpgsql;

create trigger on_certificate_request_created
  after insert on public.certificate_requests
  for each row execute procedure public.handle_certificate_request_created();

-- 7. Certificate tracking workflow updates trigger
create or replace function public.handle_certificate_request_status_changed()
returns trigger as $$
begin
  if new.status <> old.status then
    insert into public.workflow_history (request_id, status, remarks, actor_id)
    values (new.id, new.status, 'Status updated to ' || new.status::text, auth.uid());

    insert into public.notifications (user_id, title, message, category, action_url)
    select 
      p.id,
      'Application Status Update: ' || new.ticket_id,
      'Your request for ' || new.document_type || ' has been shifted to: ' || new.status::text,
      'WORKFLOW',
      '/tracker?ticket=' || new.ticket_id
    from public.profiles p
    where p.email = new.email;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_certificate_request_status_changed
  after update of status on public.certificate_requests
  for each row execute procedure public.handle_certificate_request_status_changed();

-- 8. Unified updated_at handlers
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger set_news_updated_at before update on public.news for each row execute procedure public.handle_updated_at();
create trigger set_downloadables_updated_at before update on public.downloadables for each row execute procedure public.handle_updated_at();
create trigger set_tourism_updated_at before update on public.tourism_spots for each row execute procedure public.handle_updated_at();
create trigger set_officials_updated_at before update on public.officials for each row execute procedure public.handle_updated_at();
create trigger set_services_updated_at before update on public.services_cms for each row execute procedure public.handle_updated_at();
create trigger set_charter_updated_at before update on public.citizens_charter_cms for each row execute procedure public.handle_updated_at();
create trigger set_events_updated_at before update on public.events for each row execute procedure public.handle_updated_at();
create trigger set_ordinances_updated_at before update on public.ordinances for each row execute procedure public.handle_updated_at();
create trigger set_resolutions_updated_at before update on public.resolutions for each row execute procedure public.handle_updated_at();
create trigger set_meetings_updated_at before update on public.meetings for each row execute procedure public.handle_updated_at();
create trigger set_navigation_updated_at before update on public.navigation for each row execute procedure public.handle_updated_at();
create trigger set_gad_updated_at before update on public.gad_beneficiaries for each row execute procedure public.handle_updated_at();
create trigger set_certificate_requests_updated_at before update on public.certificate_requests for each row execute procedure public.handle_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute procedure public.handle_updated_at();
create trigger set_notifications_updated_at before update on public.notifications for each row execute procedure public.handle_updated_at();

-- 9. Centralized audit logging implementation
create or replace function public.process_audit_log()
returns trigger as $$
declare
  v_user_email text;
  v_actor_id uuid;
  v_action public.audit_action_type;
  v_old jsonb := null;
  v_new jsonb := null;
  v_target_id text;
begin
  if auth.role() = 'authenticated' then
    select email, id into v_user_email, v_actor_id from public.profiles where id = auth.uid();
  else
    v_user_email := 'system-daemon@talibon.gov.ph';
    v_actor_id := null;
  end if;

  if (TG_OP = 'INSERT') then
    v_action := 'INSERT'::public.audit_action_type;
    v_new := to_jsonb(new);
    v_target_id := new.id::text;
  elsif (TG_OP = 'UPDATE') then
    v_action := 'UPDATE'::public.audit_action_type;
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_target_id := new.id::text;
  elsif (TG_OP = 'DELETE') then
    v_action := 'DELETE'::public.audit_action_type;
    v_old := to_jsonb(old);
    v_target_id := old.id::text;
  end if;

  insert into public.audit_logs (user_email, action, target_table, target_id, old_data, new_data, actor_id, timestamp)
  values (
    coalesce(v_user_email, 'anonymous@talibon.gov.ph'),
    v_action,
    TG_TABLE_NAME,
    v_target_id,
    v_old,
    v_new,
    v_actor_id,
    now()
  );

  if (TG_OP = 'DELETE') then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

create trigger audit_profiles_changes after insert or update or delete on public.profiles for each row execute procedure public.process_audit_log();
create trigger audit_news_changes after insert or update or delete on public.news for each row execute procedure public.process_audit_log();
create trigger audit_download_changes after insert or update or delete on public.downloadables for each row execute procedure public.process_audit_log();
create trigger audit_tourism_changes after insert or update or delete on public.tourism_spots for each row execute procedure public.process_audit_log();
create trigger audit_services_changes after insert or update or delete on public.services_cms for each row execute procedure public.process_audit_log();
create trigger audit_charter_changes after insert or update or delete on public.citizens_charter_cms for each row execute procedure public.process_audit_log();
create trigger audit_gad_changes after insert or update or delete on public.gad_beneficiaries for each row execute procedure public.process_audit_log();
create trigger audit_requests_changes after insert or update or delete on public.certificate_requests for each row execute procedure public.process_audit_log();
create trigger audit_officials_changes after insert or update or delete on public.officials for each row execute procedure public.process_audit_log();
create trigger audit_events_changes after insert or update or delete on public.events for each row execute procedure public.process_audit_log();
create trigger audit_ordinances_changes after insert or update or delete on public.ordinances for each row execute procedure public.process_audit_log();
create trigger audit_resolutions_changes after insert or update or delete on public.resolutions for each row execute procedure public.process_audit_log();


-- ====================================================================
-- MIGRATION 07: ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.roles enable row level security;
alter table public.barangays enable row level security;
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.news enable row level security;
alter table public.downloadables enable row level security;
alter table public.tourism_spots enable row level security;
alter table public.officials enable row level security;
alter table public.services_cms enable row level security;
alter table public.citizens_charter_cms enable row level security;
alter table public.events enable row level security;
alter table public.ordinances enable row level security;
alter table public.resolutions enable row level security;
alter table public.meetings enable row level security;
alter table public.navigation enable row level security;
alter table public.gad_beneficiaries enable row level security;
alter table public.certificate_requests enable row level security;
alter table public.workflow_history enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- General Public Read Policies
create policy "Allow public read-only of lookup tables" on public.roles for select using (true);
create policy "Allow public read-only of barangays" on public.barangays for select using (true);
create policy "Allow public read-only of departments" on public.departments for select using (true);
create policy "Allow public read-only of news" on public.news for select using (status = 'published' or public.is_verified_staff(auth.uid()));
create policy "Allow public read-only of downloadables" on public.downloadables for select using (status = 'published' or public.is_verified_staff(auth.uid()));
create policy "Allow public read-only of tourism spots" on public.tourism_spots for select using (true);
create policy "Allow public read-only of officials" on public.officials for select using (true);
create policy "Allow public read-only of services" on public.services_cms for select using (status = 'available' or public.is_verified_staff(auth.uid()));
create policy "Allow public read-only of charter" on public.citizens_charter_cms for select using (true);
create policy "Allow public read-only of events" on public.events for select using (true);
create policy "Allow public read-only of ordinances" on public.ordinances for select using (true);
create policy "Allow public read-only of resolutions" on public.resolutions for select using (true);
create policy "Allow public read-only of navigation" on public.navigation for select using (true);

-- Profiles Security RLS
create policy "Allow users to view own profile" on public.profiles for select using (id = auth.uid() or public.is_verified_staff(auth.uid()));
create policy "Allow users to edit own profile details" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "Super Admins write everything" on public.profiles for all using (public.is_verified_admin(auth.uid()));

-- Staff Write Access policies across CMS tables
create policy "Staff manage news" on public.news for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage downloadables" on public.downloadables for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage tourism spots" on public.tourism_spots for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage officials" on public.officials for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage services cms" on public.services_cms for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage charter" on public.citizens_charter_cms for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage events" on public.events for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage ordinances" on public.ordinances for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage resolutions" on public.resolutions for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage meetings" on public.meetings for all using (public.is_verified_staff(auth.uid()));
create policy "Staff manage navigation" on public.navigation for all using (public.is_verified_staff(auth.uid()));

-- GAD Profiles Access constraints
create policy "Staff manage GAD beneficiaries" on public.gad_beneficiaries for all using (public.is_verified_staff(auth.uid()));
create policy "Citizens search GAD profile match" on public.gad_beneficiaries for select using (full_name = (select full_name from public.profiles where id = auth.uid() limit 1));

-- Transactions Workflow queues policies
create policy "Citizen apply certificate request" on public.certificate_requests for insert with check (true);
create policy "Citizen view own request history" on public.certificate_requests for select using (email = (select email from public.profiles where id = auth.uid() limit 1) or public.is_verified_staff(auth.uid()));
create policy "Staff manage request workflows" on public.certificate_requests for all using (public.is_verified_staff(auth.uid()));

create policy "Staff view history workflows" on public.workflow_history for select using (public.is_verified_staff(auth.uid()));
create policy "System updates history" on public.workflow_history for insert with check (true);

-- Notifications delivery rules
create policy "Citizens read targeted notifications" on public.notifications for select using (user_id = auth.uid() or user_id is null);
create policy "Citizens read specific read toggles" on public.notifications for update using (user_id = auth.uid() or user_id is null) with check (is_read = true);
create policy "Staff broadcast notifications" on public.notifications for all using (public.is_verified_staff(auth.uid()));

-- Immutable ledger restrictions
create policy "Only system reads logs" on public.audit_logs for select using (public.is_verified_admin(auth.uid()));
create policy "Allow user logging" on public.audit_logs for insert with check (
  auth.uid() is not null and (
    user_email = auth.jwt()->>'email'
    or user_email = (select email from public.profiles where id = auth.uid() limit 1)
    or public.is_verified_staff(auth.uid())
  )
);

-- Payments delivery rules
create policy "Allow select own payments" on public.payments for select using (
  (auth.uid() is not null and exists (
    select 1 from public.certificate_requests cr 
    where cr.ticket_id = payments.ticket_id 
    and (
      cr.email = auth.jwt()->>'email' 
      or cr.email = (select email from public.profiles where id = auth.uid() limit 1)
    )
  ))
  or public.is_verified_staff(auth.uid())
);
create policy "Staff manage payments" on public.payments for all using (public.is_verified_staff(auth.uid()));


-- ====================================================================
-- MIGRATION 08: STORAGE BUCKETS SETUP
-- ====================================================================

-- Ensure core storage configurations exist safely
insert into storage.buckets (id, name, public) values
  ('public-cms', 'public-cms', true),
  ('public-documents', 'public-documents', true),
  ('citizen-vault', 'citizen-vault', false)
on conflict (id) do nothing;


-- ====================================================================
-- MIGRATION 09: STORAGE POLICIES
-- ====================================================================

-- 1. public-cms Policies
create policy "Allow public read access to CMS media"
  on storage.objects for select to public
  using (bucket_id = 'public-cms');

create policy "Allow verified LGU staff to write to CMS media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'public-cms' and public.is_verified_staff(auth.uid()));

create policy "Allow verified LGU staff to edit CMS media"
  on storage.objects for update to authenticated
  using (bucket_id = 'public-cms' and public.is_verified_staff(auth.uid()));

create policy "Allow verified LGU staff to delete CMS media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'public-cms' and public.is_verified_staff(auth.uid()));

-- 2. public-documents Policies
create policy "Allow public read access to documents"
  on storage.objects for select to public
  using (bucket_id = 'public-documents');

create policy "Allow verified LGU staff to write documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'public-documents' and public.is_verified_staff(auth.uid()));

create policy "Allow verified LGU staff to edit documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'public-documents' and public.is_verified_staff(auth.uid()));

create policy "Allow verified LGU staff to delete documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'public-documents' and public.is_verified_staff(auth.uid()));

-- 3. citizen-vault Policies (Private secure cloud)
create policy "Allow citizens access to own folder"
  on storage.objects for select to authenticated
  using (bucket_id = 'citizen-vault' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_verified_staff(auth.uid())));

create policy "Allow citizens to write to own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'citizen-vault' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Allow citizens to update own folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'citizen-vault' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Allow citizens to delete from own folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'citizen-vault' and auth.uid()::text = (storage.foldername(name))[1]);


-- ====================================================================
-- MIGRATION 10: INITIAL MASTER SEED DATA
-- ====================================================================

-- 1. System Roles Seed
insert into public.roles (id, name, description) values
  ('super_admin', 'Super Administrator', 'Full system configuration, security rules oversight, and root diagnostics access.'),
  ('admin', 'System Administrator', 'LGU IT staff managing users, databases, and platform operation parameters.'),
  ('municipal_admin', 'Municipal LGU Admin', 'High-level executive overview (Mayor, Vice-Mayor, Administrator).'),
  ('department_admin', 'Department Admin', 'Assigned LGU office staffs managing specific document flows.'),
  ('barangay_admin', 'Barangay Admin', 'Barangay officials managing clearances and community bulletins.'),
  ('editor', 'Content Editor', 'Managing news, tourism, announcements, and events CMS portals.'),
  ('citizen', 'Verified Citizen', 'LGU-approved accounts applying for e-services and tracking histories.'),
  ('guest', 'Unverified Guest', 'Newly registered accounts waiting for administrative verification.')
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- 2. Barangays Seed
insert into public.barangays (id, name, captain, population) values
  ('poblacion', 'Poblacion', 'Hon. Juan dela Cruz', 4500),
  ('san_francisco', 'San Francisco', 'Hon. Maria Clara', 3200),
  ('san_jose', 'San Jose', 'Hon. Jose Rizal', 2800),
  ('san_agustin', 'San Agustin', 'Hon. Andres Bonifacio', 1900),
  ('san_roque', 'San Roque', 'Hon. Emilio Aguinaldo', 2100),
  ('san_isidro', 'San Isidro', 'Hon. Apolinario Mabini', 1500),
  ('santo_nino', 'Santo Niño', 'Hon. Melchora Aquino', 1100),
  ('san_pedro', 'San Pedro', 'Hon. Marcelo H. del Pilar', 3800),
  ('tanghaligue', 'Tanghaligue', 'Hon. Gregorio del Pilar', 2400),
  ('bagacay', 'Bagacay', 'Hon. Gabriela Silang', 1700),
  ('balintawak', 'Balintawak', 'Hon. Francisco Balagtas', 1200),
  ('burgos', 'Burgos', 'Hon. Diego Silang', 850),
  ('cantomimbo', 'Cantomimbo', 'Hon. Juan Luna', 1300),
  ('guindacpan', 'Guindacpan', 'Hon. Macario Sakay', 2200),
  ('magsaysay', 'Magsaysay', 'Hon. Ramon Magsaysay', 1450),
  ('mahanay', 'Mahanay', 'Hon. Carlos P. Garcia', 3100),
  ('masacon', 'Masacon', 'Hon. Jose Abad Santos', 980),
  ('nonoc', 'Nonoc', 'Hon. Manuel L. Quezon', 1600),
  ('san_carlos', 'San Carlos', 'Hon. Sergio Osmeña', 1150),
  ('san_gregorio', 'San Gregorio', 'Hon. Elpidio Quirino', 750),
  ('san_juan', 'San Juan', 'Hon. Diosdado Macapagal', 2050),
  ('santa_cruz', 'Santa Cruz', 'Hon. Ferdinand Marcos', 1800),
  ('santo_rosario', 'Santo Rosario', 'Hon. Corazon Aquino', 950),
  ('sikatuna', 'Sikatuna', 'Hon. Datu Sikatuna', 1350),
  ('suba', 'Suba', 'Hon. Rajah Humabon', 2900)
on conflict (id) do update set name = excluded.name, captain = excluded.captain, population = excluded.population;

-- 3. LGU Departments Seed
insert into public.departments (id, name, official_name, description, head_of_office, contact_number, email, location) values
  ('bplo', 'Business Permit & Licensing Office', 'Business Permit & Licensing Office', 'Manages business permits, certifications, zoning compliance, and commercial records.', 'Mrs. Jane Aurestila-Garcia', '+63 912 345 6789', 'bplo@talibon.gov.ph', 'Ground Floor, Executive Building'),
  ('treasury', 'Municipal Treasury Office', 'Office of the Municipal Treasurer', 'Collects local fees, taxes, permit charges, and manages municipal funds.', 'Mr. Roberto Castro', '+63 923 456 7890', 'treasurer@talibon.gov.ph', 'Ground Floor, Annex Building'),
  ('assessor', 'Municipal Assessor Office', 'Office of the Municipal Assessor', 'Real property valuations, real estate tax mapping, and land titling archives.', 'Engr. Manuel Santos', '+63 934 567 8901', 'assessor@talibon.gov.ph', 'Second Floor, Executive Building'),
  ('mpdo', 'Planning & Development Office', 'Municipal Planning & Development Office', 'Town spatial planning, infrastructure mapping, and socio-economic profiling.', 'Arch. Teresa Lim', '+63 945 678 9012', 'mpdo@talibon.gov.ph', 'Second Floor, Executive Building'),
  ('mayor', 'Office of the Mayor', 'Office of the Municipal Mayor', 'Chief executive administration of the Municipality of Talibon.', 'Hon. Janette Aurestila-Garcia', '+63 38 515 9001', 'mayor@talibon.gov.ph', 'Second Floor, Executive Building'),
  ('sb', 'Sangguniang Bayan Office', 'Office of the Sangguniang Bayan Secretary', 'Legislative chamber enacting local policies, municipal resolutions, and laws.', 'Atty. Victoriano Alcantara', '+63 38 515 9002', 'sb@talibon.gov.ph', 'Legislative Hall, Session Building'),
  ('tourism', 'Municipal Tourism Office', 'Office of the Municipal Tourism Officer', 'Promoting historical, ecological, and marine heritage of Talibon.', 'Mr. Christopher Mendez', '+63 956 789 0123', 'tourism@talibon.gov.ph', 'Tourism Desk, Public Plaza'),
  ('health', 'Municipal Health Office', 'Municipal Health Office & Rural Health Unit', 'Provides public diagnostics, immunization, sanitation inspections, and consultations.', 'Dr. Helen Joy Almeda, M.D.', '+63 967 890 1234', 'mho@talibon.gov.ph', 'Rural Health Unit Compound, San Jose'),
  ('eng', 'Municipal Engineering Office', 'Office of the Municipal Engineering Officer', 'Overseeing public infrastructures development, building permits approval, and checks.', 'Engr. Rodolfo Ramirez', '+63 978 901 2345', 'engineering@talibon.gov.ph', 'Ground Floor, Engineering Building'),
  ('social', 'Social Welfare & Development', 'Municipal Social Welfare & Development Office', 'Coordination of Gender and Development (GAD), Senior Citizens, and aid distributions.', 'Mrs. Corazon Valenzuela', '+63 989 012 3456', 'mswd@talibon.gov.ph', 'Ground Floor, Social Services Center')
on conflict (id) do update set name = excluded.name, official_name = excluded.official_name, description = excluded.description;
