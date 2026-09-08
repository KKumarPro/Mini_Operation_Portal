import { Router } from "express";

import { loginController } from "./auth.controller";
import {
  authenticate,
  authorize,
  AuthenticatedRequest,
} from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", loginController);

// Temporary development-only protected route
router.get(
  "/test-sales-access",
  authenticate,
  authorize("SALES"),
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      success: true,
      message: "Sales authorization successful",
      user: req.user,
    });
  }
);

export default router;