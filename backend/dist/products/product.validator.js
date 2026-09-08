"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovementSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Product name is required"),
    sku: zod_1.z.string().trim().min(1, "SKU is required"),
    category: zod_1.z.string().trim().min(1, "Category is required"),
    unitPrice: zod_1.z.coerce.number().nonnegative("Unit price cannot be negative"),
    currentStock: zod_1.z.coerce
        .number()
        .int()
        .nonnegative("Current stock cannot be negative")
        .default(0),
    minStockAlert: zod_1.z.coerce
        .number()
        .int()
        .nonnegative("Minimum stock alert cannot be negative")
        .default(0),
    warehouse: zod_1.z.string().trim().min(1, "Warehouse location is required"),
});
exports.updateProductSchema = exports.createProductSchema
    .omit({ currentStock: true })
    .partial();
exports.stockMovementSchema = zod_1.z.object({
    quantity: zod_1.z.coerce
        .number()
        .int()
        .positive("Quantity must be greater than 0"),
    type: zod_1.z.enum(["IN", "OUT"]),
    reason: zod_1.z.string().trim().min(1, "Reason is required"),
});
