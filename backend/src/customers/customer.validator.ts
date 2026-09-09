import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  mobile: z.string().trim().min(1, "Mobile number is required"),
  email: z.string().trim().email("Invalid email").optional(),
  businessName: z.string().trim().min(1, "Business name is required"),
  gstNumber: z.string().trim().optional(),
  type: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
  address: z.string().trim().min(1, "Address is required"),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]),
  followUpDate: z.string().datetime().optional(),
  notes: z.string().trim().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const followUpSchema = z.object({
  notes: z.string().trim().min(1, "Follow-up note is required"),
  followUpDate: z.string().datetime().optional(),
});