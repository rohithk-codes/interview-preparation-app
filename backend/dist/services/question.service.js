"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const question_repository_1 = __importDefault(require("../repositories/question.repository"));
class QuestionService {
    // Get all questions with filters
    async getAllQuestions(filters, pagination) {
        const { questions, total } = await question_repository_1.default.findWithFilters(filters, pagination);
        return {
            questions,
            total,
            page: pagination.page,
            pages: Math.ceil(total / pagination.limit)
        };
    }
    // Get single question by ID
    async getQuestionById(questionId, includeHiddenTests = false) {
        const question = await question_repository_1.default.findByIdPublic(questionId);
        if (!question) {
            throw new Error('Question not found');
        }
        // Filter hidden test cases for non-admin users
        if (!includeHiddenTests) {
            const filteredTestCases = question.testCases.filter(tc => !tc.isHidden);
            return {
                ...question.toObject(),
                testCases: filteredTestCases
            };
        }
        return question;
    }
    async getQuestionWithSolution(questionId) {
        const question = await question_repository_1.default.findByIdWithSolution(questionId);
        if (!question) {
            throw new Error('Question not found');
        }
        return question;
    }
    // Create new question
    async createQuestion(data) {
        const titleExists = await question_repository_1.default.titleExists(data.title);
        if (titleExists) {
            throw new Error('A question with this title already exists');
        }
        // Validate test cases
        if (!data.testCases || data.testCases.length === 0) {
            throw new Error('At least one test case is required');
        }
        return await question_repository_1.default.create(data);
    }
    async updateQuestion(questionId, data) {
        const existingQuestion = await question_repository_1.default.findById(questionId);
        if (!existingQuestion) {
            throw new Error('Question not found');
        }
        // If updating title, check for duplicates
        if (data.title && data.title !== existingQuestion.title) {
            const titleExists = await question_repository_1.default.titleExists(data.title, questionId);
            if (titleExists) {
                throw new Error('A question with this title already exists');
            }
        }
        const updatedQuestion = await question_repository_1.default.update(questionId, data);
        if (!updatedQuestion) {
            throw new Error('Failed to update question');
        }
        return updatedQuestion;
    }
    async deleteQuestion(questionId) {
        const deleted = await question_repository_1.default.delete(questionId);
        if (!deleted) {
            throw new Error('Question not found or already deleted');
        }
    }
    // Get all topics
    async getTopics() {
        const topics = await question_repository_1.default.getDistinctTopics();
        return topics.sort();
    }
    // Get question statistics
    async getStatistics() {
        const [total, byDifficulty, byTopic] = await Promise.all([
            question_repository_1.default.countDocuments({}),
            question_repository_1.default.getCountByDifficulty(),
            question_repository_1.default.getTopicStatistics()
        ]);
        return {
            total,
            byDifficulty,
            byTopic
        };
    }
    async getQuestionsByDifficulty(difficulty) {
        if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
            throw new Error('Invalid difficulty level');
        }
        return await question_repository_1.default.findByDifficulty(difficulty);
    }
    async getQuestionsByTopic(topic) {
        return await question_repository_1.default.findByTopic(topic);
    }
    async recordSubmission(questionId, isSuccessful) {
        await question_repository_1.default.incrementSubmissions(questionId, isSuccessful);
    }
}
exports.QuestionService = QuestionService;
exports.default = new QuestionService();
