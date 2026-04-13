"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionRepository = void 0;
const base_repository_1 = require("./base.repository");
const Submission_1 = __importDefault(require("../models/Submission"));
class SubmissionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Submission_1.default);
    }
    //Find Submission by user ID
    async findByUserId(userId, limit = 50) {
        return await Submission_1.default.find({ userId })
            .populate("questionId", "title difficulty topic")
            .sort({ submittedAt: -1 })
            .limit(limit);
    }
    //Find submission by question ID
    async findByQuestionId(questionId, limit = 50) {
        return await Submission_1.default.find({ questionId })
            .populate("userId", "name email")
            .sort({ submittedAt: -1 })
            .limit(limit);
    }
    //Find user's submissions for a specific question
    async findByUserAndQuestion(userId, questionId) {
        return await Submission_1.default.find({
            userId,
            questionId,
        }).sort({
            submittedAt: -1,
        });
    }
    // Check if user has solved a question
    async hasUserSolvedQuestion(userId, questionId) {
        const count = await Submission_1.default.countDocuments({ userId, questionId }).sort({
            submittedAt: -1,
        });
        return count > 0;
    }
    //Users latest submission for a question
    async getLatestSubmissions(userId, questionId) {
        return await Submission_1.default.findOne({ userId, questionId }).sort({
            submittedAt: -1,
        });
    }
    // Get user statistics
    async getUserStats(userId) {
        const [totalSubmissions, acceptedSubmissions, byDifficulty] = await Promise.all([
            Submission_1.default.countDocuments({ userId }),
            Submission_1.default.countDocuments({ userId, status: "Accepted" }),
            this.getUserStatsByDifficulty(userId),
        ]);
        // Get unique solved questions
        const solvedQuestion = await Submission_1.default.distinct("questionId", {
            userId,
            status: "Accepted",
        });
        return {
            totalSubmissions,
            acceptedSubmissions,
            totalSolved: solvedQuestion.length,
            successRate: totalSubmissions > 0
                ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
                : 0,
            byDifficulty,
        };
    }
    //Get users stats by difficulty
    async getUserStatsByDifficulty(userId) {
        const result = await Submission_1.default.aggregate([
            {
                $match: {
                    userId: new Submission_1.default.base.Types.ObjectId(userId),
                    status: "Accepted",
                },
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "questionId",
                    foreignField: "_id",
                    as: "question",
                },
            },
            {
                $unwind: "$question",
            },
            {
                $group: {
                    _id: "$question.difficulty",
                    count: { $addToSet: "$questionId" },
                },
            },
            {
                $project: {
                    difficulty: "$_id",
                    count: { $size: "$count" },
                    _id: 0,
                },
            },
        ]);
        const stats = { Easy: 0, Midum: 0, Hard: 0 };
        result.forEach((item) => {
            stats[item.difficulty] = item.count;
        });
        return stats;
    }
    //Recent submission for dashboard
    async getRecentSubmissions(userId, limit = 10) {
        return await Submission_1.default.find({ userId })
            .populate("questionId", "title difficulty")
            .sort({ submittedAt: -1 })
            .limit(limit)
            .select("questionId status passedTestCases totalTestCases submittedAt");
    }
    //Submission by status
    async findByStatus(status, limit = 50) {
        return await Submission_1.default.find({ status })
            .populate("userId", "name email")
            .populate("questionId", "title difficulty")
            .sort({ submittedAt: -1 })
            .limit(limit);
    }
    //Get all solved quesiton IDs for user
    async getSolvedQuestionIds(userId) {
        const submissions = await Submission_1.default.distinct("questionId", {
            userId,
            status: "Accepted",
        });
        return submissions.map((id) => id.toString());
    }
    //Update submission status
    async updateStatus(submissionId, status, additionalData) {
        return await Submission_1.default.findByIdAndUpdate(submissionId, {
            $set: {
                status,
                ...additionalData,
            },
        }, { new: true });
    }
    //Delete submission when question deleted
    async deleteByQuestionId(questionId) {
        const result = await Submission_1.default.deleteMany({ questionId });
        return result.deletedCount || 0;
    }
    //Get submission statistics for question
    async getQuestionSubmissionStats(questionId) {
        const [total, accepted] = await Promise.all([
            Submission_1.default.countDocuments({ questionId }),
            Submission_1.default.countDocuments({ questionId, status: "Accepted" }),
        ]);
        return {
            totalSubmissions: total,
            acceptedSubmissions: accepted,
            acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
        };
    }
}
exports.SubmissionRepository = SubmissionRepository;
exports.default = new SubmissionRepository();
