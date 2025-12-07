import { Request, Response } from "express";
import questionService from "../services/question.service";

export const getAllQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { difficulty, topic, search, page = "1", limit = "20" } = req.query;

    const filters = {
      difficulty: difficulty as string,
      topic: topic as string,
      search: search as string,
    };

    const pagination = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
    };

    const result = await questionService.getAllQuestions(filters, pagination);
    
    res.status(200).json({
      success: true,
      count: result.questions.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.questions,
    });
  } catch (error: any) {
    console.error("Get all questions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching questions",
      error: error.message,
    });
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const {id} = req.params
  
    const question = await questionService.getQuestionById(id);

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
 console.error('Error fetching question by ID:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching the question.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {body,user} = req
    const questionData = {
      ...body,
      createdBy: user?.id,
    };

    const newQuestion = await questionService.createQuestion(questionData);

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (error:any) {
    console.error("Create question error:", error);

    if (
      error.message === "A question with this title already exists" ||
      error.message === "At least one test case is required"
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error creating question",
      error: error.message,
    });
  }
};

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
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error: any) {
    console.error("Update question error:", error);

    if (
      error.message === "Question not found" ||
      error.message === "A question with this title already exists"
    ) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error updating question",
      error: error.message,
    });
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await questionService.deleteQuestion(req.params.id);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete question error:", error);

    if (error.message === "Question not found or already deleted") {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error deleting question",
      error: error.message,
    });
  }
};

export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const topics = await questionService.getTopics();

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error: any) {
    console.error("Get topics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching topics",
      error: error.message,
    });
  }
};

export const getQuestionStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await questionService.getStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get question stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching question statistics",
      error: error.message,
    });
  }
};

export const getAllQuestionss = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      difficulty,
      search,
      topic,
      page = 1,
      limit = 10,
    } = req.query;

    //Build filter options
    const filters: Record<string, string> = {};
    if (difficulty) filters.difficulty = difficulty as string;
    if (topic) filters.topic = topic as string;
    if (search) filters.search = search as string;

    //Parse pagination values
    const currentPage = parseInt(page as string, 10);
    const pageLimit = parseInt(limit as string, 10);

    //Fetch data from service
    const result = await questionService.getAllQuestions(filters, {
      page: currentPage,
      limit: pageLimit,
    });

    res.status(200).json({
      success: true,
      totalQuestions: result.total,
      currentPage: result.page,
      totalPages: result.pages,
      count: result.questions.length,
      questions: result.questions,
    });

  } catch (error:any) {
    console.error("Error fetching questions:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching questions.",
      error: error.message,
    });
  }
};