import express from "express";
import { signup, login, profile, googleLogin } from "../controllers/authCotroller";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);

router.get("/profile", protect, profile);

export default router;
