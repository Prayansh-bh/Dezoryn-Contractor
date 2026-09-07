export type {
  CreateEnquiryInput,
  SaveProductInput,
  SaveCertificateInput,
  SiteSettingsInput,
  LoginInput,
  ChangePasswordInput,
  ChangeEmailInput,
  CreateLabourRequisitionInput,
  CreateLabourAgencyInput,
  CreateIndividualWorkerInput,
} from "../schemas";

export interface Product {
  id: number;
  slug: string;
  name: string;
  kicker: string;
  description: string;
  features: string[];
  uses: string[];
  specs: string[];
  active: boolean;
  sortOrder: number;
  imageUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Enquiry {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  product: string;
  quantity: string;
  location: string;
  message?: string;
  status: "new" | "contacted" | "qualified" | "closed" | string;
  createdAt: string | Date;
}

export interface LabourRequisition {
  id: number;
  requisitionCode: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  projectTitle: string;
  projectType: string;
  locationState: string;
  locationCity: string;
  siteAddress?: string | null;
  totalWorkers: number;
  skillsRequired: any;
  startDate?: string | null;
  durationMonths?: string | null;
  amenities: string[];
  dailyWageBudget?: string | null;
  message?: string | null;
  status: "open" | "matched" | "fulfilling" | "completed" | "cancelled" | string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface LabourAgency {
  id: number;
  agencyCode: string;
  agencyName: string;
  proprietorName: string;
  phone: string;
  email?: string | null;
  gstin?: string | null;
  labourLicenseNo?: string | null;
  state: string;
  city: string;
  totalCrewSize: number;
  primaryTrades: string[];
  preferredStates: string[];
  availability: string;
  verified: boolean;
  status: "active" | "inactive" | "suspended" | string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface IndividualWorker {
  id: number;
  workerCode: string;
  fullName: string;
  phone: string;
  trade: string;
  experienceYears: number;
  currentCity: string;
  currentState: string;
  dailyWageExpect?: string | null;
  canRelocate: boolean;
  availability: string;
  verified: boolean;
  status: "available" | "deployed" | "inactive" | string;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface WorkforceSummary {
  totalRequisitions: number;
  openRequisitions: number;
  totalAgencies: number;
  verifiedAgencies: number;
  totalWorkers: number;
  totalWorkforcePool: number;
  topTrades: string[];
}

export interface GalleryItem {
  id: number;
  title: string;
  caption?: string;
  mediaType: "image" | "video" | string;
  objectKey?: string;
  fileName: string;
  contentType: string;
  fileData?: Uint8Array | ArrayBuffer | any;
  featured: boolean;
  active: boolean;
  createdAt: string | Date;
}

export type SiteSettings = Record<string, string>;

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt?: string | Date;
}

export interface AdminUserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  user: AdminUserProfile;
}

export interface AdminSession {
  id?: number;
  email: string;
  displayName: string;
  role?: string;
  isAdmin: boolean;
}

export interface Certificate {
  id: number;
  title: string;
  subtitle?: string | null;
  issuer: string;
  certificateNo?: string | null;
  validUntil?: string | null;
  imageUrl: string;
  fileName?: string | null;
  fileData?: Uint8Array | ArrayBuffer | any;
  contentType?: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface AdminDashboardData {
  products: Product[];
  gallery: GalleryItem[];
  enquiries: Enquiry[];
  settings: SiteSettings;
  certificates?: Certificate[];
  workforce?: {
    requisitions: LabourRequisition[];
    agencies: LabourAgency[];
    workers: IndividualWorker[];
    summary: WorkforceSummary;
  };
}

export interface ApiResponse<T = unknown> {
  ok?: boolean;
  data?: T;
  error?: string;
}

