import express from "express";
import { HomeController } from "./home.controller.js";

const router = express.Router();

router.get("/", HomeController.getDashboard);

router.get("/view-all-tasks", HomeController.getAllTasks);

router.get("/view-sops", HomeController.getSopModules);

export default router;
