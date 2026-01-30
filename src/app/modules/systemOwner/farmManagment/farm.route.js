import { Router } from "express";
import { FarmController } from "./farm.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  FarmController.getFarms,
);

router.post(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  FarmController.createFarm,
);

router.get(
  "/:farmId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  FarmController.getFarmDetails,
);

router.patch(
  "/:farmId/status",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  FarmController.updateFarmStatus,
);

router.delete(
  "/:farmId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  FarmController.deleteFarm,
);

export default router;
