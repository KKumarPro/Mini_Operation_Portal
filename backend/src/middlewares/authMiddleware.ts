import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { AppError } from "../utils/AppError";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    next(new AppError("Authentication token is required", 401));
    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(new AppError("Invalid authorization format", 401));
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    next(new AppError("JWT_SECRET is not configured", 500));
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      !("userId" in decoded) ||
      !("role" in decoded)
    ) {
      next(new AppError("Invalid authentication token", 401));
      return;
    }

    const payload = decoded as JwtPayload & {
      userId: string;
      role: string;
    };

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError("Invalid or expired authentication token", 401));
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("You do not have permission to access this resource", 403));
      return;
    }

    next();
  };
};