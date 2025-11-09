import { BaseRepository } from './base.repository';
import Question, { IQuestion } from '../models/Question';

export interface QuestionFilters {
  difficulty?: string;
  topic?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export class QuestionRepository extends BaseRepository<IQuestion> {
  constructor() {
    super(Question);
  }

  // Find questions with filters and pagination
  async findWithFilters(
    filters: QuestionFilters,
    pagination: PaginationOptions
  ): Promise<{ questions: IQuestion[]; total: number }> {
    const query: any = {};

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.topic) {
      query.topic = filters.topic;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [questions, total] = await Promise.all([
      Question.find(query)
        .select('-solution -testCases')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit),
      Question.countDocuments(query)
    ]);

    return { questions, total };
  }

  // Get question by ID without solution
  async findByIdPublic(id: string): Promise<IQuestion | null> {
    return await Question.findById(id)
      .select('-solution')
      .populate('createdBy', 'name email');
  }

  // Get question by ID with solution (for admin or after solving)
  async findByIdWithSolution(id: string): Promise<IQuestion | null> {
    return await Question.findById(id).populate('createdBy', 'name email');
  }

  // Check if title exists
  async titleExists(title: string, excludeId?: string): Promise<boolean> {
    const query: any = { title };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await Question.countDocuments(query);
    return count > 0;
  }

  // Get all unique topics
  async getDistinctTopics(): Promise<string[]> {
    return await Question.distinct('topic');
  }

  // Get questions by difficulty
  async findByDifficulty(difficulty: string): Promise<IQuestion[]> {
    return await Question.find({ difficulty }).select('-solution -testCases');
  }

  // Get questions by topic
  async findByTopic(topic: string): Promise<IQuestion[]> {
    return await Question.find({ topic }).select('-solution -testCases');
  }

  // Get difficulty-wise count
  async getCountByDifficulty(): Promise<{
    Easy: number;
    Medium: number;
    Hard: number;
  }> {
    const [easy, medium, hard] = await Promise.all([
      Question.countDocuments({ difficulty: 'Easy' }),
      Question.countDocuments({ difficulty: 'Medium' }),
      Question.countDocuments({ difficulty: 'Hard' })
    ]);

    return { Easy: easy, Medium: medium, Hard: hard };
  }

  // Get topic-wise statistics
  async getTopicStatistics(): Promise<Array<{ topic: string; count: number }>> {
    return await Question.aggregate([
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }

  // Update submission statistics
  async incrementSubmissions(
    questionId: string,
    isSuccessful: boolean
  ): Promise<void> {
    const updateQuery: any = { $inc: { totalSubmissions: 1 } };

    if (isSuccessful) {
      updateQuery.$inc.successfulSubmissions = 1;
    }

    await Question.findByIdAndUpdate(questionId, updateQuery);

    // Update acceptance rate
    const question = await Question.findById(questionId);
    if (question && question.totalSubmissions > 0) {
      question.acceptanceRate = Math.round(
        (question.successfulSubmissions / question.totalSubmissions) * 100
      );
      await question.save();
    }
  }
}

// Export singleton instance
export default new QuestionRepository();