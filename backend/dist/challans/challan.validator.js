"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanStatusSchema = exports.createChallanSchema = void 0;
const zod_1 = require("zod");
exports.createChallanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid("Invalid customer ID"),
    status: zod_1.z.enum(["DRAFT", "CONFIRMED"]).default("DRAFT"),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid("Invalid product ID"),
        quantity: zod_1.z.coerce.number().int().positive(),
    }))
        .min(1, "At least one product is required"),
});
exports.updateChallanStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["CONFIRMED", "CANCELLED"]),
});
