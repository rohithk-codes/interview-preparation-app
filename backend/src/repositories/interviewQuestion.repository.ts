import { BaseRepository } from "./base.repository";
import InterviewQuestion,{IInterviewQuestion} from "../models/chat/InterviewQuestion";


export class InterviewQuestionRepository extends BaseRepository<IInterviewQuestion> {
  constructor() {
    super(InterviewQuestion);
  }

  // Get questions by category and type
  async findByFilters(
    category: string,
    type: string,
    difficulty?: string,
    limit: number = 10
  ): Promise<IInterviewQuestion[]> {
    const query: any = { category, type };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    return await InterviewQuestion.find(query)
      .limit(limit)
      .sort({ difficulty: 1, createdAt: -1 }); 
  }

  // Get random questions for a session
  async getRandomQuestions(
    category: string,
    type: string,
    count: number = 10
  ): Promise<IInterviewQuestion[]> {
    return await InterviewQuestion.aggregate([
      { $match: { category, type } },
      { $sample: { size: count } }
    ]);
  }

  // Get questions by difficulty distribution
  async getBalancedQuestions(
    category: string,
    type: string,
    totalCount: number = 10
  ): Promise<IInterviewQuestion[]> {
    // Get 30% easy, 50% medium, 20% hard
    const easyCount = Math.floor(totalCount * 0.3);
    const mediumCount = Math.floor(totalCount * 0.5);
    const hardCount = totalCount - easyCount - mediumCount;

    const [easy, medium, hard] = await Promise.all([
      InterviewQuestion.aggregate([
        { $match: { category, type, difficulty: 'easy' } },
        { $sample: { size: easyCount } }
      ]),
      InterviewQuestion.aggregate([
        { $match: { category, type, difficulty: 'medium' } },
        { $sample: { size: mediumCount } }
      ]),
      InterviewQuestion.aggregate([
        { $match: { category, type, difficulty: 'hard' } },
        { $sample: { size: hardCount } }
      ])
    ]);

    return [...easy, ...medium, ...hard];
  }

  // Get question count by filters
  async countByFilters(
    category: string,
    type: string,
    difficulty?: string
  ): Promise<number> {
    const query: any = { category, type };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    return await InterviewQuestion.countDocuments(query);
  }

  // Get all categories
  async getCategories(): Promise<string[]> {
    return await InterviewQuestion.distinct('category');
  }

  // Get all types
  async getTypes(): Promise<string[]> {
    return await InterviewQuestion.distinct('type');
  }
}

export default new InterviewQuestionRepository();