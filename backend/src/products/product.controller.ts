import { Response, NextFunction } from "express";
import {
  AuthenticatedRequest,
} from "../middlewares/authMiddleware";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  createStockMovement,
  getStockMovements,
} from "./product.service";

import {
  createProductSchema,
  updateProductSchema,
  stockMovementSchema,
} from "./product.validator";

export const createProductController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createProductSchema.parse(req.body);

    const product = await createProduct(data);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const result = await getProducts(page, limit, search);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await getProductById(
      String(req.params.id)
    );

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateProductSchema.parse(req.body);

    const product = await updateProduct(
      String(req.params.id),
      data
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createStockMovementController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      next(new Error("Authentication required"));
      return;
    }

    const data = stockMovementSchema.parse(req.body);

    const result = await createStockMovement(
      String(req.params.id),
      data.quantity,
      data.type,
      data.reason,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      message: "Stock movement recorded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovementsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const movements = await getStockMovements(
      String(req.params.id)
    );

    res.status(200).json({
      success: true,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};