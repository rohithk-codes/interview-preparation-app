"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const submissionController_1 = __importDefault(require("../controllers/submissionController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect);
// Submit and run code
router.post("/", submissionController_1.default.submitCode);
router.post("/run", submissionController_1.default.runCode);
// User submissions
router.get("/user", submissionController_1.default.getUserSubmissions);
router.get("/recent", submissionController_1.default.getRecentSubmission);
router.get("/stats/user", submissionController_1.default.getUserStats);
// Question-specific routes
router.get("/question/:questionId", submissionController_1.default.getUserQuestionSubmissions);
router.get("/solved/:questionId", submissionController_1.default.checkQuestionSolved);
router.get("/:id", submissionController_1.default.getSubmissionById);
exports.default = router;
