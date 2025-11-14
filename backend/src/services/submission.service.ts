import submissionRepository from "../repositories/submission.repository";
import questionRepository from "../repositories/question.repository";
import codeExecutor from "../utils/codeExecutor";
import { ISubmission, SubmissionStatus } from "../models/Submission";

export interface SubmitCodeDTO {
  userId: string;
  questionId: string;
  code: string;
  language: string;
}

export class SubmissionService {
  async submitCode(data: SubmitCodeDTO): Promise<ISubmission> {
    const question = await questionRepository.findByIdWithSolution(
      data.questionId
    );

    if (!question) {
      throw new Error("Question not found");
    }

    //Initial submission
    const submission = await submissionRepository.create({
      userId: data.userId,
      questionId: data.questionId,
      code: data.code,
      language: data.language,
      status: "Running" as SubmissionStatus,
      totalTestCases: question.testCases.length,
      passedTestCases: 0,
    } as any);

    //Execute code asynchronously
    this.executeCodeAsync(
      submission.id.toString(),
      question.testCases,
      data.code,
      data.language
    );

    return submission;
  }

  private async executeCodeAsync(
    submissionId: string,
    testCases: any[],
    code: string,
    language: string
  ): Promise<void> {
    try {
      let executionResult;

      //Execute based on language
      if (language === "javascript") {
        executionResult = await codeExecutor.executeJavaScritp(code, testCases);
      } else if (language === "python") {
        executionResult = await codeExecutor.executePython(code, testCases);
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }

      //Final status
      const allPassed = executionResult.totalPassed === testCases.length;
      const status: SubmissionStatus = allPassed ? "Accepted" : "Wrong Answer";

      const hasErrors = executionResult.testResults.some((tr) => tr.error);
      const finalStatus = hasErrors
        ? ("Runtime Error" as SubmissionStatus)
        : status;

      //Update submission
      await submissionRepository.updateStatus(submissionId, finalStatus, {
        testResults: executionResult.testResults,
        passedTestCases: executionResult.totalPassed,
        executionTime: executionResult.executionTime,
      });

      if (finalStatus === "Accepted") {
        const submission = await submissionRepository.findById(submissionId);
        if (submission) {
          await questionRepository.incrementSubmissions(
            submission.questionId.toString(),
            true
          );
        } else {
          const submission = await submissionRepository.findById(submissionId);
          if (submission) {
            await questionRepository.incrementSubmissions(
              submission.questionId.toString(),
              false
            );
          }
        }
      }
    } catch (error: any) {
      console.error("Code execution error:", error);
      //Update submission with error
      await submissionRepository.updateStatus(submissionId, "Runtime Error", {
        error: error.message,
      });
    }
  }

  //Users submission
  async getUserSubmissions(
    userId: string,
    limit: number = 50
  ): Promise<ISubmission[]> {
    return await submissionRepository.findByUserId(userId, limit);
  }

  //User's submission for a specific question
  async getUserQuestionSubmissions(
    userId: string,
    questionId: string
  ): Promise<ISubmission[]> {
    return await submissionRepository.findByUserAndQuestion(userId, questionId);
  }

  //Submission by ID
  async getSubmissionById(submissionId: string): Promise<ISubmission> {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error("Submission is not found");
    }
    return submission;
  }

  //Check if user has solved a question
  async hasUserSolvedQuestion(
    userId: string,
    questionId: string
  ): Promise<boolean> {
    return await submissionRepository.hasUserSolvedQuestion(userId, questionId);
  }

  //User statistics
  async getUserStatistics(userId: string) {
    const stats = await submissionRepository.getUserStats(userId);
    return stats;
  }

  //Recent submissions for dashboard
  async getRecentSubmissions(
    userId: string,
    limit: number = 10
  ): Promise<ISubmission[]> {
    return await submissionRepository.getRecentSubmission(userId, limit);
  }

  //Solved question IDs for a user
  async getSolvedQuestionIds(userId: string): Promise<string[]> {
    return await submissionRepository.getSolvedQuestionIds(userId);
  }

  //Get submission for a question admin only
  async getQuestionSubmissions(
    questionId: string,
    limit: number = 50
  ): Promise<ISubmission[]> {
    return await submissionRepository.findByQuestionId(questionId, limit);
  }

  //Run code without submitting test run
  async runCode(
    questionId: string,
    code: string,
    language: string
  ): Promise<{ 
    testResults: any[];
  totalPassed:number;
totalFailed:number;
executionTime:number;
 }>{
  //Get question with public test case only
  const question = await questionRepository.findByIdPublic(questionId)
  
  if(!question){
    throw new Error("Question not found")
  }
  
  //Get only public test cases
  const publicTestCases = question.testCases.filter(tc=>!tc.isHidden)

  if(publicTestCases.length===0){
    throw new Error("No public test cases available")
  }

  //Execute code
  if(language==="javascript"){
    return await codeExecutor.executeJavaScritp(code,publicTestCases)
  }else{
    throw new Error(`Language ${language} not yet supported`)
  }
 }

 //Delete user's submissions for a question
 async deleteUserQuestionSubmission(userId:string,questionId:string,):Promise<number>{
  const submissions = await submissionRepository.findByUserAndQuestion(userId,questionId)

  let deletedCount = 0 
  for(let submission of submissions){
    const deleted = await submissionRepository.delete(submission.id.toString())
    if(deleted)deletedCount++
  }
  return deletedCount
 }
}


export default new SubmissionService()
