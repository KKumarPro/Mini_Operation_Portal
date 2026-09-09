import { Request, Response, NextFunction } from "express";

import { login } from "./auth.service";
import { loginSchema } from "./auth.validator";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await login(validatedData);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};