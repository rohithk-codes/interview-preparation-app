import submissionRepository from '../repositories/submission.repository';
import questionRepository from '../repositories/question.repository';
import codeExecutor from '../utils/codeExecutor';
import type { ISubmission, SubmissionStatus } from '../models/Submission';

export interface SubmitCodeDTO {
  userId: string;
  questionId: string;
  code: string;
  language: string;
}

export class SubmissionService {
  // Submit code for a question
  async submitCode(data: SubmitCodeDTO): Promise<ISubmission> {
   
    const question = await questionRepository.findByIdWithSolution(
      data.questionId
    );

    if (!question) {
      throw new Error('Question not found');
    }

    // Create initial submission
    const submission = await submissionRepository.create({
      userId: data.userId,
      questionId: data.questionId,
      code: data.code,
      language: data.language,
      status: 'Running' as SubmissionStatus,
      totalTestCases: question.testCases.length,
      passedTestCases: 0
    } as any);

   
    this.executeCodeAsync(submission.id.toString(), question.testCases, data.code, data.language);

    return submission;
  }

  // Execute code and update submission
  private async executeCodeAsync(
    submissionId: string,
    testCases: any[],
    code: string,
    language: string
  ): Promise<void> {
    try {
      let executionResult;

      
      try {
        executionResult = await codeExecutor.execute(code, language, testCases);
      } catch (error: any) {
        throw new Error(error.message || 'Code execution failed');
      }

      // Determine final status
      const allPassed = executionResult.totalPassed === testCases.length;
      const status: SubmissionStatus = allPassed ? 'Accepted' : 'Wrong Answer';

      
      const hasErrors = executionResult.testResults.some(tr => tr.error);
      const finalStatus = hasErrors ? 'Runtime Error' as SubmissionStatus : status;

     
      await submissionRepository.updateStatus(submissionId, finalStatus, {
        testResults: executionResult.testResults,
        passedTestCases: executionResult.totalPassed,
        executionTime: executionResult.executionTime
      });

      // If accepted, update question statistics
      if (finalStatus === 'Accepted') {
        const submission = await submissionRepository.findById(submissionId);
        if (submission) {
          await questionRepository.incrementSubmissions(
            submission.questionId.toString(),
            true
          );
        }
      } else {
        const submission = await submissionRepository.findById(submissionId);
        if (submission) {
          await questionRepository.incrementSubmissions(
            submission.questionId.toString(),
            false
          );
        }
      }
    } catch (error: any) {
      console.error('Code execution error:', error);
      
    
      await submissionRepository.updateStatus(submissionId, 'Runtime Error', {
        error: error.message
      });
    }
  }

  // Get user's submissions
  async getUserSubmissions(
    userId: string,
    limit: number = 50
  ): Promise<ISubmission[]> {
    return await submissionRepository.findByUserId(userId, limit);
  }

  // Get user's submissions for a specific question
  async getUserQuestionSubmissions(
    userId: string,
    questionId: string
  ): Promise<ISubmission[]> {
    return await submissionRepository.findByUserAndQuestion(userId, questionId);
  }

  // Get submission by ID
  async getSubmissionById(submissionId: string): Promise<ISubmission> {
    const submission = await submissionRepository.findById(submissionId);

    if (!submission) {
      throw new Error('Submission not found');
    }

    return submission;
  }

  // Check if user has solved a question
  async hasUserSolvedQuestion(
    userId: string,
    questionId: string
  ): Promise<boolean> {
    return await submissionRepository.hasUserSolvedQuestion(userId, questionId);
  }

  // Get user statistics
  async getUserStatistics(userId: string) {
    const stats = await submissionRepository.getUserStats(userId);
    return stats;
  }

  // Get recent submissions for dashboard
  async getRecentSubmissions(
    userId: string,
    limit: number = 10
  ): Promise<ISubmission[]> {
    return await submissionRepository.getRecentSubmissions(userId, limit);
  }

  // Get all solved question IDs for a user
  async getSolvedQuestionIds(userId: string): Promise<string[]> {
    return await submissionRepository.getSolvedQuestionIds(userId);
  }

  // Get submissions for a question (admin only)
  async getQuestionSubmissions(
    questionId: string,
    limit: number = 50
  ): Promise<ISubmission[]> {
    return await submissionRepository.findByQuestionId(questionId, limit);
  }

  // Run code without submitting 
  async runCode(
    questionId: string,
    code: string,
    language: string
  ): Promise<{
    testResults: any[];
    totalPassed: number;
    totalFailed: number;
    executionTime: number;
  }> {
    // Get question with public test cases only
    const question = await questionRepository.findByIdPublic(questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    // Get only public test cases
    const publicTestCases = question.testCases.filter(tc => !tc.isHidden);

    if (publicTestCases.length === 0) {
      throw new Error('No public test cases available');
    }

    // Execute code with unified executor
    return await codeExecutor.execute(code, language, publicTestCases);
  }

  // Delete user's submissions for a question
  async deleteUserQuestionSubmissions(
    userId: string,
    questionId: string
  ): Promise<number> {
    const submissions = await submissionRepository.findByUserAndQuestion(
      userId,
      questionId
    );

    let deletedCount = 0;
    for (const submission of submissions) {
      const deleted = await submissionRepository.delete(submission.id.toString());
      if (deleted) deletedCount++;
    }

    return deletedCount;
  }
}


export default new SubmissionService();