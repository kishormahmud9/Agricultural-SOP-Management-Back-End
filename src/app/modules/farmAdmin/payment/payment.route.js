import express from "express";
import { PaymentController } from "./payment.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = express.Router();

// Farm Admin → Stripe Checkout
router.post(
  "/checkout",
  checkAuthMiddleware(Role.FARM_ADMIN),
  PaymentController.createCheckout
);

// Stripe Webhook (NO AUTH)
router.post("/webhook", PaymentController.handleStripeWebhook);

export default router;
