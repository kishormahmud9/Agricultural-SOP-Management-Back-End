import { Router } from "express";
import { PlanController } from "./plan.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.post(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  PlanController.createPlan,
);

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  PlanController.getPlans,
);

router.patch(
  "/:planId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  PlanController.updatePlan,
);

router.delete(
  "/:planId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  PlanController.deletePlan,
);

export default router;
