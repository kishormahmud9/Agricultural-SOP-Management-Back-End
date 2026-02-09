import { Router } from "express";
import { downloadSOP, getSOPById, getSOPs, readSOP } from "./sops.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), getSOPs);

router.get(
    "/:id/read",
    checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER),
    readSOP
);

router.get("/:id/download", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), downloadSOP);

router.get("/:id", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), getSOPById);

export default router;
