import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { FarmSettingsController } from "./farmSettings.controller.js";

const router = express.Router();

router.get(
    "/",
    checkAuthMiddleware(Role.FARM_ADMIN),
    FarmSettingsController.getFarmSettings
);

router.patch(
    "/",
    checkAuthMiddleware(Role.FARM_ADMIN),
    FarmSettingsController.updateFarmSettings
);

export default router;
