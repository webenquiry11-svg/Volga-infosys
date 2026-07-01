import express from "express";
import { protect } from "../middleware/auth.js";
import { getIndustryNews, getIndustryNewsItem, createIndustryNews, updateIndustryNews, deleteIndustryNews, duplicateIndustryNews } from "../controllers/industryNewsController.js";

const router = express.Router();

router.get("/", getIndustryNews);
router.get("/:id", getIndustryNewsItem);
router.post("/", protect, createIndustryNews);
router.post("/:id/duplicate", protect, duplicateIndustryNews);
router.patch("/:id", protect, updateIndustryNews);
router.delete("/:id", protect, deleteIndustryNews);

export default router;
