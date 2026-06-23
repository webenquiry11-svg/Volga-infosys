import express from "express";
import { protect } from "../middleware/auth.js";
import { getProjects, getProject, createProject, updateProject, deleteProject } from "../controllers/projectController.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", protect, createProject);
router.patch("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

export default router;
