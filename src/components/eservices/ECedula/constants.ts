export const CIVIL_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Widowed", label: "Widowed" },
  { value: "Separated", label: "Separated" },
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const CITIZENSHIP_OPTIONS = [
  { value: "Filipino", label: "Filipino" },
  { value: "Dual Citizen", label: "Dual Citizen" },
  { value: "Foreign National", label: "Foreign National" },
];

export const PURPOSE_OPTIONS = [
  { value: "Local Employment", label: "Local Employment" },
  { value: "Overseas Employment", label: "Overseas Employment (POEA)" },
  { value: "Passport Application / Renewal", label: "Passport Application / Renewal" },
  { value: "Business Registration / Licensing", label: "Business Registration / Licensing" },
  { value: "Bank Transaction / Loan Application", label: "Bank Transaction / Loan Application" },
  { value: "Scholarship Application", label: "Scholarship Application" },
  { value: "Real Estate Transaction", label: "Real Estate Transaction" },
  { value: "Other Government Transaction", label: "Other Government Transaction" },
];

export const ZIP_CODES: Record<string, string> = {
  "Talibon": "6325",
};

export const DEFAULT_MUNICIPALITY = "Talibon";
export const DEFAULT_PROVINCE = "Bohol";
export const DEFAULT_ZIP_CODE = "6325";
export const DEFAULT_CITIZENSHIP = "Filipino";

// Tax calculations (following Philippine National Internal Revenue Code / Local Government Code)
// Basic Community Tax (Individuals): Php 5.00
// Additional Community Tax: Php 1.00 for every Php 1,000.00 of income/receipts
export const BASIC_TAX_INDIVIDUAL = 5.0;
export const ADDITIONAL_TAX_RATE = 0.001; // 1 per 1000, i.e., 0.1%
export const MAX_ADDITIONAL_TAX = 5000.0; // limit under LGC
