import { Request, Response, NextFunction } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
} from "./customer.service";

import {
  createCustomerSchema,
  updateCustomerSchema,
  followUpSchema,
} from "./customer.validator";

export const createCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createCustomerSchema.parse(req.body);
    const customer = await createCustomer(data);

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomersController = async (
  req: Request,
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

    const result = await getCustomers(page, limit, search);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await getCustomerById(String(req.params.id));

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateCustomerSchema.parse(req.body);

    const customer = await updateCustomer(String(req.params.id), data);

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const addFollowUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = followUpSchema.parse(req.body);

    const customer = await addFollowUp(
      String(req.params.id),
      data.notes,
      data.followUpDate
    );

    res.status(200).json({
      success: true,
      message: "Follow-up added successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};