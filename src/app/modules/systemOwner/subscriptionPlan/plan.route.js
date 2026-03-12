import { Router } from "express";
import { PlanController } from "./plan.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { PlanValidation } from "./plan.validation.js";

const router = Router();

router.post(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(PlanValidation.createPlanSchema),
  PlanController.createPlan,
);

router.get(
  "/all",
  PlanController.getPlans,
);

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  PlanController.getPlans,
);

router.patch(
  "/:planId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(PlanValidation.updatePlanSchema),
  PlanController.updatePlan,
);

router.delete(
  "/:planId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  PlanController.deletePlan,
);

export default router;
