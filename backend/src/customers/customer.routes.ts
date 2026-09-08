import { Router } from "express";

import {
  createCustomerController,
  getCustomersController,
  getCustomerController,
  updateCustomerController,
  addFollowUpController,
} from "./customer.controller";

import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.post("/", createCustomerController);
router.get("/", getCustomersController);
router.get("/:id", getCustomerController);
router.patch("/:id", updateCustomerController);
router.post("/:id/follow-up", addFollowUpController);

export default router;