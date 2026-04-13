"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRepository = void 0;
const base_repository_1 = require("./base.repository");
const Question_1 = __importDefault(require("../models/Question"));
class QuestionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Question_1.default);
    }
    // Find questions with filters and pagination
    async findWithFilters(filters, pagination) {
        const query = {};
        if (filters.difficulty) {
            query.difficulty = filters.difficulty;
        }
        if (filters.topic) {
            query.topic = filters.topic;
        }
        if (filters.search) {
            query.$text = { $search: filters.search };
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [questions, total] = await Promise.all([
            Question_1.default.find(query)
                .select("-solution -testCases")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit),
            Question_1.default.countDocuments(query),
        ]);
        return { questions, total };
    }
    // Get question by ID without solution
    async findByIdPublic(id) {
        return await Question_1.default.findById(id)
            .select("-solution")
            .populate("createdBy", "name email");
    }
    // Get question by ID with solution for admin or after solving
    async findByIdWithSolution(id) {
        return await Question_1.default.findById(id).populate("createdBy", "name email");
    }
    // Check if title exists
    async titleExists(title, excludeId) {
        const query = { title };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await Question_1.default.countDocuments(query);
        return count > 0;
    }
    // Get all unique topics
    async getDistinctTopics() {
        return await Question_1.default.distinct("topic");
    }
    // Get questions by difficulty
    async findByDifficulty(difficulty) {
        return await Question_1.default.find({ difficulty }).select("-solution -testCases");
    }
    // Get questions by topic
    async findByTopic(topic) {
        return await Question_1.default.find({ topic }).select("-solution -testCases");
    }
    // Get difficulty-wise count
    async getCountByDifficulty() {
        const [easy, medium, hard] = await Promise.all([
            Question_1.default.countDocuments({ difficulty: "Easy" }),
            Question_1.default.countDocuments({ difficulty: "Medium" }),
            Question_1.default.countDocuments({ difficulty: "Hard" }),
        ]);
        return { Easy: easy, Medium: medium, Hard: hard };
    }
    // Get topic-wise statistics
    async getTopicStatistics() {
        return await Question_1.default.aggregate([
            {
                $group: {
                    _id: "$topic",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    topic: "$_id",
                    count: 1,
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
    }
    // Update submission statistics
    async incrementSubmissions(questionId, isSuccessful) {
        const updateQuery = { $inc: { totalSubmissions: 1 } };
        if (isSuccessful) {
            updateQuery.$inc.successfulSubmissions = 1;
        }
        await Question_1.default.findByIdAndUpdate(questionId, updateQuery);
        // Update acceptance rate
        const question = await Question_1.default.findById(questionId);
        if (question && question.totalSubmissions > 0) {
            question.acceptanceRate = Math.round((question.successfulSubmissions / question.totalSubmissions) * 100);
            await question.save();
        }
    }
}
exports.QuestionRepository = QuestionRepository;
exports.default = new QuestionRepository();
