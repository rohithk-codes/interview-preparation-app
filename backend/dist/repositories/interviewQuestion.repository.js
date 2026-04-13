"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewQuestionRepository = void 0;
const base_repository_1 = require("./base.repository");
const InterviewQuestion_1 = __importDefault(require("../models/chat/InterviewQuestion"));
class InterviewQuestionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(InterviewQuestion_1.default);
    }
    // Get questions by category and type
    async findByFilters(category, type, difficulty, limit = 10) {
        const query = { category, type };
        if (difficulty) {
            query.difficulty = difficulty;
        }
        return await InterviewQuestion_1.default.find(query)
            .limit(limit)
            .sort({ difficulty: 1, createdAt: -1 });
    }
    // Get random questions for a session
    async getRandomQuestions(category, type, count = 10) {
        return await InterviewQuestion_1.default.aggregate([
            { $match: { category, type } },
            { $sample: { size: count } }
        ]);
    }
    // Get questions by difficulty distribution
    async getBalancedQuestions(category, type, totalCount = 10) {
        // Get 30% easy, 50% medium, 20% hard
        const easyCount = Math.floor(totalCount * 0.3);
        const mediumCount = Math.floor(totalCount * 0.5);
        const hardCount = totalCount - easyCount - mediumCount;
        const [easy, medium, hard] = await Promise.all([
            InterviewQuestion_1.default.aggregate([
                { $match: { category, type, difficulty: 'easy' } },
                { $sample: { size: easyCount } }
            ]),
            InterviewQuestion_1.default.aggregate([
                { $match: { category, type, difficulty: 'medium' } },
                { $sample: { size: mediumCount } }
            ]),
            InterviewQuestion_1.default.aggregate([
                { $match: { category, type, difficulty: 'hard' } },
                { $sample: { size: hardCount } }
            ])
        ]);
        return [...easy, ...medium, ...hard];
    }
    // Get question count by filters
    async countByFilters(category, type, difficulty) {
        const query = { category, type };
        if (difficulty) {
            query.difficulty = difficulty;
        }
        return await InterviewQuestion_1.default.countDocuments(query);
    }
    // Get all categories
    async getCategories() {
        return await InterviewQuestion_1.default.distinct('category');
    }
    // Get all types
    async getTypes() {
        return await InterviewQuestion_1.default.distinct('type');
    }
}
exports.InterviewQuestionRepository = InterviewQuestionRepository;
exports.default = new InterviewQuestionRepository();
