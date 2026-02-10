import { Router } from "express";
import { SopController } from "./sop.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.getSopModules,
);

// 👇 SOP TEXT VIEW PAGE (THIS PAGE)
router.get(
  "/:sopId/view",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.viewSop,
);

// 👇 SOP PDF DOWNLOAD
router.get(
  "/:sopId/download",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.downloadSop,
);

router.get(
  "/:sopId/read",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.readSop,
);

// 👇 SOP LIST BY MODULE (KEEP LAST)
router.get(
  "/:module",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.getSopsByModule,
);

export default router;
