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

// 👇 SOP DETAIL (JSON or PDF)
router.get(
  "/detail/:sopId",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.getSopDetail,
);

// 👇 SOP PDF DOWNLOAD
router.get(
  "/:sopId/download",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.downloadSop,
);

// 👇 SOP LIST BY MODULE (KEEP LAST)
router.get(
  "/:module",
  checkAuthMiddleware(Role.EMPLOYEE, Role.FARM_ADMIN, Role.MANAGER),
  SopController.getSopsByModule,
);

export default router;
