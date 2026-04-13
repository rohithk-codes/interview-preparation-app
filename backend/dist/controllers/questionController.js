"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const question_service_1 = __importDefault(require("../services/question.service"));
const request_1 = require("../utils/request");
class QuestionController {
    constructor() {
        this.getAllQuestions = async (req, res) => {
            try {
                const { difficulty, topic, search, page = "1", limit = "20" } = req.query;
                const filters = {
                    difficulty: difficulty,
                    topic: topic,
                    search: search,
                };
                const pagination = {
                    page: parseInt(page, 10),
                    limit: parseInt(limit, 10),
                };
                const result = await question_service_1.default.getAllQuestions(filters, pagination);
                res.status(200).json({
                    success: true,
                    count: result.questions.length,
                    total: result.total,
                    page: result.page,
                    pages: result.pages,
                    data: result.questions,
                });
            }
            catch (error) {
                console.error("Get all questions error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching questions",
                    error: error.message,
                });
            }
        };
        this.getQuestionById = async (req, res) => {
            try {
                const id = (0, request_1.getSingleValue)(req.params.id);
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Question ID is required",
                    });
                    return;
                }
                const question = await question_service_1.default.getQuestionById(id);
                res.status(200).json({
                    success: true,
                    data: question,
                });
            }
            catch (error) {
                console.error("Error fetching question by ID:", error);
                res.status(404).json({
                    success: false,
                    message: error.message || "Question not found",
                });
            }
        };
        this.createQuestion = async (req, res) => {
            try {
                const { body, user } = req;
                const questionData = {
                    ...body,
                    createdBy: user?.id,
                };
                const newQuestion = await question_service_1.default.createQuestion(questionData);
                res.status(201).json({
                    success: true,
                    message: "Question created successfully",
                    data: newQuestion,
                });
            }
            catch (error) {
                console.error("Create question error:", error);
                if (error.message === "A question with this title already exists" ||
                    error.message === "At least one test case is required") {
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
        this.updateQuestion = async (req, res) => {
            try {
                const id = (0, request_1.getSingleValue)(req.params.id);
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Question ID is required",
                    });
                    return;
                }
                const updatedQuestion = await question_service_1.default.updateQuestion(id, req.body);
                res.status(200).json({
                    success: true,
                    message: "Question updated successfully",
                    data: updatedQuestion,
                });
            }
            catch (error) {
                console.error("Update question error:", error);
                if (error.message === "Question not found" ||
                    error.message === "A question with this title already exists") {
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
        this.deleteQuestion = async (req, res) => {
            try {
                const id = (0, request_1.getSingleValue)(req.params.id);
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: "Question ID is required",
                    });
                    return;
                }
                await question_service_1.default.deleteQuestion(id);
                res.status(200).json({
                    success: true,
                    message: "Question deleted successfully",
                });
            }
            catch (error) {
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
        this.getTopics = async (req, res) => {
            try {
                const topics = await question_service_1.default.getTopics();
                res.status(200).json({
                    success: true,
                    count: topics.length,
                    data: topics,
                });
            }
            catch (error) {
                console.error("Get topics error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching topics",
                    error: error.message,
                });
            }
        };
        this.getQuestionStats = async (req, res) => {
            try {
                const stats = await question_service_1.default.getStatistics();
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                console.error("Get question stats error:", error);
                res.status(500).json({
                    success: false,
                    message: "Error fetching question statistics",
                    error: error.message,
                });
            }
        };
    }
}
exports.default = new QuestionController();
