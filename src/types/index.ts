// Content Types
export interface ContentData {
  id?: string;
  slug?: string;
  title?: string;
  content?: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  body?: any;
  [key: string]: any;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface Mayor {
  name: string;
  term: string;
}

export interface Department {
  id: string;
  name: string;
  officialName: string;
  description: string;
  type: string;
  head?: string;
  contact?: string;
  logoUrl?: string;
  serviceLink?: string;
}

export interface Service {
  name: string;
  description: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
}

export interface Form {
  id: string;
  title: string;
  url: string;
}

export interface InfrastructureProject {
  id: string;
  title: string;
  status: string;
  budget: string;
}

export interface FinanceReport {
  id: string;
  title: string;
  url: string;
}

export interface ExecutiveOrder {
  id: string;
  title: string;
  date: string;
}

export interface BudgetData {
  annualBudget: string;
  breakdown: Array<{
    category: string;
    amount: string;
  }>;
}

export interface Barangay {
  name: string;
  slug: string;
  captain: string;
}

export interface GADBeneficiary {
  id?: string;
  unique_id?: string;
  full_name: string;
  sex: 'Male' | 'Female' | 'Other';
  birthdate?: string;
  age?: number;
  barangay_id: string;
  civil_status?: 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Common-law';
  sectoral_classification?: string[];
  contact_info?: string;
}
