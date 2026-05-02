import express from "express";
import { generateMCQs } from "../services/mcqService.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", verifyToken, async (req, res) => {
  try {
    const { jobRole, company, jd, count, difficulty } = req.body;
    const mcqs = await generateMCQs({ jobRole, company, jd, count, difficulty });
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate MCQs" });
  }
});

export default router;
