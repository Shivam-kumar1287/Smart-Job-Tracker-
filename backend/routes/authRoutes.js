import express from "express";
import multer from "multer";
import { register, login, getProfile, updateProfile, updateProfileImage } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.post("/profile/image", verifyToken, upload.single("image"), updateProfileImage);

export default router;