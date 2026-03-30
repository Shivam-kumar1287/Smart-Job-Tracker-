import express from "express";
import {
  getUserStats,
  getHRStats,
  getJobAnalytics,
  getApplicationTrends,
  getTopPerformingJobs,
  getUserActivity,
  getRecommendations
} from "../controllers/analyticsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// User analytics
router.get("/user/stats", verifyToken, getUserStats);
router.get("/user/activity", verifyToken, getUserActivity);
router.get("/user/recommendations", verifyToken, getRecommendations);

// HR analytics
router.get("/hr/stats", verifyToken, allowRoles("hr"), getHRStats);
router.get("/hr/job-analytics", verifyToken, allowRoles("hr"), getJobAnalytics);
router.get("/hr/application-trends", verifyToken, allowRoles("hr"), getApplicationTrends);
router.get("/hr/top-jobs", verifyToken, allowRoles("hr"), getTopPerformingJobs);

export default router;
