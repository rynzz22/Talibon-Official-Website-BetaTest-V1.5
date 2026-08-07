-- ====================================================================
-- MUNICIPALITY OF TALIBON DIGITAL CORE - VERSION 3 ENTERPRISE CMS
-- Migration Script: 20260802000000_v3_municipal_cms_architecture.sql
-- Description: Zero-Downtime, Additive, Fully Defensively Audited Schema
-- ====================================================================

-- --------------------------------------------------------------------
-- 0. UTILITY FUNCTIONS, SECURITY PROCEDURES & AUDIT ENGINE
-- --------------------------------------------------------------------

-- Universal timestamp update trigger procedure
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Staff check helper for resilient RLS policy evaluation
CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN AS $$
DECLARE
    has_profiles BOOLEAN;
    has_role_col BOOLEAN;
    is_staff BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO has_profiles;
    
    IF NOT has_profiles THEN
        RETURN (auth.uid() IS NOT NULL);
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) INTO has_role_col;

    IF has_role_col THEN
        EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = $1 AND role IN (''admin'', ''staff'', ''editor''))'
        INTO is_staff
        USING auth.uid();
        RETURN is_staff;
    ELSE
        RETURN (auth.uid() IS NOT NULL);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN (auth.uid() IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Centralized Audit Logs Table (Created defensively)
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

-- Ensure all required audit_logs columns exist defensively
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'user_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN user_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'user_email') THEN
        ALTER TABLE public.audit_logs ADD COLUMN user_email VARCHAR(150);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'entity') THEN
        ALTER TABLE public.audit_logs ADD COLUMN entity VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'entity_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN entity_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'target_table') THEN
        ALTER TABLE public.audit_logs ADD COLUMN target_table VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'target_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN target_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'details') THEN
        ALTER TABLE public.audit_logs ADD COLUMN details JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'timestamp') THEN
        ALTER TABLE public.audit_logs ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Universal Audit Log Trigger procedure
CREATE OR REPLACE FUNCTION public.log_cms_change_trigger()
RETURNS TRIGGER AS $$
DECLARE
    acting_user UUID;
BEGIN
    acting_user := auth.uid();
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity,
        entity_id,
        target_table,
        target_id,
        details,
        timestamp
    ) VALUES (
        acting_user,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'record_state', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END
        ),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 1. UNIVERSAL TAXONOMY & REUSABLE LOOKUPS
-- --------------------------------------------------------------------
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
COMMENT ON TABLE public.categories IS 'Centralized reusable lookup categories for CMS modules';

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(60) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.tags IS 'Global tagging taxonomy';

-- --------------------------------------------------------------------
-- 2. EXTEND CORE PRODUCTION TABLES (DEFENSIVE & ADDITIVE ONLY)
-- --------------------------------------------------------------------

-- Extend public.news defensively if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'status') THEN
            ALTER TABLE public.news ADD COLUMN status VARCHAR(20) DEFAULT 'published';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'summary') THEN
            ALTER TABLE public.news ADD COLUMN summary TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'is_pinned') THEN
            ALTER TABLE public.news ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'is_featured') THEN
            ALTER TABLE public.news ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'pinned_until') THEN
            ALTER TABLE public.news ADD COLUMN pinned_until TIMESTAMPTZ;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'scheduled_at') THEN
            ALTER TABLE public.news ADD COLUMN scheduled_at TIMESTAMPTZ;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'expires_at') THEN
            ALTER TABLE public.news ADD COLUMN expires_at TIMESTAMPTZ;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'published_at') THEN
            ALTER TABLE public.news ADD COLUMN published_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'seo_title') THEN
            ALTER TABLE public.news ADD COLUMN seo_title VARCHAR(150);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'seo_description') THEN
            ALTER TABLE public.news ADD COLUMN seo_description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'tags') THEN
            ALTER TABLE public.news ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'version') THEN
            ALTER TABLE public.news ADD COLUMN version INT DEFAULT 1;
        END IF;
    END IF;
