import express from "express";
import { generateInterviewQuestions, evaluateAnswer } from "../services/interviewService.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", verifyToken, async (req, res) => {
  try {
    const { jobRole, company, jd, count, difficulty } = req.body;
    const questions = await generateInterviewQuestions({ jobRole, company, jd, count, difficulty });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/evaluate", verifyToken, async (req, res) => {
  try {
    const { question, userAnswer, jobRole, difficulty } = req.body;
    const evaluation = await evaluateAnswer({ question, userAnswer, jobRole, difficulty });
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
