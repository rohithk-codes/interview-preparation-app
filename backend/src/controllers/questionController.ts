import { Request, Response } from "express";
import questionService from "../services/question.service";
import { getSingleValue } from "../utils/request";

class QuestionController {
  getAllQuestions = async (req: Request, res: Response): Promise<void> => {
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

  getQuestionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getSingleValue(req.params.id);

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Question ID is required",
        });
        return;
      }

      const question = await questionService.getQuestionById(id);

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error: any) {
      console.error("Error fetching question by ID:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Question not found",
      });
    }
  };

  createQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body, user } = req;
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
    } catch (error: any) {
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

  updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getSingleValue(req.params.id);

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Question ID is required",
        });
        return;
      }

      const updatedQuestion = await questionService.updateQuestion(
        id,
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

  deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = getSingleValue(req.params.id);

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Question ID is required",
        });
        return;
      }

      await questionService.deleteQuestion(id);

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

  getTopics = async (req: Request, res: Response): Promise<void> => {
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

  getQuestionStats = async (req: Request, res: Response): Promise<void> => {
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
}

export default new QuestionController();
