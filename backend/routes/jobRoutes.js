import express from "express";
import { createJob, getJobs, getMyJobs, updateJob, deleteJob, getJobById, getJobPerformance, getSimilarJobs } from "../controllers/jobController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("hr"), createJob);
router.get("/", getJobs);
router.get("/my", verifyToken, allowRoles("hr"), getMyJobs);
router.get("/:id", getJobById);
router.get("/:id/performance", verifyToken, allowRoles("hr"), getJobPerformance);
router.get("/:id/similar", getSimilarJobs);
router.put("/:id", verifyToken, allowRoles("hr"), updateJob);
router.delete("/:id", verifyToken, allowRoles("hr"), deleteJob);

export default router;