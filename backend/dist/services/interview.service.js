"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewService = void 0;
const interviewQuestion_repository_1 = __importDefault(require("../repositories/interviewQuestion.repository"));
const interviewSession_repository_1 = __importDefault(require("../repositories/interviewSession.repository"));
const answerEvaluator_service_1 = __importDefault(require("./answerEvaluator.service"));
class InterviewService {
    async startSession(data) {
        const activeSession = await interviewSession_repository_1.default.getActiveSession(data.userId);
        if (activeSession) {
            const currentQuestion = await interviewQuestion_repository_1.default.findById(activeSession.questionIds[activeSession.currentQuestionIndex].toString());
            if (!currentQuestion) {
                throw new Error("Question not found");
            }
            return {
                session: activeSession,
                firstQuestion: currentQuestion,
            };
        }
        const questions = await interviewQuestion_repository_1.default.getBalancedQuestions(data.category, data.type, data.questionCount || 10);
        if (questions.length === 0) {
            throw new Error(`No question found for ${data.category} ${data.type}`);
        }
        const session = await interviewSession_repository_1.default.create({
            userId: data.userId,
            category: data.category,
            type: data.type,
            difficulty: data.difficulty || "medium",
            status: "in-progress",
            currentQuestionIndex: 0,
            questionIds: questions.map((q) => q._id),
            answers: [],
            totalScore: 0,
            maxPossibleScore: 0,
            overallPercentage: 0,
            totalTimeSpent: 0,
            voiceAnswersCount: 0,
            startedAt: new Date(),
        });
        return {
            session,
            firstQuestion: questions[0],
        };
    }
    // Submit answer and get next question
    async submitAnswer(data) {
        const session = await interviewSession_repository_1.default.findById(data.sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        if (session.status !== "in-progress") {
            throw new Error("Session is not active");
        }
        const question = await interviewQuestion_repository_1.default.findById(data.questionId);
        if (!question) {
            throw new Error("Question not found");
        }
        const evaluation = answerEvaluator_service_1.default.evaluate(data.answer, question);
        //Prepare answer data
        const answerData = {
            questionId: question._id,
            questionText: question.question,
            userAnswer: data.answer,
            isVoiceAnswer: data.isVoiceAnswer,
            score: evaluation.score,
            maxScore: evaluation.maxScore,
            percentage: evaluation.percentage,
            matchedKeywords: evaluation.matchedKeywords,
            missedKeywords: evaluation.missedKeywords,
            feedback: evaluation.feedback,
            timeSpent: data.timeSpent,
            answeredAt: new Date(),
        };
        // Add answer to session
        const updatedSession = await interviewSession_repository_1.default.addAnswer(data.sessionId, answerData);
        if (!updatedSession) {
            throw new Error("Failed to update session");
        }
        const isComplete = updatedSession.currentQuestionIndex >= updatedSession.questionIds.length;
        let nextQuestion = null;
        let sessionSummary = undefined;
        if (isComplete) {
            updatedSession.calculateOverallScore();
            await updatedSession.save();
            await interviewSession_repository_1.default.updateStatus(data.sessionId, "completed");
            sessionSummary = this.generateSessionSummary(updatedSession);
        }
        else {
            nextQuestion = await interviewQuestion_repository_1.default.findById(updatedSession.questionIds[updatedSession.currentQuestionIndex].toString());
        }
        return {
            evaluation: {
                ...evaluation,
                questionText: question.question,
            },
            nextQuestion,
            isComplete,
            sessionSummary,
        };
    }
    async getCurrentQuestion(sessionId) {
        const session = await interviewSession_repository_1.default.findById(sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        const currentQuestion = await interviewQuestion_repository_1.default.findById(session.questionIds[session.currentQuestionIndex].toString());
        if (!currentQuestion) {
            throw new Error("question not found");
        }
        return currentQuestion;
    }
    async getSession(sessionId) {
        const session = await interviewSession_repository_1.default.findByIdWithQuestions(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        return session;
    }
    async getUserSessions(userId, limit = 20) {
        return await interviewSession_repository_1.default.findByUserId(userId, limit);
    }
    async getUserStats(userId) {
        return await interviewSession_repository_1.default.getUserStats(userId);
    }
    async abandonSession(sessionId) {
        await interviewSession_repository_1.default.updateStatus(sessionId, 'abandoned');
    }
    generateSessionSummary(session) {
        const totalQuestions = session.answers.length;
        const excellentAnswers = session.answers.filter(a => a.percentage >= 80).length;
        const goodAnswers = session.answers.filter(a => a.percentage >= 60 && a.percentage < 80).length;
        const needsImprovement = session.answers.filter(a => a.percentage < 60).length;
        // Find strongest and weakest areas
        const keywordStats = {};
        session.answers.forEach(answer => {
            answer.matchedKeywords.forEach(kw => {
                keywordStats[kw] = (keywordStats[kw] || 0) + 1;
            });
        });
        const strongestConcepts = Object.entries(keywordStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map((entry) => entry[0]);
        const missedConcepts = new Set();
        session.answers.forEach(answer => {
            answer.missedKeywords.forEach(kw => missedConcepts.add(kw));
        });
        return {
            totalQuestions,
            overallScore: session.overallPercentage,
            totalTimeSpent: session.totalTimeSpent,
            voiceAnswersCount: session.voiceAnswersCount,
            breakdown: {
                excellent: excellentAnswers,
                good: goodAnswers,
                needsImprovement
            },
            strongestConcepts,
            areasToImprove: Array.from(missedConcepts).slice(0, 5),
            recommendations: this.generateRecommendations(session)
        };
    }
    // Generate personalized recommendations
    generateRecommendations(session) {
        const recommendations = [];
        if (session.overallPercentage >= 80) {
            recommendations.push('Great job! Try harder difficulty questions to challenge yourself.');
        }
        else if (session.overallPercentage >= 60) {
            recommendations.push('Good progress! Review the missed concepts and try again.');
        }
        else {
            recommendations.push('Focus on fundamental concepts. Try easier questions first.');
        }
        if (session.voiceAnswersCount > 0) {
            recommendations.push('Great use of voice answers! Keep practicing verbal explanations.');
        }
        else {
            recommendations.push('Try using voice answers to practice explaining concepts verbally.');
        }
        const avgTimePerQuestion = session.totalTimeSpent / session.answers.length;
        if (avgTimePerQuestion > 180) {
            recommendations.push('Work on answering questions more concisely.');
        }
        return recommendations;
    }
    // Get available categories and types
    async getAvailableFilters() {
        const [categories, types] = await Promise.all([
            interviewQuestion_repository_1.default.getCategories(),
            interviewQuestion_repository_1.default.getTypes()
        ]);
        return { categories, types };
    }
    // Get question count by filters
    async getQuestionCount(category, type) {
        return await interviewQuestion_repository_1.default.countByFilters(category, type);
    }
}
exports.InterviewService = InterviewService;
exports.default = new InterviewService();
