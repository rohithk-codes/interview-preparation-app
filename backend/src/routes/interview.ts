import express from 'express';
import interviewController from '../controllers/interviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Session management
router.post('/start', interviewController.startSession);
router.post('/answer', interviewController.submitAnswer);
router.post('/session/:sessionId/abandon', interviewController.abandonSession);

// Get data
router.get('/session/:sessionId', interviewController.getSession);
router.get('/session/:sessionId/current', interviewController.getCurrentQuestion);
router.get('/history', interviewController.getHistory);
router.get('/stats', interviewController.getStats);
router.get('/filters', interviewController.getFilters);
router.get('/count', interviewController.getQuestionCount);

export default router;