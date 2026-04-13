"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const submission_service_1 = __importDefault(require("../services/submission.service"));
const request_1 = require("../utils/request");
class SubmissionController {
    constructor() {
        this.submitCode = async (req, res) => {
            try {
                const { questionId, code, language } = req.body;
                if (!questionId || !code || !language) {
                    res.status(400).json({
                        success: false,
                        message: "Please provide questionId, code, and language",
                    });
                    return;
                }
                const submission = await submission_service_1.default.submitCode({
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
            }
            catch (error) {
                console.error("Submit code error", error);
                res.status(500).json({
                    success: false,
                    message: "Error submitting code",
                    error: error.message,
                });
            }
        };
        this.runCode = async (req, res) => {
            try {
                const { questionId, code, language } = req.body;
                if (!questionId || !code || !language) {
                    res.status(400).json({
                        success: false,
                        message: "Please provide questionId, code, and language",
                    });
                    return;
                }
                const result = await submission_service_1.default.runCode(questionId, code, language);
                res.status(200).json({
                    success: true,
                    message: "Code executed successfully",
                    data: result,
                });
            }
            catch (error) {
                console.error("Run code error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error running code",
                    error: error.message,
                });
            }
        };
        this.getUserSubmissions = async (req, res) => {
            try {
                const { limit } = req.query;
                const submissions = await submission_service_1.default.getUserSubmissions(req.user.id, limit ? parseInt(limit) : 50);
                res.status(200).json({
                    success: true,
                    count: submissions.length,
                    data: submissions,
                });
            }
            catch (error) {
                console.error("Get user submissions error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching submissions",
                    error: error.message,
                });
            }
        };
        this.getUserQuestionSubmissions = async (req, res) => {
            try {
                const questionId = (0, request_1.getSingleValue)(req.params.questionId);
                if (!questionId) {
                    res.status(400).json({
                        success: false,
                        message: "Question ID is required",
                    });
                    return;
                }
                const submissions = await submission_service_1.default.getUserQuestionSubmissions(req.user.id, questionId);
                res.status(200).json({
                    success: true,
                    count: submissions.length,
                    data: submissions,
                });
            }
            catch (error) {
                console.error("Get user question submissions error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching submissions",
                    error: error.message,
                });
            }
        };
        this.getSubmissionById = async (req, res) => {
            try {
                const id = (0, request_1.getSingleValue)(req.params.id);
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Submission ID is required",
                    });
                    return;
                }
                const submission = await submission_service_1.default.getSubmissionById(id);
                // Business logic: check if user is authorized to view this submission
                // Note: In a very strict repository pattern, this might be in the service layer
                if (submission.userId.toString() !== req.user?.id &&
                    req.user?.role !== "admin") {
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
            }
            catch (error) {
                console.error("Get submission by ID error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching submission",
                    error: error.message,
                });
            }
        };
        this.getUserStats = async (req, res) => {
            try {
                const stats = await submission_service_1.default.getUserStatistics(req.user.id);
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                console.error("Get user stats error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching statistics",
                    error: error.message,
                });
            }
        };
        this.getRecentSubmission = async (req, res) => {
            try {
                const { limit } = req.query;
                const submissions = await submission_service_1.default.getRecentSubmissions(req.user.id, limit ? parseInt(limit) : 10);
                res.status(200).json({
                    success: true,
                    count: submissions.length,
                    data: submissions,
                });
            }
            catch (error) {
                console.error("Get recent submissions error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching recent submissions",
                    error: error.message,
                });
            }
        };
        this.checkQuestionSolved = async (req, res) => {
            try {
                const questionId = (0, request_1.getSingleValue)(req.params.questionId);
                if (!questionId) {
                    res.status(400).json({
                        success: false,
                        message: "Question ID is required",
                    });
                    return;
                }
                const solved = await submission_service_1.default.hasUserSolvedQuestion(req.user.id, questionId);
                res.status(200).json({
                    success: true,
                    data: { solved },
                });
            }
            catch (error) {
                console.error("Check question solved error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error checking solve status",
                    error: error.message,
                });
            }
        };
    }
}
exports.default = new SubmissionController();
