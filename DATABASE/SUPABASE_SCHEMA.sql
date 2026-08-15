-- ====================================================================
-- !!! DEPRECATED / ARCHIVED SCHEMA FILE !!!
-- ====================================================================
-- WARNING: This file (SUPABASE_SCHEMA.sql) is now OBSOLETE.
-- It no longer represents the active or deployed database schema.
-- 
-- CANONICAL PRODUCTION DATABASE DEFINITION:
-- Please refer exclusively to `/PRODUCTION_SETUP.sql` for the
-- current, production-ready, self-contained database schema and migrations.
--
-- Do NOT run or modify this file for any future deployments or updates.
-- ====================================================================

-- ====================================================================
-- MUNICIPALITY OF TALIBON DIGITAL CORE V2 - ENTERPRISE PRODUCTION SQL (DEPRECATED)
-- ====================================================================
-- This file provides the COMPLETE, production-ready PostgreSQL implementation
-- engineered for the Local Government Unit (LGU) of Talibon, Bohol, Philippines.
-- It establishes a highly optimized, fully relational 3NF schema, custom types,
-- database-level triggers, Row Level Security (RLS) policies, and performance
-- indexes designed for high scalability, security, and compliance.
--
-- TARGET DATABASE: Supabase / PostgreSQL (15+)
-- DESIGN FREEZE STATUS: FROZEN & APPROVED
--
-- ====================================================================
-- 01_extensions.sql
-- ====================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Create Enterprise Database Enums with dynamic checks for complete idempotency
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
-- 02_lookup_tables.sql
-- ====================================================================

