import { BaseRepository } from "./base.repository";
import Submission, {
  ISubmission,
  SubmissionStatus,
} from "../models/Submission";

export class SubmissionRepository extends BaseRepository<ISubmission> {
  constructor() {
    super(Submission);
  }

  //Find Submission by user ID
  async findByUserId(
    userId: string,
    limit: number = 50
  ): Promise<ISubmission[]> {
    return await Submission.find({ userId })
      .populate("quesitonId", "title difficulty topic")
      .sort({ submittedAt: -1 })
      .limit(limit);
  }

  //Find submission by question ID
  async findByQuestionId(
    questionId: string,
    limit: number = 50
  ): Promise<ISubmission[]> {
    return await Submission.find({ questionId })
      .populate("userId", "name email")
      .sort({ submittedAt: -1 })
      .limit(limit);
  }

  //Find user's submissions for a specific question
  async findByUserAndQuestion(
    userId: string,
    questionId: string
  ): Promise<ISubmission[]> {
    return await Submission.find({ userId, questionId })
    .sort({submittedAt: -1,});
  }

  // Check if user has solved a question 
  async hasUserSolvedQuestion(userId:string,questionId:string):Promise<boolean>{
    const count = await Submission.countDocuments({userId,questionId})
   .sort({submittedAt:-1});
   return count>0;  
}

// Get user statistics
async getUserStats(userId:string){
    const [totalSubmissions,acceptedSubmissions,byDifficulty] = await Promise.all([
        Submission.countDocuments({userId}),
        Submission.countDocuments({userId,status:"Accepted"}),
        this.getUserStatsByDifficulty(userId)
    ])

// Get unique solved questions 
const solvedQuestion = await Submission.distinct("questionId",{
    userId,
    status:"Accepted"
})

return{
    totalSubmissions,
    acceptedSubmissions,
    totalSolved:solvedQuestion.length,
    successRate:totalSubmissions>0?Math.round((acceptedSubmissions/totalSubmissions)*100):0,
    byDifficulty

}

}

private async getUserStatsByDifficulty(userId:string){
    
}



}
