import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { getStats } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", verifyToken, allowRoles("admin"), getStats);

export default router;