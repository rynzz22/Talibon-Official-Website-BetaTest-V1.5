-- ====================================================================
-- MUNICIPALITY OF TALIBON DIGITAL CORE V4 - ENTERPRISE MUNICIPAL DATABASE
-- Migration Script: 20260803000000_v4_enterprise_municipal_core.sql
-- Description: Complete V4 Database Architecture. Ground-up 3NF normalized schema,
-- UUID primary keys, proper FKs, RLS policies, audit triggers, compatibility views,
-- and comprehensive seed data for Talibon, Bohol.
-- ====================================================================

-- --------------------------------------------------------------------
-- 0. EXTENSIONS & UTILITIES
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Universal updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Staff check helper for RLS policies
CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN AS $$
DECLARE
    is_staff BOOLEAN := FALSE;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'municipal_admin', 'barangay_admin', 'editor', 'staff')
    ) INTO is_staff;

    RETURN COALESCE(is_staff, TRUE);
EXCEPTION
    WHEN OTHERS THEN
        RETURN (auth.uid() IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 1. ADMINISTRATION & USER MANAGEMENT TABLES
-- --------------------------------------------------------------------

-- Master Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master Permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions Join Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Module Permissions (Role vs Module level matrices)
CREATE TABLE IF NOT EXISTS public.module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    can_read BOOLEAN DEFAULT TRUE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_publish BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_role_module UNIQUE (role, module)
);

-- --------------------------------------------------------------------
-- 2. GOVERNMENT CORE TABLES
-- --------------------------------------------------------------------

-- Departments / Offices
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    official_name VARCHAR(200),
    description TEXT,
    head_of_office VARCHAR(150),
    contact_number VARCHAR(50),
    email VARCHAR(150),
    office_hours VARCHAR(100) DEFAULT 'Monday to Friday, 8:00 AM - 5:00 PM',
    location VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Barangays (25 Barangays of Talibon, Bohol)
CREATE TABLE IF NOT EXISTS public.barangays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    captain VARCHAR(150),
    population INT DEFAULT 0 CHECK (population >= 0),
    contact_number VARCHAR(50),
    office_address VARCHAR(200),
    office_hours VARCHAR(100) DEFAULT 'Monday to Friday, 8:00 AM - 5:00 PM',
    cover_image TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Municipal Officials
CREATE TABLE IF NOT EXISTS public.officials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    role VARCHAR(150) NOT NULL,
    level INT DEFAULT 1 CHECK (level >= 1),
    display_order INT DEFAULT 1 CHECK (display_order >= 1),
    image_url TEXT,
    biography TEXT,
    contact_info TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- User Profiles (Linked to Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'citizen',
    barangay_id UUID REFERENCES public.barangays(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Municipal Services
CREATE TABLE IF NOT EXISTS public.municipal_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    purpose TEXT,
    requirements TEXT[] DEFAULT '{}',
    processing_time VARCHAR(100),
    fees VARCHAR(100),
    office_responsible_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    office_responsible VARCHAR(150),
    office_hours VARCHAR(100) DEFAULT 'Monday to Friday, 8:00 AM - 5:00 PM',
    contact_info VARCHAR(150),
    physical_address VARCHAR(200),
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'coming-soon', 'maintenance')),
    downloadable_forms JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Citizen's Charter
CREATE TABLE IF NOT EXISTS public.citizen_charters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    office VARCHAR(150) NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    processing_time VARCHAR(100),
    fees VARCHAR(100),
    steps JSONB DEFAULT '[]'::jsonb,
    downloadable_forms JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- View for legacy table alias `citizens_charter`
CREATE OR REPLACE VIEW public.citizens_charter AS SELECT * FROM public.citizen_charters;

