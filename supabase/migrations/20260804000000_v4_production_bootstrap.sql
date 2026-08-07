-- ====================================================================
-- DIGITAL TALIBON CORE V4 - PRODUCTION BOOTSTRAP SCRIPT
-- Script: 20260804000000_v4_production_bootstrap.sql / PRODUCTION_BOOTSTRAP.sql
-- Description: Initializes production seed data (Roles, Permissions,
-- Departments, Barangays, Categories, Tags), Storage Buckets, Storage RLS Policies,
-- Profile Auto-Creation Triggers, and Super Admin Promotion Utility.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. SEED DEFAULT ROLES & PERMISSIONS
-- --------------------------------------------------------------------

-- Master System Roles
INSERT INTO public.roles (code, name, description, is_system) VALUES
('super_admin', 'Super Administrator', 'Full system access, infrastructure and security settings', TRUE),
('municipal_admin', 'Municipal Administrator', 'Municipal-level administration and system management', TRUE),
('barangay_admin', 'Barangay Administrator', 'Barangay-level content and service request management', TRUE),
('department_head', 'Department Head', 'Departmental management, service review, and approval', TRUE),
('editor', 'Content Editor', 'Manage news, events, tourism spots, and public announcements', TRUE),
('staff', 'LGU Staff', 'Process e-service requests and certificates', TRUE),
('citizen', 'Citizen', 'Standard public portal user account for service applications', TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Master Permissions
INSERT INTO public.permissions (code, module, action, description) VALUES
-- News
('news:read', 'news', 'read', 'View news articles'),
('news:create', 'news', 'create', 'Draft news articles'),
('news:edit', 'news', 'edit', 'Update news articles'),
('news:delete', 'news', 'delete', 'Delete news articles'),
('news:publish', 'news', 'publish', 'Publish news articles live'),

-- Events
('events:read', 'events', 'read', 'View municipality events'),
('events:create', 'events', 'create', 'Create event entries'),
('events:edit', 'events', 'edit', 'Modify event details'),
('events:delete', 'events', 'delete', 'Remove events'),

-- Legislative Documents
('legislative:read', 'legislative', 'read', 'Access ordinances and resolutions'),
('legislative:create', 'legislative', 'create', 'Encode ordinances/resolutions'),
('legislative:edit', 'legislative', 'edit', 'Update legislative entries'),
('legislative:delete', 'legislative', 'delete', 'Soft-delete legislative entries'),

-- E-Services & Certificates
('services:read', 'services', 'read', 'View service request applications'),
('services:process', 'services', 'edit', 'Process and approve citizen requests'),
('services:issue', 'services', 'create', 'Issue official certificates and clearances'),

-- Transparency & Bids
('transparency:read', 'transparency', 'read', 'View transparency seal documents'),
('transparency:upload', 'transparency', 'create', 'Upload financial and bidding reports'),

-- GAD IMS
('gad:read', 'gad_ims', 'read', 'Access Gender and Development beneficiary data'),
('gad:encode', 'gad_ims', 'create', 'Encode new GAD beneficiaries'),
('gad:manage', 'gad_ims', 'edit', 'Manage and export GAD statistics')
ON CONFLICT (code) DO NOTHING;

-- Module Permissions Matrix
INSERT INTO public.module_permissions (role, module, can_read, can_create, can_edit, can_delete, can_publish) VALUES
('super_admin', 'system', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'users', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'news', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'events', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'legislative', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'services', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'transparency', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'tourism', TRUE, TRUE, TRUE, TRUE, TRUE),
('super_admin', 'gad_ims', TRUE, TRUE, TRUE, TRUE, TRUE),

('municipal_admin', 'users', TRUE, TRUE, TRUE, FALSE, TRUE),
('municipal_admin', 'news', TRUE, TRUE, TRUE, TRUE, TRUE),
('municipal_admin', 'events', TRUE, TRUE, TRUE, TRUE, TRUE),
('municipal_admin', 'legislative', TRUE, TRUE, TRUE, TRUE, TRUE),
('municipal_admin', 'services', TRUE, TRUE, TRUE, FALSE, TRUE),
('municipal_admin', 'transparency', TRUE, TRUE, TRUE, TRUE, TRUE),

('barangay_admin', 'services', TRUE, TRUE, TRUE, FALSE, FALSE),
('barangay_admin', 'news', TRUE, TRUE, TRUE, FALSE, FALSE),

('editor', 'news', TRUE, TRUE, TRUE, FALSE, TRUE),
('editor', 'events', TRUE, TRUE, TRUE, FALSE, TRUE),
('editor', 'tourism', TRUE, TRUE, TRUE, FALSE, TRUE),

('staff', 'services', TRUE, TRUE, TRUE, FALSE, FALSE),
('citizen', 'services', TRUE, TRUE, FALSE, FALSE, FALSE)
ON CONFLICT (role, module) DO UPDATE SET
  can_read = EXCLUDED.can_read,
  can_create = EXCLUDED.can_create,
  can_edit = EXCLUDED.can_edit,
  can_delete = EXCLUDED.can_delete,
  can_publish = EXCLUDED.can_publish,
  updated_at = NOW();

-- --------------------------------------------------------------------
-- 2. SEED DEPARTMENTS & OFFICES
-- --------------------------------------------------------------------
INSERT INTO public.departments (name, slug, official_name, description, head_of_office, contact_number, email) VALUES
('Mayor''s Office', 'mayors-office', 'Office of the Municipal Mayor', 'Executive management and municipal leadership', 'Hon. Janette A. Garcia', '(038) 515-0001', 'mayor@talibon.gov.ph'),
('Sangguniang Bayan', 'sangguniang-bayan', 'Office of the Sangguniang Bayan', 'Legislative body of Talibon', 'Hon. Vice Mayor', '(038) 515-0002', 'sb@talibon.gov.ph'),
('MPDO', 'mpdo', 'Municipal Planning & Development Office', 'Urban planning, zoning, and municipal statistics', 'Engr. Planning Officer', '(038) 515-0003', 'mpdo@talibon.gov.ph'),
('MTO', 'mto', 'Municipal Treasury Office', 'Tax collection, cedula issuance, and revenue management', 'Municipal Treasurer', '(038) 515-0004', 'treasury@talibon.gov.ph'),
('Local Civil Registrar', 'lcr', 'Office of the Local Civil Registrar', 'Birth, marriage, and death certificate registration', 'Civil Registrar Head', '(038) 515-0005', 'lcr@talibon.gov.ph'),
('MHO', 'mho', 'Municipal Health Office', 'Public health services, sanitation, and medical assistance', 'Dr. Municipal Health Officer', '(038) 515-0006', 'health@talibon.gov.ph'),
('MDRRMO', 'mdrrmo', 'Municipal Disaster Risk Reduction & Management Office', 'Emergency advisories, rescue, and disaster response', 'MDRRM Officer', '(038) 515-9111', 'mdrrmo@talibon.gov.ph'),
('MSWDO', 'mswdo', 'Municipal Social Welfare & Development Office', 'Social protection, indigency clearance, and GAD programs', 'MSWD Officer', '(038) 515-0008', 'mswdo@talibon.gov.ph'),
('BPLO', 'bplo', 'Business Permits & Licensing Office', 'Business permit processing and regulatory compliance', 'BPLO Chief', '(038) 515-0009', 'bplo@talibon.gov.ph'),
('Tourism Office', 'tourism', 'Municipal Tourism & Cultural Affairs Office', 'Promotion of Talibon eco-tourism and cultural heritage', 'Tourism Officer', '(038) 515-0010', 'tourism@talibon.gov.ph'),
('MAO', 'mao', 'Municipal Agriculture Office', 'Agricultural and fisheries extension services', 'Municipal Agriculturist', '(038) 515-0011', 'agriculture@talibon.gov.ph')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  official_name = EXCLUDED.official_name,
  description = EXCLUDED.description,
  head_of_office = EXCLUDED.head_of_office,
  updated_at = NOW();

-- --------------------------------------------------------------------
-- 3. SEED ALL 25 BARANGAYS OF TALIBON, BOHOL
-- --------------------------------------------------------------------
INSERT INTO public.barangays (name, slug, captain, population, latitude, longitude) VALUES
('San Jose (Poblacion)', 'san-jose-poblacion', 'Hon. Barangay Captain', 4850, 10.1503, 124.3331),
('San Pedro', 'san-pedro', 'Hon. Barangay Captain', 3210, 10.1415, 124.3210),
('San Agustin', 'san-agustin', 'Hon. Barangay Captain', 2980, 10.1380, 124.3120),
('San Carlos', 'san-carlos', 'Hon. Barangay Captain', 2150, 10.1310, 124.3050),
('San Francisco', 'san-francisco', 'Hon. Barangay Captain', 3400, 10.1480, 124.3410),
('San Isidro', 'san-isidro', 'Hon. Barangay Captain', 2760, 10.1250, 124.2980),
('San Roque', 'san-roque', 'Hon. Barangay Captain', 1980, 10.1200, 124.2910),
('Santa Cruz', 'santa-cruz', 'Hon. Barangay Captain', 2450, 10.1550, 124.3480),
('Santo Niño', 'santo-nino', 'Hon. Barangay Captain', 3120, 10.1600, 124.3550),
('Bagacay', 'bagacay', 'Hon. Barangay Captain', 1850, 10.1150, 124.2850),
('Balintawak', 'balintawak', 'Hon. Barangay Captain', 2300, 10.1320, 124.3180),
('Burgos', 'burgos', 'Hon. Barangay Captain', 1920, 10.1100, 124.2780),
('Busalian', 'busalian', 'Hon. Barangay Captain', 1650, 10.1700, 124.3600),
('Calituban', 'calituban', 'Hon. Barangay Captain', 4100, 10.2400, 124.2900),
('Cataban', 'cataban', 'Hon. Barangay Captain', 2800, 10.2200, 124.3100),
('Guindacpan', 'guindacpan', 'Hon. Barangay Captain', 2200, 10.2100, 124.3300),
('Mahanay', 'mahanay', 'Hon. Barangay Captain', 2600, 10.2300, 124.3500),
('Margot', 'margot', 'Hon. Barangay Captain', 1780, 10.1050, 124.2700),
('Sag', 'sag', 'Hon. Barangay Captain', 1950, 10.1280, 124.3020),
('San Jose (Island)', 'san-jose-island', 'Hon. Barangay Captain', 1450, 10.2500, 124.3200),
('Suba', 'suba', 'Hon. Barangay Captain', 2100, 10.1520, 124.3380),
('Tangaran', 'tangaran', 'Hon. Barangay Captain', 2890, 10.1650, 124.3620),
('Zambran', 'zambran', 'Hon. Barangay Captain', 1720, 10.1000, 124.2620),
('San Rafael', 'san-rafael', 'Hon. Barangay Captain', 2050, 10.1350, 124.3100),
('San Vicente', 'san-vicente', 'Hon. Barangay Captain', 1880, 10.1220, 124.2950)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  population = EXCLUDED.population,
  updated_at = NOW();

-- --------------------------------------------------------------------
-- 4. SEED CATEGORIES & TAGS
-- --------------------------------------------------------------------

INSERT INTO public.categories (name, slug, module, description, color) VALUES
-- News Categories
('Municipal Announcements', 'municipal-announcements', 'news', 'Official notices and updates from LGU Talibon', '#1e3a8a'),
('Community & Culture', 'community-culture', 'news', 'Local stories, events, and barangay activities', '#0d9488'),
('Disaster & Safety', 'disaster-safety', 'news', 'Weather alerts, sea warnings, and safety guidelines', '#dc2626'),
('Health & Social Services', 'health-social-services', 'news', 'Medical missions, vaccination, and GAD updates', '#16a34a'),

-- Tourism Categories
('Eco-Tourism', 'eco-tourism', 'tourism', 'Protected marine sanctuaries and mangrove forests', '#059669'),
('Island Destinations', 'island-destinations', 'tourism', 'Calituban reef, sandbars, and island adventures', '#0284c7'),
('Heritage & Culture', 'heritage-culture', 'tourism', 'Historical sites and municipal traditions', '#b45309'),
('Local Gastronomy', 'local-gastronomy', 'tourism', 'Talibon seafood delicacies and local cuisine', '#e11d48'),

-- Transparency Categories
('Procurement & Bids', 'procurement-bids', 'transparency', 'Invitation to Bid, NOA, and NTP notices', '#4f46e5'),
('Financial Reports', 'financial-reports', 'transparency', 'Budget execution, SRE, and COA reports', '#2563eb'),
('Executive Orders', 'executive-orders', 'transparency', 'Mayoral EOs and administrative directives', '#7c3aed')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  updated_at = NOW();

INSERT INTO public.tags (name, slug) VALUES
('talibon', 'talibon'),
('bohol', 'bohol'),
('lgu', 'lgu'),
('ordinance', 'ordinance'),
('resolution', 'resolution'),
('bids-and-awards', 'bids-and-awards'),
('eservices', 'eservices'),
('tourism', 'tourism'),
('gad', 'gad'),
('mdrrmo', 'mdrrmo'),
('health', 'health'),
('announcement', 'announcement')
ON CONFLICT (slug) DO NOTHING;

-- --------------------------------------------------------------------
-- 5. STORAGE BUCKET INITIALIZATION
-- --------------------------------------------------------------------

-- Insert Storage Buckets safely into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('public-cms', 'public-cms', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']),
('documents', 'documents', true, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
('certificates', 'certificates', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Note: RLS is enabled on storage.objects by default in Supabase

-- Clean up existing storage policies if re-running
DROP POLICY IF EXISTS "Public Read Access for Public Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Staff Write Access for Public Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Staff Update Access for Public Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Staff Delete Access for Public Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Avatar Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Certificates Access Policy" ON storage.objects;

-- Storage Policy 1: Public Read for public content buckets
CREATE POLICY "Public Read Access for Public Buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN ('public-cms', 'documents', 'avatars', 'media'));

-- Storage Policy 2: Staff Insert/Write for Public Buckets
CREATE POLICY "Staff Write Access for Public Buckets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('public-cms', 'documents', 'media')
  AND (
    auth.role() = 'authenticated'
    AND public.is_staff_user()
  )
);

-- Storage Policy 3: Staff Update Access for Public Buckets
CREATE POLICY "Staff Update Access for Public Buckets"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('public-cms', 'documents', 'media')
  AND public.is_staff_user()
);

-- Storage Policy 4: Staff Delete Access for Public Buckets
CREATE POLICY "Staff Delete Access for Public Buckets"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('public-cms', 'documents', 'media')
  AND public.is_staff_user()
);

-- Storage Policy 5: Authenticated User Avatar Uploads
CREATE POLICY "Authenticated Avatar Uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Storage Policy 6: Private Certificates Read/Write
CREATE POLICY "Certificates Access Policy"
ON storage.objects FOR ALL
USING (
  bucket_id = 'certificates'
  AND (
    public.is_staff_user()
    OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
  )
);

-- --------------------------------------------------------------------
-- 6. SUPER ADMIN CREATION & PROMOTION HELPER UTILITY
-- --------------------------------------------------------------------

-- Function to safely promote an existing auth.users record to super_admin
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(target_email)) LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email "%" was not found in auth.users. Please sign up or create the account in Supabase Auth first.', target_email;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, is_verified, updated_at)
    VALUES (v_user_id, LOWER(TRIM(target_email)), SPLIT_PART(target_email, '@', 1), 'super_admin', TRUE, NOW())
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        is_verified = TRUE,
        updated_at = NOW();

    RETURN 'User ' || target_email || ' (ID: ' || v_user_id::text || ') successfully promoted to super_admin.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 7. VERIFICATION & CONFIRMATION
-- --------------------------------------------------------------------
SELECT 
    'Bootstrap completed successfully' AS status,
    (SELECT COUNT(*) FROM public.roles) AS roles_count,
    (SELECT COUNT(*) FROM public.permissions) AS permissions_count,
    (SELECT COUNT(*) FROM public.departments) AS departments_count,
    (SELECT COUNT(*) FROM public.barangays) AS barangays_count,
    (SELECT COUNT(*) FROM public.categories) AS categories_count,
    (SELECT COUNT(*) FROM storage.buckets) AS buckets_count;
