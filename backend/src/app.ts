import express from "express";
import cors from "cors";

import authRoutes from "./auth/auth.routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import customerRoutes from "./customers/customer.routes";
import productRoutes from "./products/product.routes";
import challanRoutes from "./challans/challan.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Mini ERP + CRM API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/challans", challanRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
