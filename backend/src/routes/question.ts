import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getTopics,
  getQuestionStats
} from '../controllers/questionController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public stats and topics (protected but accessible to all users)
router.get('/stats', protect, getQuestionStats);
router.get('/topics', protect, getTopics);

// Question CRUD
router
  .route('/')
  .get(protect, getAllQuestions)
  .post(protect, authorize('admin'), createQuestion);

router
  .route('/:id')
  .get(protect, getQuestionById)
  .put(protect, authorize('admin'), updateQuestion)
  .delete(protect, authorize('admin'), deleteQuestion);

export default router;