END $$;

-- Extend public.events defensively if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'status') THEN
            ALTER TABLE public.events ADD COLUMN status VARCHAR(20) DEFAULT 'published';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_featured') THEN
            ALTER TABLE public.events ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_recurring') THEN
            ALTER TABLE public.events ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'recurrence_rule') THEN
            ALTER TABLE public.events ADD COLUMN recurrence_rule VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'venue_capacity') THEN
            ALTER TABLE public.events ADD COLUMN venue_capacity INT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'registration_url') THEN
            ALTER TABLE public.events ADD COLUMN registration_url TEXT;
        END IF;
    END IF;
END $$;

-- Extend public.tourism_spots defensively if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tourism_spots') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'status') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN status VARCHAR(20) DEFAULT 'published';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'is_featured') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'opening_hours') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN opening_hours VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'contact_phone') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN contact_phone VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'contact_email') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN contact_email VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'entry_fee') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN entry_fee VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'amenities') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN amenities TEXT[] DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tourism_spots' AND column_name = 'gallery_urls') THEN
            ALTER TABLE public.tourism_spots ADD COLUMN gallery_urls TEXT[] DEFAULT '{}';
        END IF;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 3. STANDALONE EMERGENCY ADVISORIES MODULE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'warning',
    content TEXT NOT NULL,
    affected_barangays TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_popup BOOLEAN DEFAULT FALSE,
    banner_color VARCHAR(30) DEFAULT 'amber',
    status VARCHAR(20) DEFAULT 'published',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.emergency_advisories IS 'Standalone public safety emergency advisory system';

-- --------------------------------------------------------------------
-- 4. ENTERPRISE INFRASTRUCTURE PROJECTS MODULE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.infrastructure_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(50) UNIQUE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'ongoing',
    budget NUMERIC(15, 2) DEFAULT 0.00,
    funding_source VARCHAR(100),
    contractor VARCHAR(150),
    project_engineer VARCHAR(150),
    barangay VARCHAR(100),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.infrastructure_projects IS 'Enterprise infrastructure project tracker';

CREATE TABLE IF NOT EXISTS public.infrastructure_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.infrastructure_projects(id) ON DELETE CASCADE,
    update_title VARCHAR(150) NOT NULL,
    update_description TEXT,
    progress_percentage INT CHECK (progress_percentage BETWEEN 0 AND 100),
    milestone_reached VARCHAR(100),
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.infrastructure_projects(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image',
    caption VARCHAR(200),
    is_before_photo BOOLEAN DEFAULT FALSE,
    is_after_photo BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. CONSOLIDATED LEGISLATIVE & TRANSPARENCY MODULES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.legislative_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(30) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    title VARCHAR(250) NOT NULL,
    category VARCHAR(80),
    summary TEXT,
    full_text TEXT,
    file_url TEXT,
    publication_date DATE,
    effective_date DATE,
    status VARCHAR(20) DEFAULT 'published',
    views_count INT DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.legislative_documents IS 'Unified municipal ordinances, resolutions, and executive orders';

CREATE TABLE IF NOT EXISTS public.transparency_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    fiscal_year INT NOT NULL,
    quarter VARCHAR(10),
    department_id TEXT,
    document_number VARCHAR(50),
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    status VARCHAR(20) DEFAULT 'published',
    downloads_count INT DEFAULT 0,
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.transparency_documents IS 'Structured Full Disclosure Policy and financial transparency records';

-- --------------------------------------------------------------------
-- 6. MEDIA LIBRARY & ASSET REGISTRY
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES public.media_folders(id) ON DELETE CASCADE,
    path VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES public.media_folders(id) ON DELETE SET NULL,
    filename VARCHAR(200) NOT NULL,
    original_name VARCHAR(200) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    public_url TEXT NOT NULL,
    alt_text VARCHAR(200),
    caption TEXT,
    width INT,
    height INT,
    file_hash VARCHAR(64),
    usage_count INT DEFAULT 0,
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.media_assets IS 'Centralized digital media asset registry';

-- --------------------------------------------------------------------
-- 7. DYNAMIC PAGES & REUSABLE PAGE BLOCKS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    status VARCHAR(20) DEFAULT 'published',
    meta_title VARCHAR(150),
    meta_description TEXT,
    updated_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.page_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.page_contents(id) ON DELETE CASCADE,
    block_type VARCHAR(30) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    block_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 8. WIDGET-DRIVEN HOMEPAGE CMS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homepage_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_type VARCHAR(50) NOT NULL,
    title VARCHAR(150),
    subtitle TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT TRUE,
    widget_order INT DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homepage_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_label VARCHAR(50),
    cta_url TEXT,
    slide_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 9. GRANULAR PERMISSIONS MATRIX
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(30) NOT NULL,
    module VARCHAR(50) NOT NULL,
    can_read BOOLEAN DEFAULT TRUE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_publish BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, module)
);

