import { Router } from "express";

import {
  createChallanController,
  getChallansController,
  getChallanController,
  updateChallanStatusController,
} from "./challan.controller";

import {
  authenticate,
  authorize,
} from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "SALES"),
  createChallanController
);

router.get(
  "/",
  getChallansController
);

router.get(
  "/:id",
  getChallanController
);

router.patch(
  "/:id/status",
  authorize("ADMIN", "SALES"),
  updateChallanStatusController
);

export default router;