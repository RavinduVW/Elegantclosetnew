import { z } from "zod";

/**
 * Validation schemas for admin panel forms
 * Use with react-hook-form and @hookform/resolvers/zod
 */

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().max(300, "Short description is too long").optional(),
  sku: z.string().min(1, "SKU is required").max(50, "SKU is too long"),
  price: z.number().min(0, "Price must be positive"),
  salePrice: z.number().min(0, "Sale price must be positive").optional(),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0, "Stock quantity must be non-negative").optional(),
  lowStockThreshold: z.number().int().min(0).default(10),
  allowBackorder: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  visibility: z.enum(["public", "private", "password"]).default("public"),
  seoTitle: z.string().max(60, "SEO title is too long").optional(),
  seoDescription: z.string().max(160, "SEO description is too long").optional(),
  seoKeywords: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description is too long").optional(),
  parentId: z.string().optional(),
  order: z.number().int().min(0).default(0),
  showInMenu: z.boolean().default(true),
  menuLabel: z.string().max(50, "Menu label is too long").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  seoTitle: z.string().max(60, "SEO title is too long").optional(),
  seoDescription: z.string().max(160, "SEO description is too long").optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// FAQ validation schema
export const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters").max(300, "Question is too long"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  category: z.string().optional(),
  order: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export type FAQFormData = z.infer<typeof faqSchema>;

// Site settings validation schema
export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required").max(100, "Name is too long"),
  siteDescription: z.string().min(10, "Description must be at least 10 characters").max(300),
  siteUrl: z.string().url("Must be a valid URL"),
  adminEmail: z.string().email("Must be a valid email"),
  supportEmail: z.string().email("Must be a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().length(3, "Currency code must be 3 characters (e.g., USD)").default("USD"),
  currencySymbol: z.string().max(5).default("$"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100").optional(),
  defaultSeoTitle: z.string().max(60, "SEO title is too long"),
  defaultSeoDescription: z.string().max(160, "SEO description is too long"),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

// Admin user validation schema
export const adminUserSchema = z.object({
  email: z.string().email("Must be a valid email"),
  displayName: z.string().min(1, "Display name is required").max(100, "Name is too long"),
  role: z.enum(["super_admin", "admin", "editor", "viewer"]).default("viewer"),
  active: z.boolean().default(true),
});

export type AdminUserFormData = z.infer<typeof adminUserSchema>;

export const loginSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const phoneNumberSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required").max(50, "Label is too long"),
  number: z.string().min(1, "Phone number is required").max(30, "Number is too long"),
  primary: z.boolean().default(false),
});

export const businessHoursSchema = z.object({
  id: z.string(),
  day: z.string().min(1, "Day is required"),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  closed: z.boolean().default(false),
});

export const contactSettingsSchema = z.object({
  addressLine1: z.string().min(1, "Address line 1 is required").max(200, "Address is too long"),
  addressLine2: z.string().max(200, "Address is too long").optional(),
  addressLine3: z.string().max(200, "Address is too long").optional(),
  phoneNumbers: z.array(phoneNumberSchema).min(1, "At least one phone number is required"),
  email: z.string().email("Must be a valid email"),
  businessHours: z.array(businessHoursSchema).min(1, "Business hours are required"),
  socialMedia: z.object({
    facebook: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    instagram: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }),
});

export type ContactSettingsFormData = z.infer<typeof contactSettingsSchema>;

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Must be a valid email"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

export type ContactMessageFormData = z.infer<typeof contactMessageSchema>;

// Media upload validation
export const mediaUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Please select at least one file"),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type MediaUploadFormData = z.infer<typeof mediaUploadSchema>;

// Content block validation schema
export const contentBlockSchema = z.object({
  type: z.enum(["hero", "text", "image", "gallery", "products", "testimonial", "cta", "custom"]),
  page: z.string().min(1, "Page is required"),
  order: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  content: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    text: z.string().optional(),
    image: z.string().url("Must be a valid URL").optional(),
    images: z.array(z.string().url()).optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    alignment: z.enum(["left", "center", "right"]).optional(),
    productIds: z.array(z.string()).optional(),
    customHtml: z.string().optional(),
  }),
});

export type ContentBlockFormData = z.infer<typeof contentBlockSchema>;

// Helper function to create slug from string
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper function to validate image file
export function validateImageFile(file: File, maxSizeMB = 5): string | null {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return "File must be an image";
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
}

// Helper function to validate multiple files
export function validateFiles(files: File[], maxSizeMB = 5, maxFiles = 10): string | null {
  if (files.length === 0) {
    return "Please select at least one file";
  }

  if (files.length > maxFiles) {
    return `Maximum ${maxFiles} files allowed`;
  }

  for (const file of files) {
    const error = validateImageFile(file, maxSizeMB);
    if (error) {
      return error;
    }
  }

  return null;
}