-- --------------------------------------------------------------------
-- 10. REVISION HISTORY TABLE FOR AUDIT & RESTORE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    version_number INT NOT NULL,
    record_state JSONB NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 11. DYNAMIC FOREIGN KEY ATTACHMENTS & TYPE ADAPTATION
-- --------------------------------------------------------------------
DO $$
DECLARE
    dept_id_type TEXT;
    has_depts BOOLEAN;
    has_profiles BOOLEAN;
    profiles_id_type TEXT;
BEGIN
    -- Adapt transparency_documents.department_id to match public.departments.id if exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'departments'
    ) INTO has_depts;

    IF has_depts THEN
        SELECT data_type INTO dept_id_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'departments' AND column_name = 'id';

        IF dept_id_type = 'uuid' THEN
            ALTER TABLE public.transparency_documents ALTER COLUMN department_id TYPE UUID USING department_id::uuid;
        ELSE
            ALTER TABLE public.transparency_documents ALTER COLUMN department_id TYPE TEXT USING department_id::text;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
              AND table_name = 'transparency_documents' 
              AND constraint_name = 'fk_transparency_documents_department'
        ) THEN
            ALTER TABLE public.transparency_documents 
            ADD CONSTRAINT fk_transparency_documents_department 
            FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- Attach profiles FK dynamically if public.profiles exists and id is UUID
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO has_profiles;

    IF has_profiles THEN
        SELECT data_type INTO profiles_id_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id';

        IF profiles_id_type = 'uuid' THEN
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_advisories_created_by') THEN
                ALTER TABLE public.emergency_advisories ADD CONSTRAINT fk_advisories_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_projects_created_by') THEN
                ALTER TABLE public.infrastructure_projects ADD CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_legislative_created_by') THEN
                ALTER TABLE public.legislative_documents ADD CONSTRAINT fk_legislative_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_transparency_uploaded_by') THEN
                ALTER TABLE public.transparency_documents ADD CONSTRAINT fk_transparency_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
            END IF;
        END IF;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 12. TRIGGER ATTACHMENTS (UPDATED_AT & AUDIT LOGS)
