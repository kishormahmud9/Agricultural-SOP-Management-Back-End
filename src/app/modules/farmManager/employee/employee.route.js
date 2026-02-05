import { Router } from "express";
import { EmployeeController } from "./employee.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get("/", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), EmployeeController.getEmployees);

router.get("/:id", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), EmployeeController.getEmployeeDetails);

router.get("/:id/tasks", checkAuthMiddleware(Role.FARM_ADMIN, Role.MANAGER), EmployeeController.getEmployeeTasks);

export default router;
