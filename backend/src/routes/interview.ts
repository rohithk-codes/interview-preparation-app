import express from 'express';
import {
  startSession,
  submitAnswer,
  getCurrentQuestion,
  getSession,
  getHistory,
  getStats,
  abandonSession,
  getFilters,
  getQuestionCount
} from '../controllers/interviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Session management
router.post('/start', startSession);
router.post('/answer', submitAnswer);
router.post('/session/:sessionId/abandon', abandonSession);

// Get data
router.get('/session/:sessionId', getSession);
router.get('/session/:sessionId/current', getCurrentQuestion);
router.get('/history', getHistory);
router.get('/stats', getStats);
router.get('/filters', getFilters);
router.get('/count', getQuestionCount);

export default router;