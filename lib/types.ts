export interface Capability {
  id: string;
  name: string;
  description: string;
  category: string;
  experienceLevel: "beginner" | "intermediate" | "expert";
}

export interface Certification {
  id: string;
  name: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
}

export interface CompanyInfo {
  companyName: string;
  website: string;
  employees: string;
  foundedYear: string;
  minOrderQuantity: string;
  maxOrderQuantity: string;
  productionCapacity: string;
  locations: string[];
  industries: string[];
  description: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar: string | null;
  description: string | null;
  capabilities: string[];
  certifications: string[];
  minOrderQuantity: number | null;
  maxOrderQuantity: number | null;
  productionCapacity: number | null;
  locations: string[];
  industries: string[];
  verified: boolean;
  rating: number;
  matchScore: number;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