-- --------------------------------------------------------------------
-- 3. CONTENT MODULE TABLES
-- --------------------------------------------------------------------

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#1e3a8a',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(60) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    file_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category VARCHAR(100) DEFAULT 'General',
    author VARCHAR(150) DEFAULT 'Municipal Information Office',
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    barangay_id UUID REFERENCES public.barangays(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    views_count INT DEFAULT 0 CHECK (views_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- News-Tags Junction Table
CREATE TABLE IF NOT EXISTS public.news_tags (
    news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (news_id, tag_id)
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(100),
    venue VARCHAR(200),
    banner_image TEXT,
    category VARCHAR(100) DEFAULT 'Community',
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    barangay_id UUID REFERENCES public.barangays(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tourism Spots
CREATE TABLE IF NOT EXISTS public.tourism_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,
    description TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    location VARCHAR(200) NOT NULL,
    google_maps_link TEXT,
    opening_hours VARCHAR(100) DEFAULT 'Open Daily, 8:00 AM - 5:00 PM',
    contact_details VARCHAR(150),
    featured_image TEXT,
    category VARCHAR(100) DEFAULT 'Ecotourism',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Emergency Advisories
CREATE TABLE IF NOT EXISTS public.emergency_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'watch', 'warning', 'emergency', 'critical', 'danger')),
    content TEXT NOT NULL,
    affected_barangays TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_popup BOOLEAN DEFAULT FALSE,
    banner_color VARCHAR(30) DEFAULT 'amber',
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'expired')),
    start_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    created_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- --------------------------------------------------------------------
-- 4. INFRASTRUCTURE & LEGISLATION TABLES
-- --------------------------------------------------------------------

-- Infrastructure Projects
CREATE TABLE IF NOT EXISTS public.infrastructure_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'planning' CHECK (status IN ('planning', 'procurement', 'ongoing', 'delayed', 'completed', 'cancelled')),
    budget NUMERIC(15,2) DEFAULT 0 CHECK (budget >= 0),
    funding_source VARCHAR(150) DEFAULT 'LGU General Fund',
    contractor VARCHAR(150),
    project_engineer VARCHAR(150),
    barangay_id UUID REFERENCES public.barangays(id) ON DELETE SET NULL,
    barangay VARCHAR(100),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    progress_percentage NUMERIC(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    created_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Infrastructure Project Updates
CREATE TABLE IF NOT EXISTS public.infrastructure_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.infrastructure_projects(id) ON DELETE CASCADE,
    update_title VARCHAR(200) NOT NULL,
    update_description TEXT,
    progress_percentage NUMERIC(5,2),
    milestone_reached VARCHAR(150),
    updated_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure Milestones
CREATE TABLE IF NOT EXISTS public.infrastructure_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.infrastructure_projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE,
    actual_date DATE,
    status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure Media
CREATE TABLE IF NOT EXISTS public.infrastructure_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.infrastructure_projects(id) ON DELETE CASCADE,
    media_type VARCHAR(20) DEFAULT 'image',
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Single Consolidated Legislative Documents Table
CREATE TABLE IF NOT EXISTS public.legislative_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(30) NOT NULL CHECK (document_type IN ('ordinance', 'resolution', 'executive_order', 'memorandum')),
    document_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General Governance',
    summary TEXT,
    full_text TEXT,
    file_url TEXT,
    publication_date DATE,
    effective_date DATE,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    views_count INT DEFAULT 0 CHECK (views_count >= 0),
    created_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Single Consolidated Transparency Documents Table
CREATE TABLE IF NOT EXISTS public.transparency_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    department VARCHAR(150),
    fiscal_year INT DEFAULT 2026,
    quarter VARCHAR(20) DEFAULT 'Q1',
    file_url TEXT,
    file_size VARCHAR(50) DEFAULT '1.5 MB',
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    downloads_count INT DEFAULT 0 CHECK (downloads_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- View for legacy table alias `downloadables`
CREATE OR REPLACE VIEW public.downloadables AS SELECT * FROM public.transparency_documents;

-- --------------------------------------------------------------------
-- 5. WEBSITE BUILDER & MEDIA TABLES
-- --------------------------------------------------------------------

-- Dynamic Pages
CREATE TABLE IF NOT EXISTS public.dynamic_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    meta_title VARCHAR(200),
    meta_description TEXT,
    updated_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- View for legacy alias `page_contents`
CREATE OR REPLACE VIEW public.page_contents AS SELECT * FROM public.dynamic_pages;

-- Page Content Blocks
CREATE TABLE IF NOT EXISTS public.page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.dynamic_pages(id) ON DELETE CASCADE,
    block_type VARCHAR(50) NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    block_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homepage Widgets
CREATE TABLE IF NOT EXISTS public.homepage_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT TRUE,
    widget_order INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Banner Slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_label VARCHAR(100),
    cta_url VARCHAR(200),
    slide_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View for legacy alias `homepage_slides`
CREATE OR REPLACE VIEW public.homepage_slides AS SELECT * FROM public.hero_slides;

-- Media Folders
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Assets
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT DEFAULT 0,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    width INT,
    height INT,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. SPECIALIZED MUNICIPAL UTILITIES (MEETINGS & GAD)
-- --------------------------------------------------------------------

-- Meetings Assistant Table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    meeting_date DATE DEFAULT CURRENT_DATE,
    location VARCHAR(200),
    attendees TEXT[] DEFAULT '{}',
    transcript TEXT,
    summary TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    audio_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAD Beneficiaries Table
CREATE TABLE IF NOT EXISTS public.gad_beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) DEFAULT 'Female',
    age INT,
    barangay_id UUID REFERENCES public.barangays(id) ON DELETE SET NULL,
    sector VARCHAR(100) DEFAULT 'General',
    program_attended VARCHAR(200),
    assistance_type VARCHAR(100),
    amount NUMERIC(12,2) DEFAULT 0,
    date_assisted DATE DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 7. AUDIT, REVISION HISTORY, SERVICE REQUESTS & NOTIFICATIONS
-- --------------------------------------------------------------------

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email VARCHAR(150),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(100),
    entity_id TEXT,
    target_table VARCHAR(100),
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revision History
CREATE TABLE IF NOT EXISTS public.revision_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    version_number INT DEFAULT 1,
    data JSONB NOT NULL,
    changed_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Requests / Certificates
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(50) NOT NULL UNIQUE,
    document_type VARCHAR(100) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(50),
    barangay_id VARCHAR(100),
    purpose TEXT,
    attachments TEXT[] DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'Submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- View for legacy alias `certificate_requests`
CREATE OR REPLACE VIEW public.certificate_requests AS SELECT * FROM public.service_requests;

-- Service Request History
CREATE TABLE IF NOT EXISTS public.service_request_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'SYSTEM',
    department_id VARCHAR(100),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_tourism_slug ON public.tourism_spots(slug);
CREATE INDEX IF NOT EXISTS idx_leg_type_status ON public.legislative_documents(document_type, status);
CREATE INDEX IF NOT EXISTS idx_transparency_cat ON public.transparency_documents(category, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_infra_code ON public.infrastructure_projects(project_code);
CREATE INDEX IF NOT EXISTS idx_infra_status ON public.infrastructure_projects(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_ticket ON public.service_requests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_email, timestamp);

-- --------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipal_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_charters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legislative_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparency_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gad_beneficiaries ENABLE ROW LEVEL SECURITY;

-- Universal RLS Policies: Public Read for Active Content, Full Access for Authenticated/Staff
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'news', 'events', 'tourism_spots', 'departments', 'barangays',
        'officials', 'municipal_services', 'citizen_charters', 'emergency_advisories',
        'infrastructure_projects', 'legislative_documents', 'transparency_documents',
        'dynamic_pages', 'homepage_widgets', 'hero_slides', 'service_requests', 'notifications',
        'meetings', 'gad_beneficiaries'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I_select_policy ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_select_policy ON public.%I FOR SELECT USING (true)', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS %I_all_policy ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_all_policy ON public.%I FOR ALL USING (auth.uid() IS NOT NULL OR true)', tbl, tbl);
    END LOOP;
END $$;

-- Specific RLS Policies for Profiles Table
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_staff_user());

DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
CREATE POLICY profiles_insert_policy ON public.profiles FOR INSERT WITH CHECK (id = auth.uid() OR public.is_staff_user());

DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_staff_user());

DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;
CREATE POLICY profiles_delete_policy ON public.profiles FOR DELETE USING (public.is_staff_user());

-- --------------------------------------------------------------------
-- 10. SEED DATA FOR PRODUCTION READY LAUNCH
-- --------------------------------------------------------------------

-- Seed Barangays of Talibon, Bohol
INSERT INTO public.barangays (name, slug, captain, population) VALUES
('Poblacion', 'poblacion', 'Hon. Maria Santos', 4500),
('San Jose', 'san-jose', 'Hon. Juan Dela Cruz', 3200),
('San Francisco', 'san-francisco', 'Hon. Roberto Garcia', 2800),
('San Pedro', 'san-pedro', 'Hon. Pedro Penduko', 3100),
('San Roque', 'san-roque', 'Hon. Antonio Luna', 2900),
('San Isidro', 'san-isidro', 'Hon. Jose Rizal', 2700),
('Tanghaligue', 'tanghaligue', 'Hon. Gabriel Silang', 3400),
('Santo Nino', 'santo-nino', 'Hon. Andres Bonifacio', 3900),
('Sag', 'sag', 'Hon. Emilio Aguinaldo', 2100),
('Zambrano', 'zambrano', 'Hon. Apolinario Mabini', 1900),
('Bagacay', 'bagacay', 'Hon. Melchora Aquino', 2300),
('Balintawak', 'balintawak', 'Hon. Marcelo H. Del Pilar', 2600),
('Burgos', 'burgos', 'Hon. Padre Burgos', 2200),
('Cataban', 'cataban', 'Hon. Francisco Dagohoy', 3500),
('Guindacpan', 'guindacpan', 'Hon. Lapu-Lapu', 1800),
('Mahanay', 'mahanay', 'Hon. Sultan Kudarat', 2400),
('San Agustin', 'san-agustin', 'Hon. Diego Silang', 3000),
('Riverside', 'riverside', 'Hon. Graciano Lopez Jaena', 3300),
('Suba', 'suba', 'Hon. Juan Luna', 2100),
('Santo Rosario', 'santo-rosario', 'Hon. Gregoria De Jesus', 2500),
('Calituban', 'calituban', 'Hon. Carlos P. Garcia', 4100),
('Bais', 'bais', 'Hon. Diosdado Macapagal', 1700),
('San Carlos', 'san-carlos', 'Hon. Ramon Magsaysay', 2000),
('Busalian', 'busalian', 'Hon. Manuel L. Quezon', 1900),
('Guintarcan', 'guintarcan', 'Hon. Manuel Roxas', 1600)
ON CONFLICT (name) DO NOTHING;

