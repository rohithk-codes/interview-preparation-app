"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewSessionRepository = void 0;
const base_repository_1 = require("./base.repository");
const InterviewSession_1 = __importDefault(require("../models/chat/InterviewSession"));
class InterviewSessionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(InterviewSession_1.default);
    }
    // Get user's sessions
    async findByUserId(userId, limit = 20) {
        return await InterviewSession_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
    // Get active session for user
    async getActiveSession(userId) {
        return await InterviewSession_1.default.findOne({
            userId,
            status: 'in-progress'
        }).sort({ createdAt: -1 });
    }
    // Get session with populated questions
    async findByIdWithQuestions(sessionId) {
        return await InterviewSession_1.default.findById(sessionId)
            .populate('questionIds')
            .populate('userId', 'name email');
    }
    // Get completed sessions
    async getCompletedSessions(userId) {
        return await InterviewSession_1.default.find({
            userId,
            status: 'completed'
        }).sort({ completedAt: -1 });
    }
    // Get session statistics
    async getUserStats(userId) {
        const sessions = await InterviewSession_1.default.find({
            userId,
            status: 'completed'
        });
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                averageScore: 0,
                totalQuestionsAnswered: 0,
                voiceAnswersPercentage: 0,
                byCategory: {},
                byDifficulty: {}
            };
        }
        const totalScore = sessions.reduce((sum, s) => sum + s.overallPercentage, 0);
        const totalQuestions = sessions.reduce((sum, s) => sum + s.answers.length, 0);
        const totalVoiceAnswers = sessions.reduce((sum, s) => sum + s.voiceAnswersCount, 0);
        // Group by category
        const byCategory = {};
        sessions.forEach(session => {
            if (!byCategory[session.category]) {
                byCategory[session.category] = {
                    count: 0,
                    averageScore: 0,
                    totalScore: 0
                };
            }
            byCategory[session.category].count++;
            byCategory[session.category].totalScore += session.overallPercentage;
            byCategory[session.category].averageScore = Math.round(byCategory[session.category].totalScore / byCategory[session.category].count);
        });
        return {
            totalSessions: sessions.length,
            averageScore: Math.round(totalScore / sessions.length),
            totalQuestionsAnswered: totalQuestions,
            voiceAnswersPercentage: totalQuestions > 0
                ? Math.round((totalVoiceAnswers / totalQuestions) * 100)
                : 0,
            byCategory,
            recentSessions: sessions.slice(0, 5)
        };
    }
    // Update session status
    async updateStatus(sessionId, status) {
        const updateData = { status };
        if (status === 'completed') {
            updateData.completedAt = new Date();
        }
        return await InterviewSession_1.default.findByIdAndUpdate(sessionId, updateData, { new: true });
    }
    // Add answer to session
    async addAnswer(sessionId, answerData) {
        return await InterviewSession_1.default.findByIdAndUpdate(sessionId, {
            $push: { answers: answerData },
            $inc: {
                currentQuestionIndex: 1,
                totalScore: answerData.score,
                maxPossibleScore: answerData.maxScore,
                totalTimeSpent: answerData.timeSpent,
                ...(answerData.isVoiceAnswer && { voiceAnswersCount: 1 })
            }
        }, { new: true });
    }
}
exports.InterviewSessionRepository = InterviewSessionRepository;
exports.default = new InterviewSessionRepository();
