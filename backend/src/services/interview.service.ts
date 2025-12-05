import interviewQuestionRepository from "../repositories/interviewQuestion.repository";
import interviewSessionRepository from "../repositories/interviewSession.repository";
import answerEvaluator from "./answerEvaluator.service";
import { IInterviewSession } from "../models/chat/InterviewSession";
import { IInterviewQuestion } from "../models/chat/InterviewQuestion";

export interface StartSessionDTO {
  userId: string;
  category: "javascript" | "python" | "java" | "general";
  type: "frontend" | "backend" | "fullstack";
  difficulty?: "easy" | "medium" | "hard";
  questionCount?: number;
}

export interface SubmitAnswerDTO {
  sessionId: string;
  questionId: string;
  answer: string;
  isVoiceAnswer: boolean;
  timeSpent: number;
}

export class InterviewService {
  async startSession(data: StartSessionDTO): Promise<{
    session: IInterviewSession;
    firstQuestion: IInterviewQuestion;
  }> {
    const activeSession = await interviewSessionRepository.getActiveSession(
      data.userId
    );
    if (activeSession) {
      const currentQuestion = await interviewQuestionRepository.findById(
        activeSession.questionIds[activeSession.currentQuestionIndex].toString()
      );
      if (!currentQuestion) {
        throw new Error("Question not found");
      }

      return {
        session: activeSession,
        firstQuestion: currentQuestion,
      };
    }

    const questions = await interviewQuestionRepository.getBalancedQuestions(
      data.category,
      data.type,
      data.questionCount || 10
    );

    if (questions.length === 0) {
      throw new Error(`No question found for ${data.category} ${data.type}`);
    }

    const session = await interviewSessionRepository.create({
      userId: data.userId,
      category: data.category,
      type: data.type,
      difficulty: data.difficulty || "medium",
      status: "in-progress",
      currentQuestionIndex: 0,
      questionIds: questions.map((q) => q._id),
      answers: [],
      totalScore: 0,
      maxPossibleScore: 0,
      overallPercentage: 0,
      totalTimeSpent: 0,
      voiceAnswersCount: 0,
      startedAt: new Date(),
    } as any);

    return {
      session,
      firstQuestion: questions[0],
    };
  }

  // Submit answer and get next question

  async submitAnswer(data: SubmitAnswerDTO): Promise<{
    evaluation: any;
    nextQuestion: IInterviewQuestion | null;
    isComplete: boolean;
    sessionSummary?: any;
  }> {
    const session = await interviewSessionRepository.findById(data.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "in-progress") {
      throw new Error("Session is not active");
    }

    const question = await interviewQuestionRepository.findById(
      data.questionId
    );

    if (!question) {
      throw new Error("Question not found");
    }

    const evaluation = answerEvaluator.evaluate(data.answer, question);

    //Prepare answer data
    const answerData = {
      questionId: question._id,
      questionText: question.question,
      userAnswer: data.answer,
      isVoiceAnswer: data.isVoiceAnswer,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      percentage: evaluation.percentage,
      matchedKeywords: evaluation.matchedKeywords,
      missedKeywords: evaluation.missedKeywords,
      feedback: evaluation.feedback,
      timeSpent: data.timeSpent,
      answeredAt: new Date(),
    };

    // Add answer to session
    const updatedSession = await interviewSessionRepository.addAnswer(
      data.sessionId,
      answerData
    );

    if (!updatedSession) {
      throw new Error("Failed to update session");
    }

    const isComplete =
      updatedSession.currentQuestionIndex >= updatedSession.questionIds.length;

    let nextQuestion: IInterviewQuestion | null = null;
    let sessionSummary: any = undefined;

    if (isComplete) {
      updatedSession.calculateOverallScore();
      await updatedSession.save();

      await interviewSessionRepository.updateStatus(
        data.sessionId,
        "completed"
      );

      sessionSummary = this.generateSessionSummary(updatedSession);
    } else {
      nextQuestion = await interviewQuestionRepository.findById(
        updatedSession.questionIds[
          updatedSession.currentQuestionIndex
        ].toString()
      );
    }
    return {
      evaluation: {
        ...evaluation,
        questionText: question.question,
      },
      nextQuestion,
      isComplete,
      sessionSummary,
    };
  }