-- --------------------------------------------------------------------
DO $$
BEGIN
    -- set_updated_at triggers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
        CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergency_advisories') THEN
        DROP TRIGGER IF EXISTS trg_emergency_advisories_updated_at ON public.emergency_advisories;
        CREATE TRIGGER trg_emergency_advisories_updated_at BEFORE UPDATE ON public.emergency_advisories FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'infrastructure_projects') THEN
        DROP TRIGGER IF EXISTS trg_infrastructure_projects_updated_at ON public.infrastructure_projects;
        CREATE TRIGGER trg_infrastructure_projects_updated_at BEFORE UPDATE ON public.infrastructure_projects FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legislative_documents') THEN
        DROP TRIGGER IF EXISTS trg_legislative_documents_updated_at ON public.legislative_documents;
        CREATE TRIGGER trg_legislative_documents_updated_at BEFORE UPDATE ON public.legislative_documents FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transparency_documents') THEN
        DROP TRIGGER IF EXISTS trg_transparency_documents_updated_at ON public.transparency_documents;
        CREATE TRIGGER trg_transparency_documents_updated_at BEFORE UPDATE ON public.transparency_documents FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_assets') THEN
        DROP TRIGGER IF EXISTS trg_media_assets_updated_at ON public.media_assets;
        CREATE TRIGGER trg_media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_contents') THEN
        DROP TRIGGER IF EXISTS trg_page_contents_updated_at ON public.page_contents;
        CREATE TRIGGER trg_page_contents_updated_at BEFORE UPDATE ON public.page_contents FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_blocks') THEN
        DROP TRIGGER IF EXISTS trg_page_blocks_updated_at ON public.page_blocks;
        CREATE TRIGGER trg_page_blocks_updated_at BEFORE UPDATE ON public.page_blocks FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'homepage_widgets') THEN
        DROP TRIGGER IF EXISTS trg_homepage_widgets_updated_at ON public.homepage_widgets;
        CREATE TRIGGER trg_homepage_widgets_updated_at BEFORE UPDATE ON public.homepage_widgets FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;

    -- Change audit triggers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergency_advisories') THEN
        DROP TRIGGER IF EXISTS trg_audit_emergency_advisories ON public.emergency_advisories;
        CREATE TRIGGER trg_audit_emergency_advisories AFTER INSERT OR UPDATE OR DELETE ON public.emergency_advisories FOR EACH ROW EXECUTE PROCEDURE public.log_cms_change_trigger();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'infrastructure_projects') THEN
        DROP TRIGGER IF EXISTS trg_audit_infrastructure_projects ON public.infrastructure_projects;
        CREATE TRIGGER trg_audit_infrastructure_projects AFTER INSERT OR UPDATE OR DELETE ON public.infrastructure_projects FOR EACH ROW EXECUTE PROCEDURE public.log_cms_change_trigger();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legislative_documents') THEN
        DROP TRIGGER IF EXISTS trg_audit_legislative_documents ON public.legislative_documents;
        CREATE TRIGGER trg_audit_legislative_documents AFTER INSERT OR UPDATE OR DELETE ON public.legislative_documents FOR EACH ROW EXECUTE PROCEDURE public.log_cms_change_trigger();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transparency_documents') THEN
        DROP TRIGGER IF EXISTS trg_audit_transparency_documents ON public.transparency_documents;
        CREATE TRIGGER trg_audit_transparency_documents AFTER INSERT OR UPDATE OR DELETE ON public.transparency_documents FOR EACH ROW EXECUTE PROCEDURE public.log_cms_change_trigger();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_contents') THEN
        DROP TRIGGER IF EXISTS trg_audit_page_contents ON public.page_contents;
        CREATE TRIGGER trg_audit_page_contents AFTER INSERT OR UPDATE OR DELETE ON public.page_contents FOR EACH ROW EXECUTE PROCEDURE public.log_cms_change_trigger();
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 13. COMPATIBILITY VIEWS (DEFENSIVELY AUDITED)
-- --------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergency_advisories') THEN
        CREATE OR REPLACE VIEW public.view_active_advisories AS
        SELECT *
        FROM public.emergency_advisories
        WHERE status = 'published'
          AND (expiry_date IS NULL OR expiry_date > NOW())
        ORDER BY is_pinned DESC, start_date DESC;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legislative_documents') THEN
        CREATE OR REPLACE VIEW public.view_ordinances AS
        SELECT *
        FROM public.legislative_documents
        WHERE document_type = 'ordinance' AND status = 'published'
        ORDER BY publication_date DESC;

        CREATE OR REPLACE VIEW public.view_resolutions AS
        SELECT *
        FROM public.legislative_documents
        WHERE document_type = 'resolution' AND status = 'published'
        ORDER BY publication_date DESC;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transparency_documents') THEN
        CREATE OR REPLACE VIEW public.view_downloadables_compat AS
        SELECT 
            id,
            title,
            category,
            file_url,
            file_size_bytes as file_size,
            downloads_count,
            created_at
        FROM public.transparency_documents
        WHERE status = 'published';
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 14. INDEXES FOR HIGH-TRAFFIC QUERIES (DEFENSIVE COLUMN CHECK)
-- --------------------------------------------------------------------
DO $$
BEGIN
    -- Index on news (status, published_at / created_at)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'status') AND
           EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'published_at') THEN
            CREATE INDEX IF NOT EXISTS idx_news_status_published ON public.news(status, published_at DESC);
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'status') AND
              EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_news_status_created ON public.news(status, created_at DESC);
        END IF;
    END IF;

    -- Index on emergency_advisories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergency_advisories') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emergency_advisories' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_advisories_active ON public.emergency_advisories(status, is_pinned, start_date DESC);
        END IF;
    END IF;

    -- Index on infrastructure_projects
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'infrastructure_projects') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'infrastructure_projects' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_projects_status ON public.infrastructure_projects(status, barangay);
        END IF;
    END IF;

    -- Index on legislative_documents
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legislative_documents') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'legislative_documents' AND column_name = 'document_type') THEN
            CREATE INDEX IF NOT EXISTS idx_legislative_type_num ON public.legislative_documents(document_type, document_number);
        END IF;
    END IF;

    -- Index on transparency_documents
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transparency_documents') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transparency_documents' AND column_name = 'category') THEN
            CREATE INDEX IF NOT EXISTS idx_transparency_fiscal ON public.transparency_documents(category, fiscal_year);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transparency_documents' AND column_name = 'department_id') THEN
            CREATE INDEX IF NOT EXISTS idx_transparency_dept ON public.transparency_documents(department_id);
        END IF;
    END IF;

    -- Index on media_assets
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_assets') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'media_assets' AND column_name = 'file_hash') THEN
            CREATE INDEX IF NOT EXISTS idx_media_hash ON public.media_assets(file_hash);
        END IF;
    END IF;

    -- Index on page_blocks
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_blocks') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'page_blocks' AND column_name = 'page_id') THEN
            CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON public.page_blocks(page_id, block_order);
        END IF;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
