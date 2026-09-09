import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallanStatus,
} from "./challan.service";

import {
  createChallanSchema,
  updateChallanStatusSchema,
} from "./challan.validator";

export const createChallanController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      next(new Error("Authentication required"));
      return;
    }

    const data = createChallanSchema.parse(req.body);

    const challan = await createChallan(
      data.customerId,
      data.status,
      data.items,
      req.user.userId
    );

    res.status(201).json({
      success: true,
      message: `Challan ${data.status.toLowerCase()} successfully`,
      data: challan,
    });
  } catch (error) {
    next(error);
  }
};

export const getChallansController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const status =
      typeof req.query.status === "string" && req.query.status.length > 0
        ? (req.query.status as "DRAFT" | "CONFIRMED" | "CANCELLED")
        : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const result = await getChallans(page, limit, status, search);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getChallanController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const challan = await getChallanById(String(req.params.id));

    res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChallanStatusController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateChallanStatusSchema.parse(req.body);

    const challan = await updateChallanStatus(
      String(req.params.id),
      data.status
    );

    res.status(200).json({
      success: true,
      message: `Challan ${data.status.toLowerCase()} successfully`,
      data: challan,
    });
  } catch (error) {
    next(error);
  }
};
