import express from "express";
import { signup, login, profile } from "../controllers/authCotroller";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", protect, profile);

export default router;
