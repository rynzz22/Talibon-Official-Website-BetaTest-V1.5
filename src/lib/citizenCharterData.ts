export const citizenCharterData = {
  "Business Permit": {
    requirements: [
      "Duly accomplished Application Form",
      "DTI Registration (for Sole Proprietorship) or SEC Registration (for Corporations)",
      "Barangay Clearance for Business",
      "Lease Contract (if renting) or Tax Declaration/Title (if owned)",
      "Sketch/Map of Business Location",
      "Public Liability Insurance",
      "Fire Safety Inspection Certificate",
      "Sanitary Permit",
    ],
    processingTime: "1-3 Working Days (via E-Services)",
    office: "Business Permit and Licensing Office (BPLO)",
  },
  "Building Permit": {
    requirements: [
      "Duly accomplished Application Forms (Building, Sanitary, Electrical, etc.)",
      "Five (5) sets of Plans/Blueprints signed by licensed Architects/Engineers",
      "Certified True Copy of TCT/Land Title",
      "Tax Declaration and Current Tax Receipt",
      "Barangay Clearance for Construction",
      "Environmental Compliance Certificate (if applicable)",
    ],
    processingTime: "7-15 Working Days",
    office: "Office of the Municipal Engineer",
  },
  "Mayor's Clearance": {
    requirements: [
      "CEDULA (Community Tax Certificate)",
      "Police Clearance (Current)",
      "Official Receipt from Municipal Treasurer",
    ],
    processingTime: "15-30 Minutes",
    office: "Office of the Municipal Mayor",
  },
  "Civil Registry (Birth Certificate)": {
    requirements: [
      "Drafted Birth Certificate from Hospital/Clinic",
      "Marriage Contract of Parents",
      "Valid ID of Informant",
    ],
    processingTime: "1 Working Day",
    office: "Office of the Local Civil Registrar",
  },
  "Real Property Tax (Amillaramiento)": {
    requirements: [
      "Previous Year's Tax Receipt",
      "Tax Declaration (for new assessment)",
    ],
    processingTime: "10-20 Minutes",
    office: "Municipal Treasurer's Office",
  }
};

export type CharterService = keyof typeof citizenCharterData;
