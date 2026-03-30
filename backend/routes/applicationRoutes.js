import express from "express";
import multer from "multer";
import { applyJob, getApplications, getPendingApplications, getMyApplications, acceptApplication, rejectApplication, getApplicationAnalytics, getApplicationDetails, getApplicationHistory } from "../controllers/applicationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/", verifyToken, allowRoles("user"), upload.single("resume"), applyJob);
router.get("/", verifyToken, allowRoles("hr"), getApplications);
router.get("/pending", verifyToken, allowRoles("hr"), getPendingApplications);
router.get("/my", verifyToken, getMyApplications);
router.get("/analytics", verifyToken, allowRoles("hr"), getApplicationAnalytics);
router.get("/history", verifyToken, getApplicationHistory);
router.get("/:id", verifyToken, allowRoles("hr"), getApplicationDetails);
router.put("/:id/accept", verifyToken, allowRoles("hr"), acceptApplication);
router.put("/:id/reject", verifyToken, allowRoles("hr"), rejectApplication);

export default router;