DO $$
BEGIN
    -- Enable RLS defensively
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tags') THEN ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emergency_advisories') THEN ALTER TABLE public.emergency_advisories ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'infrastructure_projects') THEN ALTER TABLE public.infrastructure_projects ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'infrastructure_updates') THEN ALTER TABLE public.infrastructure_updates ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_media') THEN ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legislative_documents') THEN ALTER TABLE public.legislative_documents ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transparency_documents') THEN ALTER TABLE public.transparency_documents ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_folders') THEN ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_assets') THEN ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_contents') THEN ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_blocks') THEN ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'homepage_widgets') THEN ALTER TABLE public.homepage_widgets ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'homepage_slides') THEN ALTER TABLE public.homepage_slides ENABLE ROW LEVEL SECURITY; END IF;
END $$;

-- Public READ Policies
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Tags" ON public.tags;
CREATE POLICY "Public Read Tags" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Emergency Advisories" ON public.emergency_advisories;
CREATE POLICY "Public Read Emergency Advisories" ON public.emergency_advisories FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public Read Infrastructure Projects" ON public.infrastructure_projects;
CREATE POLICY "Public Read Infrastructure Projects" ON public.infrastructure_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Infrastructure Updates" ON public.infrastructure_updates;
CREATE POLICY "Public Read Infrastructure Updates" ON public.infrastructure_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Project Media" ON public.project_media;
CREATE POLICY "Public Read Project Media" ON public.project_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Legislative Documents" ON public.legislative_documents;
CREATE POLICY "Public Read Legislative Documents" ON public.legislative_documents FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public Read Transparency Documents" ON public.transparency_documents;
CREATE POLICY "Public Read Transparency Documents" ON public.transparency_documents FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public Read Page Contents" ON public.page_contents;
CREATE POLICY "Public Read Page Contents" ON public.page_contents FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public Read Page Blocks" ON public.page_blocks;
CREATE POLICY "Public Read Page Blocks" ON public.page_blocks FOR SELECT USING (is_enabled = true);

