import { Request, Response } from "express";
import submissionService from "../services/submission.service";

export const submitCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { questionId, code, language } = req.body;
    if (!questionId || !code || !language) {
      res.status(400).json({
        success: false,
        message: "Please provide questionid code and language",
      });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const submission = await submissionService.submitCode({
      userId: req.user.id,
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

export const runCode = async (req: Request, res: Response): Promise<void> => {
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

export const getUserSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;
    if (req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }
    const { limit } = req.query;
    const submission = await submissionService.getUserSubmissions(
      req.user.id,
      limit ? parseInt(limit as string) : 50
    );

    res.status(200).json({
      success: true,
      count: submission.length,
      data: submission,
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

export const getUserQuestionSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const { quesitonId } = req.params;
    const submissions = await submissionService.getUserQuestionSubmissions(
      req.user.id,
      quesitonId
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

export const getSubmissionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id);

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

export const getUserStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const stats = await submissionService.getUserStatistics(req.user.id);
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

export const getRecentSubmission = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }
    const { limit } = req.query;
    const submissions = await submissionService.getRecentSubmissions(
      req.user.id,
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

export const checkQuestionSolved = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { questionId } = req.params;
    const solved = await submissionService.hasUserSolvedQuestion(
      req.user.id,
      questionId
    );
    res.status(200).json({
        success:true,
        data:solved
    })
  } catch (error:any) {
    console.error('Check question solved error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking solve status',
      error: error.message
    });
  }
};
