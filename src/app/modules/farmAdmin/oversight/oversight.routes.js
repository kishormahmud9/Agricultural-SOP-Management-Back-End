import { Router } from "express";
import { OversightController } from "./oversight.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
    "/tasks",
    checkAuthMiddleware(Role.FARM_ADMIN),
    OversightController.getTasks
);

router.get(
    "/tasks/stats",
    checkAuthMiddleware(Role.FARM_ADMIN),
    OversightController.getTaskStats
);

export const OversightRoutes = router;
