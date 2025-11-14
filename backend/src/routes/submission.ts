import express from "express";
import {
  submitCode,
  runCode,
  getUserQuestionSubmissions,
  getSubmissionById,
  getUserStats,
  getRecentSubmission,
  checkQuestionSolved,
  getUserSubmissions
} from "../controllers/submissionController";

import { protect } from "../middleware/auth";

const router = express.Router()

router.use(protect)

//Submit and run code
router.post("/",submitCode)
router.post("/run",runCode)

//User submissions
router.get("/user",getUserSubmissions)
router.get("/recent",getRecentSubmission)
router.get("/stats/user",getUserStats)

//Question-specific routes
router.get("/question/:questionId",getUserQuestionSubmissions)
router.get("/solved/:questionId",checkQuestionSolved)

router.get("/:id",getSubmissionById)

export default router