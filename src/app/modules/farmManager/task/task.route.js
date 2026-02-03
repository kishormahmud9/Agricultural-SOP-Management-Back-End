import { Router } from "express";
import { TaskController } from "./task.controller.js";

const router = Router();

router.post("/", TaskController.createTask);

router.get("/", TaskController.getTasks);

router.patch("/:id/status", TaskController.updateTaskStatus);

router.delete("/:id", TaskController.deleteTask);

router.patch("/:id", TaskController.updateTask);


export default router;
