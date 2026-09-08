import express from "express";
import cors from "cors";

import authRoutes from "./auth/auth.routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import customerRoutes from "./customers/customer.routes";
import productRoutes from "./products/product.routes";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini ERP + CRM API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;