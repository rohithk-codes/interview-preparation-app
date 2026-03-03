import express from "express";
import authController from "../controllers/authCotroller";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/logout", authController.logout);

router.get("/profile", protect, authController.profile);

export default router;
