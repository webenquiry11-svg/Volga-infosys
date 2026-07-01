import express from "express";
import { protect } from "../middleware/auth.js";
import { getCaseStudies, getCaseStudy, createCaseStudy, updateCaseStudy, deleteCaseStudy, duplicateCaseStudy } from "../controllers/caseStudyController.js";

const router = express.Router();

router.get("/", getCaseStudies);
router.get("/:id", getCaseStudy);
router.post("/", protect, createCaseStudy);
router.post("/:id/duplicate", protect, duplicateCaseStudy);
router.patch("/:id", protect, updateCaseStudy);
router.delete("/:id", protect, deleteCaseStudy);

export default router;
