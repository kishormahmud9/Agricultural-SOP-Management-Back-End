import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { SubscriptionController } from "./subscription.controller.js";

const router = express.Router();

/**
 * Farm Admin - Subscription & Billing
 */

router.get(
    "/current",
    checkAuthMiddleware(Role.FARM_ADMIN),
    SubscriptionController.getCurrentSubscription
);

router.get(
    "/plans",
    checkAuthMiddleware(Role.FARM_ADMIN),
    SubscriptionController.getAvailablePlans
);

router.get(
    "/billing-history",
    checkAuthMiddleware(Role.FARM_ADMIN),
    SubscriptionController.getBillingHistory
);

export default router;
