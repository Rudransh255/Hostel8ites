import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────

export const registerSchema = z.object({
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  name: z.string().min(2).max(100).trim(),
  hostelName: z.string().min(1).max(100).trim(),
  roomNumber: z.string().min(1).max(20).trim(),
}).refine(data => data.phone || data.email, {
  message: 'Either phone or email is required',
});

export const verifyOtpSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// ─── Listing Schemas ────────────────────────────────

export const createListingSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title must be under 150 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(10000, 'Price cannot exceed ₹10,000'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Must have at least 1 item')
    .max(999, 'Maximum quantity is 999'),
  categoryId: z.number().int().positive(),
});

export const updateListingSchema = createListingSchema.partial();

export const listingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).default('price_asc'),
  category: z.string().optional(),
  price_min: z.coerce.number().min(0).optional(),
  price_max: z.coerce.number().optional(),
  in_stock: z.coerce.boolean().default(true),
});

// ─── Request Schemas ────────────────────────────────

export const createRequestSchema = z.object({
  itemName: z.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(150, 'Item name must be under 150 characters')
    .trim(),
  budget: z.number()
    .positive()
    .max(10000)
    .optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
});

// ─── Report Schemas ─────────────────────────────────

export const createReportSchema = z.object({
  targetType: z.enum(['listing', 'user']),
  targetId: z.string().uuid(),
  reason: z.enum(['fake', 'spam', 'inappropriate', 'abusive']),
  description: z.string().max(500).optional(),
});

// ─── User Profile Schemas ───────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  roomNumber: z.string().min(1).max(20).trim().optional(),
  avatarUrl: z.string().url().optional(),
});
