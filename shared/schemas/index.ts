import { z } from "zod";

export const createEnquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  company: z.string().trim().min(1, "Company is required").max(160),
  phone: z
    .string()
    .trim()
    .min(8, "Phone number must be at least 8 digits")
    .max(20, "Phone number is too long"),
  email: z.string().trim().email("Enter a valid email address").max(160),
  product: z.string().trim().min(1, "Product requirement is required").max(160),
  quantity: z.string().trim().min(1, "Quantity is required").max(120),
  location: z.string().trim().min(1, "Delivery location is required").max(160),
  message: z.string().trim().max(1500).default(""),
});

export const saveProductSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Product name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .transform((val: string) =>
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    ),
  kicker: z.string().trim().max(200).default(""),
  description: z.string().trim().min(1, "Description is required"),
  features: z.array(z.string().trim()).default([]),
  uses: z.array(z.string().trim()).default([]),
  specs: z.array(z.string().trim()).default([]),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  imageUrl: z.string().trim().optional().nullable(),
});

export const siteSettingsSchema = z.record(z.string(), z.string());

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(160),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().trim().email("Enter a valid email address").max(160),
  currentPassword: z.string().min(1, "Current password is required"),
});

export const tradeRequirementItemSchema = z.object({
  trade: z.string().trim().min(1),
  count: z.coerce.number().int().positive().default(1),
});

export const createLabourRequisitionSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  contactPerson: z.string().trim().min(1, "Contact person name is required").max(160),
  phone: z.string().trim().min(8, "Valid phone number required (min 8 digits)").max(20),
  email: z.string().trim().email("Enter a valid email address").max(160),
  projectTitle: z.string().trim().min(1, "Project title is required").max(250),
  projectType: z.string().trim().min(1, "Project type is required").max(120),
  locationState: z.string().trim().min(1, "Project state is required").max(100),
  locationCity: z.string().trim().min(1, "Project city/district is required").max(100),
  siteAddress: z.string().trim().max(300).default("").optional(),
  totalWorkers: z.coerce.number().int().min(1, "Total workers must be at least 1"),
  skillsRequired: z.array(z.union([z.string(), tradeRequirementItemSchema])).default([]),
  startDate: z.string().trim().max(60).default("").optional(),
  durationMonths: z.string().trim().max(60).default("").optional(),
  amenities: z.array(z.string().trim()).default([]),
  dailyWageBudget: z.string().trim().max(120).default("").optional(),
  message: z.string().trim().max(2000).default("").optional(),
});

export const createLabourAgencySchema = z.object({
  agencyName: z.string().trim().min(1, "Agency / Firm name is required").max(200),
  proprietorName: z.string().trim().min(1, "Proprietor / Representative name is required").max(160),
  phone: z.string().trim().min(8, "Valid phone number required (min 8 digits)").max(20),
  email: z.string().trim().email("Enter a valid email address").max(160).optional().or(z.literal("")),
  gstin: z.string().trim().max(25).default("").optional(),
  labourLicenseNo: z.string().trim().max(80).default("").optional(),
  state: z.string().trim().min(1, "State is required").max(100),
  city: z.string().trim().min(1, "City is required").max(100),
  totalCrewSize: z.coerce.number().int().min(1, "Crew size must be at least 1"),
  primaryTrades: z.array(z.string().trim()).default([]),
  preferredStates: z.array(z.string().trim()).default([]),
  availability: z.string().trim().default("immediate"),
});

export const createIndividualWorkerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(160),
  phone: z.string().trim().min(8, "Valid phone number required (min 8 digits)").max(20),
  trade: z.string().trim().min(1, "Skill / Trade category is required").max(120),
  experienceYears: z.coerce.number().int().min(0).default(1),
  currentCity: z.string().trim().min(1, "Current city is required").max(100),
  currentState: z.string().trim().min(1, "Current state is required").max(100),
  dailyWageExpect: z.string().trim().max(120).default("").optional(),
  canRelocate: z.boolean().default(true),
  availability: z.string().trim().default("immediate"),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type SaveProductInput = z.infer<typeof saveProductSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type CreateLabourRequisitionInput = z.infer<typeof createLabourRequisitionSchema>;
export type CreateLabourAgencyInput = z.infer<typeof createLabourAgencySchema>;
export type CreateIndividualWorkerInput = z.infer<typeof createIndividualWorkerSchema>;


