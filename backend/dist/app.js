"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const notFound_1 = require("./middlewares/notFound");
const errorHandler_1 = require("./middlewares/errorHandler");
const customer_routes_1 = __importDefault(require("./customers/customer.routes"));
const product_routes_1 = __importDefault(require("./products/product.routes"));
const app = (0, express_1.default)();
// Global middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Mini ERP + CRM API is running",
    });
});
// Authentication routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/customers", customer_routes_1.default);
app.use("/api/products", product_routes_1.default);
// 404 handler
app.use(notFound_1.notFound);
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
