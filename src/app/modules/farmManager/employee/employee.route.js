import { Router } from "express";
import { EmployeeController } from "./employee.controller.js";

const router = Router();

router.get("/", EmployeeController.getEmployees);

router.get("/:id", EmployeeController.getEmployeeDetails);

router.get("/:id/tasks", EmployeeController.getEmployeeTasks);

export default router;
