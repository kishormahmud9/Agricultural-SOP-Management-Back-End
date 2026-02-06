import express from "express";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { UserController } from "./user.controller.js";

const router = express.Router();

router.get(
    "/",
    checkAuthMiddleware(Role.FARM_ADMIN),
    UserController.getUsers
);

router.patch(
    "/:id",
    checkAuthMiddleware(Role.FARM_ADMIN),
    UserController.updateUser
);

router.patch(
    "/:id/status",
    checkAuthMiddleware(Role.FARM_ADMIN),
    UserController.updateUserStatus
);

router.delete(
    "/:id",
    checkAuthMiddleware(Role.FARM_ADMIN),
    UserController.deleteUser
);

router.post(
    "/",
    checkAuthMiddleware(Role.FARM_ADMIN),
    UserController.createUser
);

export default router;