  async getCurrentQuestion(sessionId: string): Promise<IInterviewQuestion> {
    const session = await interviewSessionRepository.findById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    const currentQuestion = await interviewQuestionRepository.findById(
      session.questionIds[session.currentQuestionIndex].toString()
    );
    if (!currentQuestion) {
      throw new Error("question not found");
    }

    return currentQuestion;
  }


   async getSession(sessionId: string): Promise<IInterviewSession> {
    const session = await interviewSessionRepository.findByIdWithQuestions(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }


   async getUserSessions(userId: string, limit: number = 20): Promise<IInterviewSession[]> {
    return await interviewSessionRepository.findByUserId(userId, limit);
  }

  async getUserStats(userId: string) {
    return await interviewSessionRepository.getUserStats(userId);
  }

 async abandonSession(sessionId: string): Promise<void> {
    await interviewSessionRepository.updateStatus(sessionId, 'abandoned');
  }


   private generateSessionSummary(session: IInterviewSession) {
    const totalQuestions = session.answers.length;
    const excellentAnswers = session.answers.filter(a => a.percentage >= 80).length;
    const goodAnswers = session.answers.filter(a => a.percentage >= 60 && a.percentage < 80).length;
    const needsImprovement = session.answers.filter(a => a.percentage < 60).length;

    // Find strongest and weakest areas
    const keywordStats: any = {};
    session.answers.forEach(answer => {
      answer.matchedKeywords.forEach(kw => {
        keywordStats[kw] = (keywordStats[kw] || 0) + 1;
      });
    });

    const strongestConcepts = Object.entries(keywordStats)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 5)
      .map((entry: any) => entry[0]);

    const missedConcepts = new Set<string>();
    session.answers.forEach(answer => {
      answer.missedKeywords.forEach(kw => missedConcepts.add(kw));
    });

    return {
      totalQuestions,
      overallScore: session.overallPercentage,
      totalTimeSpent: session.totalTimeSpent,
      voiceAnswersCount: session.voiceAnswersCount,
      breakdown: {
        excellent: excellentAnswers,
        good: goodAnswers,
        needsImprovement
      },
      strongestConcepts,
      areasToImprove: Array.from(missedConcepts).slice(0, 5),
      recommendations: this.generateRecommendations(session)
    };
  }


  // Generate personalized recommendations
  private generateRecommendations(session: IInterviewSession): string[] {
    const recommendations: string[] = [];

    if (session.overallPercentage >= 80) {
      recommendations.push('Great job! Try harder difficulty questions to challenge yourself.');
    } else if (session.overallPercentage >= 60) {
      recommendations.push('Good progress! Review the missed concepts and try again.');
    } else {
      recommendations.push('Focus on fundamental concepts. Try easier questions first.');
    }

    if (session.voiceAnswersCount > 0) {
      recommendations.push('Great use of voice answers! Keep practicing verbal explanations.');
    } else {
      recommendations.push('Try using voice answers to practice explaining concepts verbally.');
    }

    const avgTimePerQuestion = session.totalTimeSpent / session.answers.length;
    if (avgTimePerQuestion > 180) {
      recommendations.push('Work on answering questions more concisely.');
    }

    return recommendations;
  }

  // Get available categories and types
  async getAvailableFilters() {
    const [categories, types] = await Promise.all([
      interviewQuestionRepository.getCategories(),
      interviewQuestionRepository.getTypes()
    ]);

    return { categories, types };
  }
  // Get question count by filters
  async getQuestionCount(category: string, type: string): Promise<number> {
    return await interviewQuestionRepository.countByFilters(category, type);
  }
}

export default new InterviewService();