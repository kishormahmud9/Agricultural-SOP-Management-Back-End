import { Router } from "express";
import { SopController } from "./sop.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.EMPLOYEE),
  SopController.getSopModules,
);

// 👇 SOP TEXT VIEW PAGE (THIS PAGE)
router.get(
  "/:sopId/view",
  checkAuthMiddleware(Role.EMPLOYEE),
  SopController.viewSop,
);

// 👇 SOP PDF DOWNLOAD
router.get(
  "/:sopId/download",
  checkAuthMiddleware(Role.EMPLOYEE),
  SopController.downloadSop,
);

// 👇 SOP LIST BY MODULE (KEEP LAST)
router.get(
  "/:module",
  checkAuthMiddleware(Role.EMPLOYEE),
  SopController.getSopsByModule,
);

export default router;
