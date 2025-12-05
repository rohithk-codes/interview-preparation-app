import { BaseRepository } from './base.repository';
import InterviewSession, { IInterviewSession } from '../models/chat/InterviewSession';

export class InterviewSessionRepository extends BaseRepository<IInterviewSession> {
  constructor() {
    super(InterviewSession);
  }

  // Get user's sessions
  async findByUserId(userId: string, limit: number = 20): Promise<IInterviewSession[]> {
    return await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Get active session for user
  async getActiveSession(userId: string): Promise<IInterviewSession | null> {
    return await InterviewSession.findOne({
      userId,
      status: 'in-progress'
    }).sort({ createdAt: -1 });
  }

  // Get session with populated questions
  async findByIdWithQuestions(sessionId: string): Promise<IInterviewSession | null> {
    return await InterviewSession.findById(sessionId)
      .populate('questionIds')
      .populate('userId', 'name email');
  }

  // Get completed sessions
  async getCompletedSessions(userId: string): Promise<IInterviewSession[]> {
    return await InterviewSession.find({
      userId,
      status: 'completed'
    }).sort({ completedAt: -1 });
  }

  // Get session statistics
  async getUserStats(userId: string) {
    const sessions = await InterviewSession.find({
      userId,
      status: 'completed'
    });

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        totalQuestionsAnswered: 0,
        voiceAnswersPercentage: 0,
        byCategory: {},
        byDifficulty: {}
      };
    }

    const totalScore = sessions.reduce((sum, s) => sum + s.overallPercentage, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.answers.length, 0);
    const totalVoiceAnswers = sessions.reduce((sum, s) => sum + s.voiceAnswersCount, 0);

    // Group by category
    const byCategory: any = {};
    sessions.forEach(session => {
      if (!byCategory[session.category]) {
        byCategory[session.category] = {
          count: 0,
          averageScore: 0,
          totalScore: 0
        };
      }
      byCategory[session.category].count++;
      byCategory[session.category].totalScore += session.overallPercentage;
      byCategory[session.category].averageScore = Math.round(
        byCategory[session.category].totalScore / byCategory[session.category].count
      );
    });

    return {
      totalSessions: sessions.length,
      averageScore: Math.round(totalScore / sessions.length),
      totalQuestionsAnswered: totalQuestions,
      voiceAnswersPercentage: totalQuestions > 0 
        ? Math.round((totalVoiceAnswers / totalQuestions) * 100)
        : 0,
      byCategory,
      recentSessions: sessions.slice(0, 5)
    };
  }

  // Update session status
  async updateStatus(
    sessionId: string,
    status: 'in-progress' | 'completed' | 'abandoned'
  ): Promise<IInterviewSession | null> {
    const updateData: any = { status };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    return await InterviewSession.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true }
    );
  }

  // Add answer to session
  async addAnswer(
    sessionId: string,
    answerData: any
  ): Promise<IInterviewSession | null> {
    return await InterviewSession.findByIdAndUpdate(
      sessionId,
      {
        $push: { answers: answerData },
        $inc: {
          currentQuestionIndex: 1,
          totalScore: answerData.score,
          maxPossibleScore: answerData.maxScore,
          totalTimeSpent: answerData.timeSpent,
          ...(answerData.isVoiceAnswer && { voiceAnswersCount: 1 })
        }
      },
      { new: true }
    );
  }
}

export default new InterviewSessionRepository();