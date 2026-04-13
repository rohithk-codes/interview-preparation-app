"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interview_service_1 = __importDefault(require("../services/interview.service"));
const request_1 = require("../utils/request");
class InterviewController {
    constructor() {
        this.startSession = async (req, res) => {
            try {
                const { category, type, difficulty, questionCount } = req.body;
                if (!category || !type) {
                    res.status(400).json({
                        success: false,
                        message: 'Category and type are required'
                    });
                    return;
                }
                const result = await interview_service_1.default.startSession({
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
            }
            catch (error) {
                console.error('Start session error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to start session',
                    error: error.message
                });
            }
        };
        this.submitAnswer = async (req, res) => {
            try {
                const { sessionId, questionId, answer, isVoiceAnswer, timeSpent } = req.body;
                if (!sessionId || !questionId || !answer) {
                    res.status(400).json({
                        success: false,
                        message: 'Session ID, question ID, and answer are required'
                    });
                    return;
                }
                const result = await interview_service_1.default.submitAnswer({
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
            }
            catch (error) {
                console.error('Submit answer error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to submit answer',
                    error: error.message
                });
            }
        };
        this.getCurrentQuestion = async (req, res) => {
            try {
                const sessionId = (0, request_1.getSingleValue)(req.params.sessionId);
                if (!sessionId) {
                    res.status(400).json({
                        success: false,
                        message: 'Session ID is required'
                    });
                    return;
                }
                const question = await interview_service_1.default.getCurrentQuestion(sessionId);
                res.status(200).json({
                    success: true,
                    data: question
                });
            }
            catch (error) {
                console.error('Get current question error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to get question',
                    error: error.message
                });
            }
        };
        this.getSession = async (req, res) => {
            try {
                const sessionId = (0, request_1.getSingleValue)(req.params.sessionId);
                if (!sessionId) {
                    res.status(400).json({
                        success: false,
                        message: 'Session ID is required'
                    });
                    return;
                }
                const session = await interview_service_1.default.getSession(sessionId);
                res.status(200).json({
                    success: true,
                    data: session
                });
            }
            catch (error) {
                console.error('Get session error:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to get session',
                    error: error.message
                });
            }
        };
        this.getHistory = async (req, res) => {
            try {
                const { limit } = req.query;
                const sessions = await interview_service_1.default.getUserSessions(req.user.id, limit ? parseInt(limit) : 20);
                res.status(200).json({
                    success: true,
                    count: sessions.length,
                    data: sessions
                });
            }
            catch (error) {
                console.error('Get history error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to get history',
                    error: error.message
                });
            }
        };
        this.getStats = async (req, res) => {
            try {
                const stats = await interview_service_1.default.getUserStats(req.user.id);
                res.status(200).json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                console.error('Get stats error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to get statistics',
                    error: error.message
                });
            }
        };
        this.abandonSession = async (req, res) => {
            try {
                const sessionId = (0, request_1.getSingleValue)(req.params.sessionId);
                if (!sessionId) {
                    res.status(400).json({
                        success: false,
                        message: 'Session ID is required'
                    });
                    return;
                }
                await interview_service_1.default.abandonSession(sessionId);
                res.status(200).json({
                    success: true,
                    message: 'Session abandoned'
                });
            }
            catch (error) {
                console.error('Abandon session error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to abandon session',
                    error: error.message
                });
            }
        };
        this.getFilters = async (req, res) => {
            try {
                const filters = await interview_service_1.default.getAvailableFilters();
                res.status(200).json({
                    success: true,
                    data: filters
                });
            }
            catch (error) {
                console.error('Get filters error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to get filters',
                    error: error.message
                });
            }
        };
        this.getQuestionCount = async (req, res) => {
            try {
                const { category, type } = req.query;
                if (!category || !type) {
                    res.status(400).json({
                        success: false,
                        message: 'Category and type are required'
                    });
                    return;
                }
                const count = await interview_service_1.default.getQuestionCount(category, type);
                res.status(200).json({
                    success: true,
                    data: { count }
                });
            }
            catch (error) {
                console.error('Get question count error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to get question count',
                    error: error.message
                });
            }
        };
    }
}
exports.default = new InterviewController();
