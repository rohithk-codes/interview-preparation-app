import express from "express";
import submissionController from "../controllers/submissionController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.use(protect);

// Submit and run code
router.post("/", submissionController.submitCode);
router.post("/run", submissionController.runCode);

// User submissions
router.get("/user", submissionController.getUserSubmissions);
router.get("/recent", submissionController.getRecentSubmission);
router.get("/stats/user", submissionController.getUserStats);

// Question-specific routes
router.get("/question/:questionId", submissionController.getUserQuestionSubmissions);
router.get("/solved/:questionId", submissionController.checkQuestionSolved);

router.get("/:id", submissionController.getSubmissionById);

export default router;