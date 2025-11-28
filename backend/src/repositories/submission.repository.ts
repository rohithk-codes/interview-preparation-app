import { BaseRepository } from "./base.repository";
import Submission, {
  ISubmission,
  SubmissionStatus,
} from "../models/Submission";
import mongoose from "mongoose";

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
      .populate("questionId", "title difficulty topic")
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
    return await Submission.find({
      userId,
      questionId,
    }).sort({
      submittedAt: -1,
    });
  }

  // Check if user has solved a question
  async hasUserSolvedQuestion(
    userId: string,
    questionId: string
  ): Promise<boolean> {
    const count = await Submission.countDocuments({ userId, questionId }).sort({
      submittedAt: -1,
    });
    return count > 0;
  }

  //Users latest submission for a question
  async getLatestSubmission(
    userId: string,
    questionId: string
  ): Promise<ISubmission | null> {
    return await Submission.findOne({ userId, questionId }).sort({
      submittedAt: -1,
    });
  }

  // Get user statistics
  async getUserStats(userId: string) {
    const [totalSubmissions, acceptedSubmissions, byDifficulty] =
      await Promise.all([
        Submission.countDocuments({ userId }),
        Submission.countDocuments({ userId, status: "Accepted" }),
        this.getUserStatsByDifficulty(userId),
      ]);

    // Get unique solved questions
    const solvedQuestion = await Submission.distinct("questionId", {
      userId,
      status: "Accepted",
    });

    return {
      totalSubmissions,
      acceptedSubmissions,
      totalSolved: solvedQuestion.length,
      successRate:
        totalSubmissions > 0
          ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
          : 0,
      byDifficulty,
    };
  }

  //Get users stats by difficulty
  private async getUserStatsByDifficulty(userId: string) {
    const result = await Submission.aggregate([
      {
        $match: {
          userId: new Submission.base.Types.ObjectId(userId),
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

    const stats: any = { Easy: 0, Midum: 0, Hard: 0 };

    result.forEach((item) => {
      stats[item.difficulty] = item.count;
    });

    return stats;
  }

  //Recent submission for dashboard
  async getRecentSubmission(
    userId: string,
    limit: number = 10
  ): Promise<ISubmission[]> {
    return await Submission.find({ userId })
      .populate("questionId", "title difficulty")
      .sort({ submittedAt: -1 })
      .limit(limit)
      .select("questionId status passedTestCases totalTestCases submittedAt");
  }

  //Submission by status
  async findByStatus(
    status: SubmissionStatus,
    limit: number = 50
  ): Promise<ISubmission[]> {
    return await Submission.find({ status })
      .populate("userId", "name email")
      .populate("questionId", "title difficulty")
      .sort({ submittedAt: -1 })
      .limit(limit);
  }

  //Get all solved quesiton IDs for user
  async getSolvedQuestionIds(userId: string): Promise<string[]> {
    const submissions = await Submission.distinct("questionId", {
      userId,
      status: "Accepted",
    });
    return submissions.map((id) => id.toString());
  }

  //Update submission status
  async updateStatus(
    submissionId: string,
    status: SubmissionStatus,
    additionalData?: Partial<ISubmission>
  ): Promise<ISubmission | null> {
    return await Submission.findByIdAndUpdate(
      submissionId,
      {
        $set: {
          status,
          ...additionalData,
        },
      },
      { new: true }
    );
  }

  //Delete submission when question deleted
  async deleteByQuestionId(questionId: string): Promise<number> {
    const result = await Submission.deleteMany({ questionId });
    return result.deletedCount || 0;
  }

  //Get submission statistics for question
  async getQuestionSubmissionStats(questionId: string) {
    const [total, accepted] = await Promise.all([
      Submission.countDocuments({ questionId }),
      Submission.countDocuments({ questionId, status: "Accepted" }),
    ]);

    return {
      totalSubmissions: total,
      acceptedSubmissions: accepted,
      acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
    };
  }
}

export default new SubmissionRepository();
