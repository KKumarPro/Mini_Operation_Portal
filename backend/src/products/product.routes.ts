import { Router } from "express";

import {
  createProductController,
  getProductsController,
  getProductController,
  updateProductController,
  createStockMovementController,
  getStockMovementsController,
} from "./product.controller";

import {
  authenticate,
  authorize,
} from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  createProductController
);

router.get(
  "/",
  getProductsController
);

router.get(
  "/:id",
  getProductController
);

router.patch(
  "/:id",
  authorize("ADMIN", "WAREHOUSE"),
  updateProductController
);

router.post(
  "/:id/stock",
  authorize("ADMIN", "WAREHOUSE"),
  createStockMovementController
);

router.get(
  "/:id/stock-movements",
  getStockMovementsController
);

export default router;