import express from "express";
import questionController from "../controllers/questionController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

router.get("/stats", protect, questionController.getQuestionStats);
router.get("/topics", protect, questionController.getTopics);

// Question CRUD
router
  .route("/")
  .get(questionController.getAllQuestions)
  .post(protect, authorize("admin"), questionController.createQuestion);

router
  .route("/:id")
  .get(protect, questionController.getQuestionById)
  .put(protect, authorize("admin"), questionController.updateQuestion)
  .delete(protect, authorize("admin"), questionController.deleteQuestion);

export default router;
