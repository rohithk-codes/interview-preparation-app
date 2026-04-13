"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authCotroller_1 = __importDefault(require("../controllers/authCotroller"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/signup", authCotroller_1.default.signup);
router.post("/verify-otp", authCotroller_1.default.verifyOTP);
router.post("/resend-otp", authCotroller_1.default.resendOTP);
router.post("/login", authCotroller_1.default.login);
router.post("/refresh", authCotroller_1.default.refresh);
router.post("/google", authCotroller_1.default.googleLogin);
router.post("/logout", authCotroller_1.default.logout);
router.get("/profile", auth_1.protect, authCotroller_1.default.profile);
exports.default = router;