DROP POLICY IF EXISTS "Public Read Homepage Widgets" ON public.homepage_widgets;
CREATE POLICY "Public Read Homepage Widgets" ON public.homepage_widgets FOR SELECT USING (is_enabled = true);

DROP POLICY IF EXISTS "Public Read Homepage Slides" ON public.homepage_slides;
CREATE POLICY "Public Read Homepage Slides" ON public.homepage_slides FOR SELECT USING (is_enabled = true);

DROP POLICY IF EXISTS "Public Read Media Assets" ON public.media_assets;
CREATE POLICY "Public Read Media Assets" ON public.media_assets FOR SELECT USING (true);

-- Staff Write Policies (Using resilient public.is_staff_user())
DROP POLICY IF EXISTS "Staff CRUD Emergency Advisories" ON public.emergency_advisories;
CREATE POLICY "Staff CRUD Emergency Advisories" ON public.emergency_advisories FOR ALL USING (public.is_staff_user());

DROP POLICY IF EXISTS "Staff CRUD Infrastructure Projects" ON public.infrastructure_projects;
CREATE POLICY "Staff CRUD Infrastructure Projects" ON public.infrastructure_projects FOR ALL USING (public.is_staff_user());

DROP POLICY IF EXISTS "Staff CRUD Legislative Documents" ON public.legislative_documents;
CREATE POLICY "Staff CRUD Legislative Documents" ON public.legislative_documents FOR ALL USING (public.is_staff_user());

DROP POLICY IF EXISTS "Staff CRUD Transparency Documents" ON public.transparency_documents;
CREATE POLICY "Staff CRUD Transparency Documents" ON public.transparency_documents FOR ALL USING (public.is_staff_user());

DROP POLICY IF EXISTS "Staff CRUD Page Contents" ON public.page_contents;
CREATE POLICY "Staff CRUD Page Contents" ON public.page_contents FOR ALL USING (public.is_staff_user());

DROP POLICY IF EXISTS "Staff CRUD Page Blocks" ON public.page_blocks;
CREATE POLICY "Staff CRUD Page Blocks" ON public.page_blocks FOR ALL USING (public.is_staff_user());

DROP POLICY IF EXISTS "Staff CRUD Homepage Widgets" ON public.homepage_widgets;
CREATE POLICY "Staff CRUD Homepage Widgets" ON public.homepage_widgets FOR ALL USING (public.is_staff_user());

DROP POLICY IF EXISTS "Staff CRUD Media Assets" ON public.media_assets;
CREATE POLICY "Staff CRUD Media Assets" ON public.media_assets FOR ALL USING (public.is_staff_user());

-- --------------------------------------------------------------------
-- 16. SEED INITIAL DEFAULT HOMEPAGE WIDGETS
-- --------------------------------------------------------------------
INSERT INTO public.homepage_widgets (widget_type, title, subtitle, is_enabled, widget_order)
VALUES 
    ('hero_banner', 'Welcome to Municipality of Talibon', 'Progressive, Inclusive, and Resilient Coastal Community', true, 1),
    ('advisory_alert', 'Active Emergency Advisories', 'Real-time public safety notifications', true, 2),
    ('news_slider', 'Latest News & Municipal Updates', 'Stay updated with official municipal news', true, 3),
    ('projects_highlight', 'Infrastructure & Public Works', 'Monitoring government projects in real-time', true, 4),
    ('tourism_grid', 'Explore Talibon Tourism', 'Discover natural attractions and cultural heritage', true, 5),
    ('quick_links', 'Public Services & E-Services', 'Access online clearance and civic tools', true, 6)
ON CONFLICT DO NOTHING;
