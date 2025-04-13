import { Router } from "express";
import { createProjectController } from "../controllers/project.controllers";

const router = Router();

router.post("/create", createProjectController);

export default router;
