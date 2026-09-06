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

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type SaveProductInput = z.infer<typeof saveProductSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

