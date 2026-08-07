export interface ServiceForm {
  title: string;
  url: string;
  fileSize?: string;
}

export interface ServiceInfo {
  id: string;
  title: string;
  description: string;
  purpose: string;
  requirements: string[];
  processingTime: string;
  officeResponsible: string;
  officeHours: string;
  contactInfo: string;
  physicalAddress: string;
  status: "available" | "coming-soon" | "maintenance";
  downloadableForms?: ServiceForm[];
}

export const SERVICES_DATA: Record<string, ServiceInfo> = {
  "apply-permit": {
    id: "apply-permit",
    title: "Apply for Permit",
    description: "Secure municipal permits, zoning clearance, and construction approvals required for business operations and physical structures.",
    purpose: "To regulate, monitor, and support business establishment and infrastructure development within Talibon in compliance with local ordinances, the National Building Code, and zoning regulations.",
    requirements: [
      "Unified Application Form (properly accomplished and notarized)",
      "Barangay Clearance for Business or Construction",
      "Valid Government-issued ID of the owner/applicant",
      "Occupancy Permit / Zoning Clearance",
      "Contract of Lease (if renting) or Land Title / Tax Declaration (if owned)",
      "Public Liability Insurance (for certain business categories)",
      "Fire Safety Inspection Certificate (FSIC)"
    ],
    processingTime: "3 to 5 business days from submission of complete requirements",
    officeResponsible: "Business Permits and Licensing Office (BPLO) / Municipal Engineering Office",
    officeHours: "Monday to Friday, 8:00 AM - 5:00 PM (except holidays)",
    contactInfo: "Phone: (038) 422-2895 | Email: bplo-talibon@gov.ph",
    physicalAddress: "Ground Floor, Executive Building, Talibon Municipal Hall, Bohol, Philippines",
    status: "coming-soon",
    downloadableForms: [
      {
        title: "Business Permit Application Form",
        url: "http://talibon.gov.ph/wp-content/uploads/2025/10/BUSINESS-PERMIT-APPLICATION-FORM.pdf",
        fileSize: "1.4 MB"
      },
      {
        title: "Unified Application Form for Building Permit",
        url: "http://talibon.gov.ph/wp-content/uploads/2025/10/UNIFIED-APPLICATION-FORM-FOR-BUILDING-PERMIT.pdf",
        fileSize: "2.1 MB"
      },
      {
        title: "Zoning Certificate/Clearance Application Form",
        url: "http://talibon.gov.ph/wp-content/uploads/2025/10/LC-Application-Form.pdf",
        fileSize: "850 KB"
      }
    ]
  },
  "request-certificate": {
    id: "request-certificate",
    title: "Request Certificate",
    description: "Obtain official civil registry documents, local clearances, residency certifications, and other municipal vital records.",
    purpose: "To provide legal certifications, civil registry records, and citizen clearances required for employment, legal purposes, travel, identification, or financial services.",
    requirements: [
      "Duly accomplished Request Slip / Application Form",
      "Valid Government-issued Identification Card (original and photocopy)",
      "Authorisation Letter and Representative's Valid ID (if filed through a representative)",
      "Specific auxiliary documents (e.g., Hospital Certificate of Live Birth for birth registration, Marriage Contract for marriage certificates)",
      "Proof of Payment (Official Receipt from the Municipal Treasurer)"
    ],
    processingTime: "Same day processing (15 to 45 minutes for walk-in requests)",
    officeResponsible: "Local Civil Registry Office (LCRO) / Mayor's Office",
    officeHours: "Monday to Friday, 8:00 AM - 5:00 PM (except holidays)",
    contactInfo: "Phone: (038) 422-2023 | Email: civilregistry-talibon@gov.ph",
    physicalAddress: "First Floor, Legislative Annex, Talibon Municipal Hall, Bohol, Philippines",
    status: "coming-soon",
    downloadableForms: [
      {
        title: "Barangay Residency Request Form",
        url: "/downloads",
        fileSize: "450 KB"
      },
      {
        title: "Civil Registry Request Guidelines",
        url: "/transparency/charter",
        fileSize: "1.1 MB"
      }
    ]
  },
  "pay-online": {
    id: "pay-online",
    title: "Pay Online",
    description: "Settle real property taxes, business permit processing fees, structural permit assessments, and other regulatory dues digitally.",
    purpose: "To offer a modern, secure, and hassle-free payment channel for the citizens of Talibon, streamlining tax collection and eliminating long queues at the Municipal Hall.",
    requirements: [
      "Updated Assessment Slip or Statement of Account (SOA)",
      "Tax Declaration Number (for Real Property Tax payments)",
      "Business ID Number / Reference Number (for Business Fees)",
      "Active Digital Wallet (GCash, Maya) or Bank Account with online banking capabilities"
    ],
    processingTime: "Instant notification upon payment; Official Receipt (OR) available for pickup or digital copy within 24 hours",
    officeResponsible: "Municipal Treasurer's Office (MTO)",
    officeHours: "Online payment gateway is available 24/7; Administrative support: Monday to Friday, 8:00 AM - 5:00 PM",
    contactInfo: "Phone: (038) 422-2110 | Email: treasury-talibon@gov.ph",
    physicalAddress: "Ground Floor, Main Lobby, Talibon Municipal Hall, Bohol, Philippines",
    status: "coming-soon",
    downloadableForms: []
  },
  "track-request": {
    id: "track-request",
    title: "Track My Request",
    description: "Real-time lookup tool to check the current administrative stage and approval status of your submitted applications and certificates.",
    purpose: "To guarantee transparency and efficiency in governance by allowing citizens to trace the progress of their documentation without requiring in-person visits.",
    requirements: [
      "Unique Transaction Reference Number (TRN) or Application Number",
      "First Name and Last Name of the Applicant",
      "Contact Number registered during application submission"
    ],
    processingTime: "Instant lookup results with up-to-date tracking logs",
    officeResponsible: "Municipal Information and Communications Technology (ICT) Department",
    officeHours: "Tracking portal is accessible 24/7; Technical support: Monday to Friday, 8:00 AM - 5:00 PM",
    contactInfo: "Phone: (038) 422-2150 | Email: tracking-support@talibon.gov.ph",
    physicalAddress: "Third Floor, ICT Center, Talibon Municipal Hall, Bohol, Philippines",
    status: "coming-soon",
    downloadableForms: []
  }
};
