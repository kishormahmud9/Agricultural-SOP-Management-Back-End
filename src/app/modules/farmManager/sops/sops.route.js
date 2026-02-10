import { Router } from "express";
import { SOPController } from "./sops.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
    SOPController.getSopModules,
);

// 👇 SOP TEXT VIEW PAGE
router.get(
    "/:sopId/view",
    checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
    SOPController.viewSop,
);

router.get(
    "/:sopId/read",
    checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
    SOPController.readSOP
);

// 👇 SOP PDF DOWNLOAD
router.get(
    "/:sopId/download",
    checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
    SOPController.downloadSop,
);

// 👇 SOP LIST BY MODULE (KEEP LAST)
router.get(
    "/:module",
    checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
    SOPController.getSopsByModule,
);

export default router;
