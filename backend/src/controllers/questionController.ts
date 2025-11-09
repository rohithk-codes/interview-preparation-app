import { Request, Response } from 'express';
import questionService from '../services/question.service';

// @desc    Get all questions
// @route   GET /api/questions
// @access  Private
export const getAllQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { difficulty, topic, search, page = '1', limit = '20' } = req.query;

    const filters = {
      difficulty: difficulty as string,
      topic: topic as string,
      search: search as string
    };

    const pagination = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    };

    const result = await questionService.getAllQuestions(filters, pagination);

    res.status(200).json({
      success: true,
      count: result.questions.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.questions
    });
  } catch (error: any) {
    console.error('Get all questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Private
export const getQuestionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const question = await questionService.getQuestionById(req.params.id);

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error: any) {
    console.error('Get question by ID error:', error);

    if (error.message === 'Question not found') {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private (Admin only)
export const createQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user?.id
    };

    const question = await questionService.createQuestion(questionData);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error: any) {
    console.error('Create question error:', error);

    if (
      error.message === 'A question with this title already exists' ||
      error.message === 'At least one test case is required'
    ) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Admin only)
export const updateQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedQuestion = await questionService.updateQuestion(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error: any) {
    console.error('Update question error:', error);

    if (
      error.message === 'Question not found' ||
      error.message === 'A question with this title already exists'
    ) {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Admin only)
export const deleteQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await questionService.deleteQuestion(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete question error:', error);

    if (error.message === 'Question not found or already deleted') {
      res.status(404).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// @desc    Get question topics
// @route   GET /api/questions/topics
// @access  Private
export const getTopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const topics = await questionService.getTopics();

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error: any) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
};

// @desc    Get question statistics
// @route   GET /api/questions/stats
// @access  Private
export const getQuestionStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await questionService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get question stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question statistics',
      error: error.message
    });
  }
};