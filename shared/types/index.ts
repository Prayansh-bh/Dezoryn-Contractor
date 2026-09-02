export type { CreateEnquiryInput, SaveProductInput, SiteSettingsInput } from "../schemas";

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

export interface GalleryItem {
  id: number;
  title: string;
  caption?: string;
  mediaType: "image" | "video" | string;
  objectKey?: string;
  fileName: string;
  contentType: string;
  fileData?: Buffer | Uint8Array | null;
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
  createdAt: string | Date;
}

export interface AdminSession {
  email: string;
  displayName: string;
  isAdmin: boolean;
}

export interface AdminDashboardData {
  products: Product[];
  gallery: GalleryItem[];
  enquiries: Enquiry[];
  settings: SiteSettings;
}

export interface ApiResponse<T = unknown> {
  ok?: boolean;
  data?: T;
  error?: string;
}
