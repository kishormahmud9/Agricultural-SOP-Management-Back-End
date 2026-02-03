import { Router } from "express";
import { ProfileController } from "./profile.controller.js";

const router = Router();

router.get("/", ProfileController.getProfile);

router.patch("/language", ProfileController.updateLanguage);


export default router;
