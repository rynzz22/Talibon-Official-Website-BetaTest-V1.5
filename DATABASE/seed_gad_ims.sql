INSERT INTO content (slug, title, body) VALUES 
('executive-gad-ims', 'Talibon GAD Analytics App', '{
  "title": "Talibon GAD Analytics App",
  "subtitle": "Sex-Disaggregated Data Management, Monitoring, and Reporting System",
  "sections": [
    {
      "id": "overview",
      "title": "01. Background & Rationale",
      "content": [
        {
          "subTitle": "Problem Statement",
          "items": [
            "Current data collection is fragmented and manual.",
            "Lack of consistent sex-disaggregated data.",
            "Fragmented monitoring of program effectiveness."
          ]
        },
        {
          "subTitle": "Policy Compliance",
          "items": [
            "RA 9710 (Magna Carta of Women)",
            "Joint Circular 2012-01 (PCW-DILG-DBM-NEDA)",
            "Data Privacy Act of 2012 (RA 10173)"
          ]
        }
      ]
    },
    {
      "id": "data-modules",
      "title": "02. Core System Modules",
      "content": [
        {
          "subTitle": "User Management",
          "items": [
            "Role-based access control (RBAC)",
            "Secure login & authentication",
            "Defined roles: Super Admin, GAD Focal, MPDC, Encoders"
          ]
        },
        {
          "subTitle": "Beneficiary Profiling",
          "items": [
            "Encoding of unique individual records",
            "Automated ID generation",
            "Searchable database with demographic fields"
          ]
        },
        {
          "subTitle": "Program Monitoring",
          "items": [
            "Recording of services availed",
            "Linking beneficiaries to specific programs",
            "Categorization by sector and gender"
          ]
        }
      ]
    },
    {
      "id": "analysis",
      "title": "03. Analytics & Dashboard",
      "content": [
        {
          "subTitle": "Visual Intelligence",
          "items": [
            "Real-time data visualization",
            "Male vs Female distribution charts",
            "Age group breakdown and Sectoral analysis",
            "Barangay-level statistics"
          ]
        },
        {
          "subTitle": "Trend Reporting",
          "items": [
            "Monthly and Annual trend analysis",
            "Spatial mapping of demographics",
            "Automated GPB and GAR support tables"
          ]
        }
      ]
    },
    {
      "id": "admin",
      "title": "04. Governance & Strategy",
      "content": [
        {
          "subTitle": "Implementation Strategy",
          "items": [
            "Phase 1: Planning and Design",
            "Phase 2: Development & Testing",
            "Phase 3: Capacity Building (Training)",
            "Phase 4: Pilot Implementation",
            "Phase 5: Full Rollout"
          ]
        },
        {
          "subTitle": "Security Measures",
          "items": [
            "Encrypted data storage",
            "Regular system backups",
            "Audit logs for accountability",
            "Consent-based data collection"
          ]
        }
      ]
    }
  ]
}')
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title, 
  body = EXCLUDED.body;
