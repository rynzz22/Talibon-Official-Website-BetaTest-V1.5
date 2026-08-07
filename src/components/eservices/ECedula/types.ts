export interface ECedulaApplication {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;

  birthDate: string;
  birthPlace: string;

  gender: string;
  civilStatus: string;
  citizenship: string;

  mobileNumber: string;
  email: string;

  address: string; // House Number / Street
  barangay: string;
  municipality: string;
  province: string;
  zipCode: string;

  occupation: string;
  employer?: string; // Employer / Business Name
  employerAddress?: string;

  tin?: string;
  annualIncome: number;

  purpose: string;
  remarks?: string;
}

export interface ECedulaSubmissionReceipt extends ECedulaApplication {
  ticketId: string;
  submittedAt: string;
  status: "Submitted" | "Under Review" | "Approved" | "Ready for Pickup" | "Completed" | "Rejected";
  estimatedCompletion: string;
  basicTax: number;
  additionalTax: number;
  totalTax: number;
}