-- 1. Roles Master Lookup
create table if not exists public.roles (
  id text primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Barangays Master Lookup (25 actual barangays of Talibon, Bohol)
create table if not exists public.barangays (
  id text primary key, -- snake_case unique short name (e.g. 'poblacion')
  name text not null unique,
  captain text,
  population integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Departments Master Lookup (Municipal LGU Offices)
create table if not exists public.departments (
  id text primary key, -- snake_case unique code (e.g. 'bplo', 'treasury')
  name text not null,
  official_name text not null,
  description text not null,
  type text not null default 'OFFICE', -- 'OFFICE', 'UNIT', 'LEGISLATIVE'
  head_of_office text,
  contact_number text,
  email text,
  office_hours text default 'Monday to Friday, 8:00 AM - 5:00 PM',
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ====================================================================
-- 03_profiles.sql
-- ====================================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text,
  role text not null default 'guest' references public.roles(id) on update cascade,
  barangay_id text references public.barangays(id) on delete set null on update cascade,
  department_id text references public.departments(id) on delete set null on update cascade,
  is_verified boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- ====================================================================
-- 04_cms_tables.sql
-- ====================================================================

-- 1. News CMS Table
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
  barangay_id text references public.barangays(id) on delete set null on update cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 2. Downloadable Files CMS Table
create table if not exists public.downloadables (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null default 'forms', -- 'forms', 'guidelines', 'reports'
  file_url text not null,
  file_size text default '1.2 MB',
  status public.downloadable_status_type not null default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 3. Tourism Spots Table
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

-- 4. Municipal Officials CMS Table
create table if not exists public.officials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null, -- Position/Title (e.g. Councilor, Vice Mayor)
  level integer not null default 3, -- Position tier (1=Mayor, 2=Vice Mayor, 3=SB Members, etc.)
  display_order integer not null default 0,
  image_url text,
  biography text,
  contact_info text,
  department text references public.departments(id) on delete set null on update cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 5. Services CMS Table
create table if not exists public.services_cms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  purpose text,
  requirements text[] default array[]::text[],
  processing_time text not null default '3 to 5 business days',
  fees text default 'None',
  office_responsible text not null references public.departments(id) on update cascade,
  office_hours text default 'Monday to Friday, 8:00 AM - 5:00 PM',
  contact_info text,
  physical_address text,
  status public.service_status_type not null default 'available',
  downloadable_forms jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 6. Citizen's Charter CMS Table
create table if not exists public.citizens_charter_cms (
  id uuid default gen_random_uuid() primary key,
  office text not null references public.departments(id) on update cascade,
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

-- 7. Events CMS Table
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

-- 8. Legislative Enacted Ordinances Table
create table if not exists public.ordinances (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  year text not null,
  file_url text not null,
  file_size text,
  barangay_id text references public.barangays(id) on delete set null on update cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- 9. Legislative Resolutions Table
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

-- 10. AI Meetings Assistant Table
create table if not exists public.meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  summary text not null,
  transcription text not null,
  date timestamp with time zone default timezone('utc'::text, now()),
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 11. Navigation CMS Table
create table if not exists public.navigation (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  href text not null,
  section text not null,
  "order" integer not null default 0,
  is_external boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 12. GAD Beneficiaries Registry Table
create table if not exists public.gad_beneficiaries (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  sex text not null,
  barangay_id text not null references public.barangays(id) on update cascade,
  civil_status text not null,
  sectoral_classification text[] default array[]::text[],
  birthdate date,
  contact_info text,
  unique_id text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- ====================================================================
-- 05_transaction_tables.sql
-- ====================================================================

-- 1. Certificate/Permit Requests Table (Citizen workflow entrance)
create table if not exists public.certificate_requests (
  id uuid default gen_random_uuid() primary key,
  ticket_id text not null unique,
  document_type text not null,
  barangay_id text references public.barangays(id) on delete set null on update cascade, -- normalized fk link
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

-- 2. Workflow Transition History Table (Timeline tracking)
create table if not exists public.workflow_history (
  id uuid default gen_random_uuid() primary key,
  request_id uuid not null references public.certificate_requests(id) on delete cascade,
  status public.request_status_type not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  remarks text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Payments Transaction Table (Settlements tracking)
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.certificate_requests(id) on delete set null,
  ticket_id text not null,
  amount numeric(10,2) not null,
  currency text not null default 'PHP',
  status public.payment_status_type not null default 'pending',
  payment_method text not null, -- 'Stripe', 'PayMaya', 'GCash', etc.
  transaction_reference text unique,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enterprise Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  category public.notification_category_type not null default 'SYSTEM',
  department_id text references public.departments(id) on delete set null on update cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Enterprise Immutable Audit Logs
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_email text not null,
  action public.audit_action_type not null,
  target_table text not null,
  target_id text,
  old_data jsonb,
  new_data jsonb,
  actor_id uuid references public.profiles(id) on delete set null,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);

-- ====================================================================
-- 06_storage.sql
-- ====================================================================

-- Provision Storage Buckets safely
insert into storage.buckets (id, name, public)
values 
  ('public-cms', 'public-cms', true),
  ('public-documents', 'public-documents', true),
  ('citizen-vault', 'citizen-vault', false)
on conflict (id) do nothing;

-- NOTE: Removed direct 'alter table storage.objects enable row level security;' 
-- because standard Supabase projects pre-configure or restrict direct ALTER ownership 
-- on storage schema. Supabase SQL Editor execution runs as 'postgres' role, 
-- which does not own the 'storage.objects' relation.

-- Storage Rules for public-cms (Public Read, Verified Staff Write)
drop policy if exists "Allow public read on public-cms" on storage.objects;
create policy "Allow public read on public-cms" on storage.objects
  for select using (bucket_id = 'public-cms');

drop policy if exists "Allow verified staff to write public-cms" on storage.objects;
create policy "Allow verified staff to write public-cms" on storage.objects
  for all using (
    bucket_id = 'public-cms'
    and exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'editor', 'municipal_admin')
    )
  );

-- Storage Rules for public-documents (Public Read, Verified Staff Write)
drop policy if exists "Allow public read on public-documents" on storage.objects;
create policy "Allow public read on public-documents" on storage.objects
  for select using (bucket_id = 'public-documents');

drop policy if exists "Allow verified staff to write public-documents" on storage.objects;
create policy "Allow verified staff to write public-documents" on storage.objects
  for all using (
    bucket_id = 'public-documents'
    and exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid()
      and public.profiles.is_verified = true
      and public.profiles.role in ('super_admin', 'admin', 'editor', 'municipal_admin', 'barangay_admin')
    )
  );

-- Storage Rules for citizen-vault (Private, Authorized Access only)
drop policy if exists "Allow owner or staff to view citizen-vault" on storage.objects;
create policy "Allow owner or staff to view citizen-vault" on storage.objects
  for select using (
    bucket_id = 'citizen-vault'
    and (
      auth.uid()::text = (storage.foldername(name))[1] -- Folder named after user uuid
      or exists (
        select 1 from public.profiles
        where public.profiles.id = auth.uid()
        and public.profiles.is_verified = true
        and public.profiles.role in ('super_admin', 'admin', 'municipal_admin', 'department_admin')
      )
    )
  );

drop policy if exists "Allow citizen to write to own folder in citizen-vault" on storage.objects;
create policy "Allow citizen to write to own folder in citizen-vault" on storage.objects
  for insert with check (
    bucket_id = 'citizen-vault'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================================================
-- RLS Security Definer Helpers (Prevents recursion & set search_path)
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

create or replace function public.get_user_department(p_user_id uuid)
returns text as $$
declare
  v_dept_id text;
begin
  select department_id into v_dept_id from public.profiles where id = p_user_id;
  return v_dept_id;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_verified_admin(p_user_id uuid)
returns boolean as $$
declare
  v_role text;
  v_verified boolean;
begin
  select role, is_verified into v_role, v_verified from public.profiles where id = p_user_id;
  return coalesce(v_verified, false) and (v_role in ('super_admin', 'admin', 'municipal_admin'));
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_verified_staff(p_user_id uuid)
returns boolean as $$
declare
  v_role text;
  v_verified boolean;
begin
  select role, is_verified into v_role, v_verified from public.profiles where id = p_user_id;
  return coalesce(v_verified, false) and (v_role in ('super_admin', 'admin', 'municipal_admin', 'department_admin', 'barangay_admin', 'editor'));
end;
$$ language plpgsql security definer set search_path = public;

-- ====================================================================
-- 07_auth_triggers.sql
-- ====================================================================

-- Handle profiles conflicts gracefully on concurrent inserts
create or replace function public.handle_profile_insert_conflict()
returns trigger as $$
begin
  if exists (select 1 from public.profiles where id = NEW.id) then
    update public.profiles
    set 
      email = coalesce(NEW.email, email),
      full_name = coalesce(NEW.full_name, full_name),
      role = coalesce(NEW.role, role),
      barangay_id = coalesce(NEW.barangay_id, barangay_id),
      department_id = coalesce(NEW.department_id, department_id),
      is_verified = coalesce(NEW.is_verified, is_verified),
      updated_at = now()
    where id = NEW.id;
    return null; -- Skip redundant insertion
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_profile_insert_before on public.profiles;
create trigger on_profile_insert_before
  before insert on public.profiles
  for each row execute procedure public.handle_profile_insert_conflict();

-- Auto-profile creator on Supabase auth signup (Secured against metadata-injection privilege escalation)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, is_verified, created_at)
  values (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'full_name', ''),
    'guest', -- Secure default: always start as guest, preventing metadata injection
    false,   -- Secure default: always start as unverified
    coalesce(NEW.created_at, now())
  )
  on conflict (id) do nothing;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- 08_notification_triggers.sql
-- ====================================================================

-- Profile verification alert
create or replace function public.handle_profile_verification_change()
returns trigger as $$
begin
  if NEW.is_verified = true and (OLD.is_verified = false or OLD.is_verified is null) then
    insert into public.notifications (title, message, category, user_id, action_url)
    values (
      'Account Verified',
      'Your Municipal LGU account has been verified. You now have authorized dashboard privileges.',
      'SYSTEM'::public.notification_category_type,
      NEW.id,
      '/admin'
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_profile_verified on public.profiles;
create trigger on_profile_verified
  after update of is_verified on public.profiles
  for each row execute procedure public.handle_profile_verification_change();

-- News publication alert
create or replace function public.handle_news_publish()
returns trigger as $$
begin
  if NEW.status = 'published'::public.news_status_type and (OLD.status = 'draft'::public.news_status_type or OLD.status is null) then
    insert into public.notifications (title, message, category, action_url)
    values (
      'New Announcement Published',
      'A new announcement is now live: "' || NEW.title || '".',
      'NEWS'::public.notification_category_type,
      '/updates'
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_news_published on public.news;
create trigger on_news_published
  after insert or update of status on public.news
  for each row execute procedure public.handle_news_publish();

-- Certificate Request Creation Alert
create or replace function public.handle_certificate_request_insert()
returns trigger as $$
begin
  insert into public.workflow_history (request_id, status, remarks)
  values (NEW.id, NEW.status, 'Request submitted online and queued for department verification.');

  insert into public.notifications (title, message, category, action_url)
  values (
    'New Request Submitted',
    'A new online application for ' || NEW.document_type || ' has been submitted by ' || NEW.full_name || ' (Ticket: ' || NEW.ticket_id || ').',
    'WORKFLOW'::public.notification_category_type,
    '/admin'
  );
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_certificate_request_created on public.certificate_requests;
create trigger on_certificate_request_created
  after insert on public.certificate_requests
  for each row execute procedure public.handle_certificate_request_insert();

-- Certificate Request Status Change Alert
create or replace function public.handle_certificate_request_update()
returns trigger as $$
declare
  v_notification_msg text;
begin
  if NEW.status <> OLD.status then
    insert into public.workflow_history (request_id, status, remarks, actor_id)
    values (
      NEW.id,
      NEW.status,
      'Status transitioned from ' || OLD.status || ' to ' || NEW.status || '.',
      auth.uid()
    );

    v_notification_msg := 'Your application for ' || NEW.document_type || ' (Ticket: ' || NEW.ticket_id || ') is now ' || NEW.status || '.';

    insert into public.notifications (title, message, category, user_id, action_url)
    values (
      'Application Status Update',
      v_notification_msg,
      'WORKFLOW'::public.notification_category_type,
      (select id from public.profiles where email = NEW.email limit 1),
      '/e-services'
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_certificate_request_status_changed on public.certificate_requests;
create trigger on_certificate_request_status_changed
  after update of status on public.certificate_requests
  for each row execute procedure public.handle_certificate_request_update();

-- ====================================================================
-- 09_audit_triggers.sql
-- ====================================================================

-- Automatic timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Apply updated_at to all models
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.news;
create trigger set_updated_at before update on public.news for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.downloadables;
create trigger set_updated_at before update on public.downloadables for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.tourism_spots;
create trigger set_updated_at before update on public.tourism_spots for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.officials;
create trigger set_updated_at before update on public.officials for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.services_cms;
create trigger set_updated_at before update on public.services_cms for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.citizens_charter_cms;
create trigger set_updated_at before update on public.citizens_charter_cms for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.events;
create trigger set_updated_at before update on public.events for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.ordinances;
create trigger set_updated_at before update on public.ordinances for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.resolutions;
create trigger set_updated_at before update on public.resolutions for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.gad_beneficiaries;
create trigger set_updated_at before update on public.gad_beneficiaries for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_updated_at on public.certificate_requests;
create trigger set_updated_at before update on public.certificate_requests for each row execute procedure public.update_updated_at_column();

-- Centralized Operational Auditing Trigger
create or replace function public.process_audit_log()
returns trigger as $$
declare
  v_actor_email text := 'system@talibon.gov.ph';
  v_actor_id uuid := null;
  v_target_id text;
  v_old_data jsonb := null;
  v_new_data jsonb := null;
begin
  begin
    v_actor_id := auth.uid();
    if v_actor_id is not null then
      select email into v_actor_email from public.profiles where id = v_actor_id;
    end if;
    if v_actor_email is null then
      v_actor_email := 'anonymous@talibon.gov.ph';
    end if;
  exception when others then
    v_actor_id := null;
    v_actor_email := 'system@talibon.gov.ph';
  end;

  if TG_OP = 'INSERT' then
    v_target_id := NEW.id::text;
    v_new_data := to_jsonb(NEW);
    insert into public.audit_logs (user_email, action, target_table, target_id, new_data, actor_id)
    values (v_actor_email, 'INSERT'::public.audit_action_type, TG_TABLE_NAME, v_target_id, v_new_data, v_actor_id);
    return NEW;
  elsif TG_OP = 'UPDATE' then
    v_target_id := NEW.id::text;
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    insert into public.audit_logs (user_email, action, target_table, target_id, old_data, new_data, actor_id)
    values (v_actor_email, 'UPDATE'::public.audit_action_type, TG_TABLE_NAME, v_target_id, v_old_data, v_new_data, v_actor_id);
    return NEW;
  elsif TG_OP = 'DELETE' then
    v_target_id := OLD.id::text;
    v_old_data := to_jsonb(OLD);
    insert into public.audit_logs (user_email, action, target_table, target_id, old_data, actor_id)
    values (v_actor_email, 'DELETE'::public.audit_action_type, TG_TABLE_NAME, v_target_id, v_old_data, v_actor_id);
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

-- Attach auditing triggers to all stateful tables
drop trigger if exists audit_news on public.news;
create trigger audit_news after insert or update or delete on public.news for each row execute procedure public.process_audit_log();

drop trigger if exists audit_downloadables on public.downloadables;
create trigger audit_downloadables after insert or update or delete on public.downloadables for each row execute procedure public.process_audit_log();

drop trigger if exists audit_tourism_spots on public.tourism_spots;
create trigger audit_tourism_spots after insert or update or delete on public.tourism_spots for each row execute procedure public.process_audit_log();

drop trigger if exists audit_officials on public.officials;
create trigger audit_officials after insert or update or delete on public.officials for each row execute procedure public.process_audit_log();

drop trigger if exists audit_services on public.services_cms;
create trigger audit_services after insert or update or delete on public.services_cms for each row execute procedure public.process_audit_log();

drop trigger if exists audit_charter on public.citizens_charter_cms;
create trigger audit_charter after insert or update or delete on public.citizens_charter_cms for each row execute procedure public.process_audit_log();

drop trigger if exists audit_events on public.events;
create trigger audit_events after insert or update or delete on public.events for each row execute procedure public.process_audit_log();

drop trigger if exists audit_ordinances on public.ordinances;
create trigger audit_ordinances after insert or update or delete on public.ordinances for each row execute procedure public.process_audit_log();

drop trigger if exists audit_resolutions on public.resolutions;
create trigger audit_resolutions after insert or update or delete on public.resolutions for each row execute procedure public.process_audit_log();

drop trigger if exists audit_gad on public.gad_beneficiaries;
create trigger audit_gad after insert or update or delete on public.gad_beneficiaries for each row execute procedure public.process_audit_log();

drop trigger if exists audit_certificate_requests on public.certificate_requests;
create trigger audit_certificate_requests after insert or update or delete on public.certificate_requests for each row execute procedure public.process_audit_log();

-- ====================================================================
-- 10_rls.sql
-- ====================================================================

-- Enable RLS on all relational and transactional tables
alter table public.profiles enable row level security;
alter table public.news enable row level security;
alter table public.downloadables enable row level security;
alter table public.tourism_spots enable row level security;
alter table public.officials enable row level security;
alter table public.departments enable row level security;
alter table public.services_cms enable row level security;
alter table public.citizens_charter_cms enable row level security;
alter table public.events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.ordinances enable row level security;
alter table public.resolutions enable row level security;
alter table public.meetings enable row level security;
alter table public.navigation enable row level security;
alter table public.gad_beneficiaries enable row level security;
alter table public.certificate_requests enable row level security;
alter table public.workflow_history enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- 1. Profiles Table Policies
drop policy if exists "Read profiles" on public.profiles;
create policy "Read profiles" on public.profiles for select
  using (auth.uid() is not null);

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles for update
  using (auth.uid() = id or public.is_verified_admin(auth.uid()))
  with check (
    -- If a standard user is updating their own profile, prevent modifying role or is_verified
    (auth.uid() = id 
     and role = (select role from public.profiles where id = auth.uid()) 
     and is_verified = (select is_verified from public.profiles where id = auth.uid()))
    or public.is_verified_admin(auth.uid())
  );

drop policy if exists "Delete profile" on public.profiles;
create policy "Delete profile" on public.profiles for delete
  using (public.is_verified_admin(auth.uid()));

-- 2. General Public Read Access to All CMS Content
drop policy if exists "Public Read on News" on public.news;
create policy "Public Read on News" on public.news for select using (true);

drop policy if exists "Public Read on Downloadables" on public.downloadables;
create policy "Public Read on Downloadables" on public.downloadables for select using (true);

drop policy if exists "Public Read on Tourism Spots" on public.tourism_spots;
create policy "Public Read on Tourism Spots" on public.tourism_spots for select using (true);

drop policy if exists "Public Read on Officials" on public.officials;
create policy "Public Read on Officials" on public.officials for select using (true);

drop policy if exists "Public Read on Departments" on public.departments;
create policy "Public Read on Departments" on public.departments for select using (true);

drop policy if exists "Public Read on Services" on public.services_cms;
create policy "Public Read on Services" on public.services_cms for select using (true);

drop policy if exists "Public Read on Charter" on public.citizens_charter_cms;
create policy "Public Read on Charter" on public.citizens_charter_cms for select using (true);

drop policy if exists "Public Read on Events" on public.events;
create policy "Public Read on Events" on public.events for select using (true);

drop policy if exists "Public Read on Ordinances" on public.ordinances;
create policy "Public Read on Ordinances" on public.ordinances for select using (true);

drop policy if exists "Public Read on Resolutions" on public.resolutions;
create policy "Public Read on Resolutions" on public.resolutions for select using (true);

drop policy if exists "Public Read on Meetings" on public.meetings;
create policy "Public Read on Meetings" on public.meetings for select using (public.is_verified_staff(auth.uid()));

drop policy if exists "Public Read on Navigation" on public.navigation;
create policy "Public Read on Navigation" on public.navigation for select using (true);

-- 3. Operational LGU Staff Write Access to CMS Content
drop policy if exists "Staff Edit on News" on public.news;
create policy "Staff Edit on News" on public.news for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Downloadables" on public.downloadables;
create policy "Staff Edit on Downloadables" on public.downloadables for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Tourism Spots" on public.tourism_spots;
create policy "Staff Edit on Tourism Spots" on public.tourism_spots for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Officials" on public.officials;
create policy "Staff Edit on Officials" on public.officials for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Departments" on public.departments;
create policy "Staff Edit on Departments" on public.departments for all using (public.is_verified_admin(auth.uid()));

drop policy if exists "Staff Edit on Services" on public.services_cms;
create policy "Staff Edit on Services" on public.services_cms for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Charter" on public.citizens_charter_cms;
create policy "Staff Edit on Charter" on public.citizens_charter_cms for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Events" on public.events;
create policy "Staff Edit on Events" on public.events for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Ordinances" on public.ordinances;
create policy "Staff Edit on Ordinances" on public.ordinances for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Resolutions" on public.resolutions;
create policy "Staff Edit on Resolutions" on public.resolutions for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Meetings" on public.meetings;
create policy "Staff Edit on Meetings" on public.meetings for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Staff Edit on Navigation" on public.navigation;
create policy "Staff Edit on Navigation" on public.navigation for all using (public.is_verified_staff(auth.uid()));

-- 4. Certificate Requests, Payments & Workflow History RLS
drop policy if exists "Allow public to submit applications" on public.certificate_requests;
create policy "Allow public to submit applications" on public.certificate_requests for insert with check (true);

drop policy if exists "Allow public to search own application" on public.certificate_requests;
create policy "Allow public to search own application" on public.certificate_requests for select 
  using (
    (auth.uid() is not null and (
      email = (select email from public.profiles where id = auth.uid() limit 1)
      or email = auth.jwt()->>'email'
    ))
    or public.is_verified_staff(auth.uid())
  );

drop policy if exists "Staff control on certificate requests" on public.certificate_requests;
create policy "Staff control on certificate requests" on public.certificate_requests for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "View workflow history" on public.workflow_history;
create policy "View workflow history" on public.workflow_history for select 
  using (
    (auth.uid() is not null and exists (
      select 1 from public.certificate_requests cr 
      where cr.id = workflow_history.request_id 
      and (
        cr.email = auth.jwt()->>'email' 
        or cr.email = (select email from public.profiles where id = auth.uid() limit 1)
      )
    ))
    or public.is_verified_staff(auth.uid())
  );

drop policy if exists "Staff modify workflow history" on public.workflow_history;
create policy "Staff modify workflow history" on public.workflow_history for all using (public.is_verified_staff(auth.uid()));

drop policy if exists "Allow view payments" on public.payments;
create policy "Allow view payments" on public.payments for select 
  using (
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

drop policy if exists "Allow verified staff to process payments" on public.payments;
create policy "Allow verified staff to process payments" on public.payments for all using (public.is_verified_staff(auth.uid()));

-- 5. Notifications RLS (Filtered strictly to User Department, Specific user_id, or Broadcasts)
drop policy if exists "Read notifications" on public.notifications;
create policy "Read notifications" on public.notifications for select using (
  auth.uid() is not null and (
    user_id = auth.uid()
    or department_id is null
    or department_id = public.get_user_department(auth.uid())
    or public.is_verified_admin(auth.uid())
  )
);

drop policy if exists "Modify notifications" on public.notifications;
create policy "Modify notifications" on public.notifications for all using (
  public.is_verified_staff(auth.uid()) or user_id = auth.uid()
);

-- 6. Audit Logs RLS (Writeable by anyone, readable only by administrators)
drop policy if exists "Read audit logs" on public.audit_logs;
create policy "Read audit logs" on public.audit_logs for select using (public.is_verified_admin(auth.uid()));

drop policy if exists "Write audit logs" on public.audit_logs;
create policy "Write audit logs" on public.audit_logs for insert with check (
  auth.uid() is not null and (
    user_email = auth.jwt()->>'email'
    or user_email = (select email from public.profiles where id = auth.uid() limit 1)
    or public.is_verified_staff(auth.uid())
  )
);

-- 7. GAD Beneficiaries Table RLS
drop policy if exists "Read GAD beneficiaries" on public.gad_beneficiaries;
create policy "Read GAD beneficiaries" on public.gad_beneficiaries for select 
  using (
    public.is_verified_staff(auth.uid())
    or (auth.uid() is not null and full_name = (select full_name from public.profiles where id = auth.uid() limit 1))
  );

drop policy if exists "Modify GAD beneficiaries" on public.gad_beneficiaries;
create policy "Modify GAD beneficiaries" on public.gad_beneficiaries for all using (public.is_verified_staff(auth.uid()));

-- ====================================================================
-- 11_indexes.sql
-- ====================================================================

-- Relational, Join, and Filter Column Indexes (B-Tree)
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_barangay on public.profiles(barangay_id);
create index if not exists idx_profiles_department on public.profiles(department_id);
create index if not exists idx_profiles_verification on public.profiles(is_verified);

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

-- Trigram Text GIN Indexes for Search Performance
create index if not exists idx_news_title_trgm on public.news using gin (title gin_trgm_ops);
create index if not exists idx_news_content_trgm on public.news using gin (content gin_trgm_ops);
create index if not exists idx_ordinances_title_trgm on public.ordinances using gin (title gin_trgm_ops);
create index if not exists idx_resolutions_title_trgm on public.resolutions using gin (title gin_trgm_ops);
create index if not exists idx_services_cms_name_trgm on public.services_cms using gin (name gin_trgm_ops);

-- ====================================================================
-- 12_rpc_workflows.sql (Exposes secure transactions as API endpoints)
-- ====================================================================

-- 1. Approve/Verify a Guest Profile
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

-- 2. Publish a News Article
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

-- 3. Submit a Certificate Request with Auto-Generated Ticket ID
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

-- 4. Transition Request Status and Log Remarks inside a Single Transaction
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

  -- Timeline is logged by trigger, append the customized remarks
  update public.workflow_history
  set remarks = p_remarks
  where request_id = p_request_id and status = p_status;

  return to_jsonb(v_updated_request);
end;
$$ language plpgsql security definer set search_path = public;

-- 5. Mark Notification as Read
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

-- 6. Secure Public Request Status Tracker (Security Definer to bypass Select RLS)
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
-- 13_seed.sql
-- ====================================================================

-- Seed initial master roles
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

-- Seed the 25 official barangays of Talibon, Bohol
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

-- Seed key LGU departments
insert into public.departments (id, name, official_name, description, head_of_office, contact_number, email, location) values
  ('bplo', 'Business Permit & Licensing Office', 'Business Permit & Licensing Office', 'Manages business permits, certifications, zoning compliance, and commercial records.', 'Mrs. Jane Aurestila-Garcia', '+63 912 345 6789', 'bplo@talibon.gov.ph', 'Ground Floor, Executive Building'),
  ('treasury', 'Municipal Treasury Office', 'Office of the Municipal Treasurer', 'Collects local fees, taxes, permit charges, and manages municipal funds.', 'Mr. Roberto Castro', '+63 923 456 7890', 'treasurer@talibon.gov.ph', 'Ground Floor, Annex Building'),
  ('assessor', 'Municipal Assessor Office', 'Office of the Municipal Assessor', 'Real property valuations, real estate tax mapping, and land titling archives.', 'Engr. Manuel Santos', '+63 934 567 8901', 'assessor@talibon.gov.ph', 'Second Floor, Executive Building'),
  ('mpdo', 'Planning & Development Office', 'Municipal Planning & Development Office', 'Town spatial planning, infrastructure mapping, and socio-economic profiling.', 'Arch. Teresa Lim', '+63 945 678 9012', 'mpdo@talibon.gov.ph', 'Second Floor, Executive Building'),
  ('mayor', 'Office of the Mayor', 'Office of the Municipal Mayor', 'Chief executive administration of the Municipality of Talibon.', 'Hon. Janette Aurestila-Garcia', '+63 38 515 9001', 'mayor@talibon.gov.ph', 'Second Floor, Executive Building'),
  ('sb', 'Sangguniang Bayan Office', 'Office of the Sangguniang Bayan Secretary', 'Legislative chamber enacting local policies, municipal resolutions, and laws.', 'Atty. Victoriano Alcantara', '+63 38 515 9002', 'sb@talibon.gov.ph', 'Legislative Hall, Session Building'),
  ('tourism', 'Municipal Tourism Office', 'Office of the Municipal Tourism Officer', 'Promoting historical, ecological, and marine heritage of Talibon.', 'Mr. Christopher Mendez', '+63 956 789 0123', 'tourism@talibon.gov.ph', 'Tourism Desk, Public Plaza'),
  ('health', 'Municipal Health Office', 'Municipal Health Office & Rural Health Unit', 'Provides public diagnostics, immunization, sanitation inspections, and consultations.', 'Dr. Helen Joy Almeda, M.D.', '+63 967 890 1234', 'mho@talibon.gov.ph', 'Rural Health Unit Compound, San Jose'),
  ('eng', 'Municipal Engineering Office', 'Office of the Municipal Engineer', 'Overseeing public infrastructures development, building permits approval, and checks.', 'Engr. Rodolfo Ramirez', '+63 978 901 2345', 'engineering@talibon.gov.ph', 'Ground Floor, Engineering Building'),
  ('social', 'Social Welfare & Development', 'Municipal Social Welfare & Development Office', 'Coordination of Gender and Development (GAD), Senior Citizens, and aid distributions.', 'Mrs. Corazon Valenzuela', '+63 989 012 3456', 'mswd@talibon.gov.ph', 'Ground Floor, Social Services Center')
on conflict (id) do update set name = excluded.name, official_name = excluded.official_name, description = excluded.description;

-- ====================================================================
-- SECURE INITIAL SUPER ADMIN PROMOTION SCRIPT (FOR FRESH DEPLOYMENTS)
-- ====================================================================
--
-- INSTRUCTIONS FOR FIRST-TIME SETUP:
-- 1. Sign up a new user through your application's user interface (e.g. using Supabase Auth signup).
-- 2. Once the user is registered, their profile is automatically created in public.profiles with the default 'guest' role.
-- 3. Execute the SQL script below in the Supabase SQL Editor, replacing 'admin@example.com' with the registered admin's email.
--
-- This script safely promotes the user to 'super_admin' and marks them as verified:
--
-- UPDATE public.profiles
-- SET 
--   role = 'super_admin',
--   is_verified = true,
--   updated_at = now()
-- WHERE email = 'your-admin-email@talibon.gov.ph';
--

-- ====================================================================
-- 14_views.sql
-- ====================================================================

-- 1. Dashboard Aggregate Stats View
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

-- 2. Monthly Request statistics Breakdown
create or replace view public.view_monthly_request_stats as
select
  to_char(submitted_at, 'YYYY-MM') as month,
  document_type,
  status,
  count(*) as total_requests
from public.certificate_requests
group by month, document_type, status
order by month desc;

-- 3. GAD Sectoral Gender Statistics Breakdown
create or replace view public.view_gad_sectoral_stats as
select
  sex,
  civil_status,
  count(*) as count
from public.gad_beneficiaries
group by sex, civil_status;

-- ====================================================================
-- 15_verification.sql
-- ====================================================================
-- Double check and report active database structures
select table_name, table_type 
from information_schema.tables 
where table_schema = 'public' 
and table_type = 'BASE TABLE'
order by table_name;
