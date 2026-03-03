import { Request, Response } from "express";
import submissionService from "../services/submission.service";

class SubmissionController {
  submitCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId, code, language } = req.body;
      if (!questionId || !code || !language) {
        res.status(400).json({
          success: false,
          message: "Please provide questionId, code, and language",
        });
        return;
      }

      const submission = await submissionService.submitCode({
        userId: req.user!.id,
        questionId,
        code,
        language,
      });

      res.status(201).json({
        success: true,
        message: "Code submitted successfully",
        data: submission,
      });
    } catch (error: any) {
      console.error("Submit code error", error);
      res.status(500).json({
        success: false,
        message: "Error submitting code",
        error: error.message,
      });
    }
  };

  runCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId, code, language } = req.body;

      if (!questionId || !code || !language) {
        res.status(400).json({
          success: false,
          message: "Please provide questionId, code, and language",
        });
        return;
      }

      const result = await submissionService.runCode(questionId, code, language);

      res.status(200).json({
        success: true,
        message: "Code executed successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Run code error:", error);
      res.status(500).json({
        success: false,
        message: "Error running code",
        error: error.message,
      });
    }
  };

  getUserSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit } = req.query;
      const submissions = await submissionService.getUserSubmissions(
        req.user!.id,
        limit ? parseInt(limit as string) : 50
      );

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error: any) {
      console.error("Get user submissions error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching submissions",
        error: error.message,
      });
    }
  };

  getUserQuestionSubmissions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { questionId } = req.params;
      const submissions = await submissionService.getUserQuestionSubmissions(
        req.user!.id,
        questionId
      );

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error: any) {
      console.error("Get user question submissions error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching submissions",
        error: error.message,
      });
    }
  };

  getSubmissionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const submission = await submissionService.getSubmissionById(req.params.id);

      // Business logic: check if user is authorized to view this submission
      // Note: In a very strict repository pattern, this might be in the service layer
      if (
        submission.userId.toString() !== req.user?.id &&
        req.user?.role !== "admin"
      ) {
        res.status(403).json({
          success: false,
          message: "Not authorised to view this submission",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      console.error("Get submission by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching submission",
        error: error.message,
      });
    }
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await submissionService.getUserStatistics(req.user!.id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Get user stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching statistics",
        error: error.message,
      });
    }
  };

  getRecentSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit } = req.query;
      const submissions = await submissionService.getRecentSubmissions(
        req.user!.id,
        limit ? parseInt(limit as string) : 10
      );

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error: any) {
      console.error("Get recent submissions error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching recent submissions",
        error: error.message,
      });
    }
  };

  checkQuestionSolved = async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId } = req.params;
      const solved = await submissionService.hasUserSolvedQuestion(
        req.user!.id,
        questionId
      );
      res.status(200).json({
        success: true,
        data: { solved },
      });
    } catch (error: any) {
      console.error("Check question solved error:", error);
      res.status(500).json({
        success: false,
        message: "Error checking solve status",
        error: error.message,
      });
    }
  };
}

export default new SubmissionController();
