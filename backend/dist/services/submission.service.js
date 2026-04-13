"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionService = void 0;
const submission_repository_1 = __importDefault(require("../repositories/submission.repository"));
const question_repository_1 = __importDefault(require("../repositories/question.repository"));
const codeExecutor_1 = __importDefault(require("../utils/codeExecutor"));
class SubmissionService {
    // Submit code for a question
    async submitCode(data) {
        const question = await question_repository_1.default.findByIdWithSolution(data.questionId);
        if (!question) {
            throw new Error('Question not found');
        }
        // Create initial submission
        const submission = await submission_repository_1.default.create({
            userId: data.userId,
            questionId: data.questionId,
            code: data.code,
            language: data.language,
            status: 'Running',
            totalTestCases: question.testCases.length,
            passedTestCases: 0
        });
        this.executeCodeAsync(submission._id.toString(), question.testCases, data.code, data.language);
        return submission;
    }
    // Execute code and update submission
    async executeCodeAsync(submissionId, testCases, code, language) {
        try {
            let executionResult;
            try {
                executionResult = await codeExecutor_1.default.execute(code, language, testCases);
            }
            catch (error) {
                throw new Error(error.message || 'Code execution failed');
            }
            // Determine final status
            const allPassed = executionResult.totalPassed === testCases.length;
            const status = allPassed ? 'Accepted' : 'Wrong Answer';
            const hasErrors = executionResult.testResults.some(tr => tr.error);
            const finalStatus = hasErrors ? 'Runtime Error' : status;
            await submission_repository_1.default.updateStatus(submissionId, finalStatus, {
                testResults: executionResult.testResults,
                passedTestCases: executionResult.totalPassed,
                executionTime: executionResult.executionTime
            });
            // If accepted, update question statistics
            if (finalStatus === 'Accepted') {
                const submission = await submission_repository_1.default.findById(submissionId);
                if (submission) {
                    await question_repository_1.default.incrementSubmissions(submission.questionId.toString(), true);
                }
            }
            else {
                const submission = await submission_repository_1.default.findById(submissionId);
                if (submission) {
                    await question_repository_1.default.incrementSubmissions(submission.questionId.toString(), false);
                }
            }
        }
        catch (error) {
            console.error('Code execution error:', error);
            await submission_repository_1.default.updateStatus(submissionId, 'Runtime Error', {
                error: error.message
            });
        }
    }
    // Get user's submissions
    async getUserSubmissions(userId, limit = 50) {
        return await submission_repository_1.default.findByUserId(userId, limit);
    }
    // Get user's submissions for a specific question
    async getUserQuestionSubmissions(userId, questionId) {
        return await submission_repository_1.default.findByUserAndQuestion(userId, questionId);
    }
    // Get submission by ID
    async getSubmissionById(submissionId) {
        const submission = await submission_repository_1.default.findById(submissionId);
        if (!submission) {
            throw new Error('Submission not found');
        }
        return submission;
    }
    // Check if user has solved a question
    async hasUserSolvedQuestion(userId, questionId) {
        return await submission_repository_1.default.hasUserSolvedQuestion(userId, questionId);
    }
    // Get user statistics
    async getUserStatistics(userId) {
        const stats = await submission_repository_1.default.getUserStats(userId);
        return stats;
    }
    // Get recent submissions for dashboard
    async getRecentSubmissions(userId, limit = 10) {
        return await submission_repository_1.default.getRecentSubmissions(userId, limit);
    }
    // Get all solved question IDs for a user
    async getSolvedQuestionIds(userId) {
        return await submission_repository_1.default.getSolvedQuestionIds(userId);
    }
    // Get submissions for a question (admin only)
    async getQuestionSubmissions(questionId, limit = 50) {
        return await submission_repository_1.default.findByQuestionId(questionId, limit);
    }
    // Run code without submitting 
    async runCode(questionId, code, language) {
        // Get question with public test cases only
        const question = await question_repository_1.default.findByIdPublic(questionId);
        if (!question) {
            throw new Error('Question not found');
        }
        // Get only public test cases
        const publicTestCases = question.testCases.filter(tc => !tc.isHidden);
        if (publicTestCases.length === 0) {
            throw new Error('No public test cases available');
        }
        // Execute code with unified executor
        return await codeExecutor_1.default.execute(code, language, publicTestCases);
    }
    // Delete user's submissions for a question
    async deleteUserQuestionSubmissions(userId, questionId) {
        const submissions = await submission_repository_1.default.findByUserAndQuestion(userId, questionId);
        let deletedCount = 0;
        for (const submission of submissions) {
            const deleted = await submission_repository_1.default.delete(submission._id.toString());
            if (deleted)
                deletedCount++;
        }
        return deletedCount;
    }
}
exports.SubmissionService = SubmissionService;
exports.default = new SubmissionService();
