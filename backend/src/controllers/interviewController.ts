import { Request, Response } from 'express';
import interviewService from '../services/interview.service';


export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, type, difficulty, questionCount } = req.body;

    if (!category || !type) {
      res.status(400).json({
        success: false,
        message: 'Category and type are required'
      });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const result = await interviewService.startSession({
      userId: req.user.id,
      category,
      type,
      difficulty,
      questionCount
    });

    res.status(201).json({
      success: true,
      message: 'Interview session started',
      data: result
    });
  } catch (error: any) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start session',
      error: error.message
    });
  }
};


export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, questionId, answer, isVoiceAnswer, timeSpent } = req.body;

    if (!sessionId || !questionId || !answer) {
      res.status(400).json({
        success: false,
        message: 'Session ID, question ID, and answer are required'
      });
      return;
    }

    const result = await interviewService.submitAnswer({
      sessionId,
      questionId,
      answer,
      isVoiceAnswer: isVoiceAnswer || false,
      timeSpent: timeSpent || 0
    });

    res.status(200).json({
      success: true,
      message: 'Answer submitted',
      data: result
    });
  } catch (error: any) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit answer',
      error: error.message
    });
  }
};


export const getCurrentQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const question = await interviewService.getCurrentQuestion(sessionId);

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error: any) {
    console.error('Get current question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get question',
      error: error.message
    });
  }
};


export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await interviewService.getSession(sessionId);

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get session',
      error: error.message
    });
  }
};


export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const { limit } = req.query;
    const sessions = await interviewService.getUserSessions(
      req.user.id,
      limit ? parseInt(limit as string) : 20
    );

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error: any) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get history',
      error: error.message
    });
  }
};


export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const stats = await interviewService.getUserStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};


export const abandonSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    await interviewService.abandonSession(sessionId);

    res.status(200).json({
      success: true,
      message: 'Session abandoned'
    });
  } catch (error: any) {
    console.error('Abandon session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to abandon session',
      error: error.message
    });
  }
};


export const getFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = await interviewService.getAvailableFilters();

    res.status(200).json({
      success: true,
      data: filters
    });
  } catch (error: any) {
    console.error('Get filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filters',
      error: error.message
    });
  }
};


export const getQuestionCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, type } = req.query;

    if (!category || !type) {
      res.status(400).json({
        success: false,
        message: 'Category and type are required'
      });
      return;
    }

    const count = await interviewService.getQuestionCount(
      category as string,
      type as string
    );

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error: any) {
    console.error('Get question count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get question count',
      error: error.message
    });
  }
};