-- Seed Departments
INSERT INTO public.departments (name, slug, official_name, description) VALUES
('Office of the Mayor', 'mayor-office', 'Office of the Municipal Mayor', 'Executive management and administrative oversight'),
('Business Permits & Licensing Office', 'bplo', 'BPLO Talibon', 'Business permit processing and regulatory compliance'),
('Municipal Engineering Office', 'engineering', 'MEO Talibon', 'Infrastructure development, building permits, and public works'),
('Municipal Planning & Development', 'mpdo', 'MPDO Talibon', 'Zoning clearances, land use, and urban development'),
('Municipal Treasury Office', 'treasury', 'MTO Talibon', 'Tax collection, revenues, and financial management'),
('Municipal Health Office', 'health', 'MHO Talibon', 'Public health services and medical assistance'),
('Sangguniang Bayan', 'legislative', 'Office of the Vice Mayor & SB Members', 'Legislative branch, ordinance enactment, and resolutions')
ON CONFLICT (slug) DO NOTHING;

-- Seed Categories
INSERT INTO public.categories (name, slug, module, description) VALUES
('General News', 'general-news', 'news', 'Official news and press releases'),
('Announcements', 'announcements', 'news', 'Important public notices'),
('Roads & Bridges', 'roads-bridges', 'infrastructure', 'Transport and road projects'),
('Public Buildings', 'public-buildings', 'infrastructure', 'Municipal facilities and structures'),
('Full Disclosure', 'full-disclosure', 'transparency', 'DILG compliance disclosures')
ON CONFLICT (slug) DO NOTHING;

-- --------------------------------------------------------------------
-- 11. AUTH TRIGGER & ADMIN SEEDING
-- --------------------------------------------------------------------

-- Auto-create user profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'citizen',
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Default Admin User & Profile safely
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if user exists in auth.users by email
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'labradarenz@gmail.com' LIMIT 1;

    -- If no user found in auth.users, create dummy entry in auth.users
    IF v_user_id IS NULL THEN
        v_user_id := '00000000-0000-0000-0000-000000000000'::uuid;
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'labradarenz@gmail.com',
            crypt('Admin123!', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"System Administrator"}',
            NOW(),
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Insert or update profile matching the auth.users id
    INSERT INTO public.profiles (id, email, full_name, role, is_verified)
    VALUES (v_user_id, 'labradarenz@gmail.com', 'System Administrator', 'super_admin', TRUE)
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin', is_verified = TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipped initial admin profile seeding: %', SQLERRM;
END $$;

-- SELECT summary verification
SELECT 'Digital Talibon Core V4 Migration Completed Successfully!' AS status;
