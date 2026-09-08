"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUpSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Customer name is required"),
    mobile: zod_1.z.string().trim().min(1, "Mobile number is required"),
    email: zod_1.z.string().trim().email("Invalid email").optional(),
    businessName: zod_1.z.string().trim().min(1, "Business name is required"),
    gstNumber: zod_1.z.string().trim().optional(),
    type: zod_1.z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
    address: zod_1.z.string().trim().min(1, "Address is required"),
    status: zod_1.z.enum(["LEAD", "ACTIVE", "INACTIVE"]),
    followUpDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().trim().optional(),
});
exports.updateCustomerSchema = exports.createCustomerSchema.partial();
exports.followUpSchema = zod_1.z.object({
    notes: zod_1.z.string().trim().min(1, "Follow-up note is required"),
    followUpDate: zod_1.z.string().datetime().optional(),
});
