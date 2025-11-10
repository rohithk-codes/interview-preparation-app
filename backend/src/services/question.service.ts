import questionRepository, {
  QuestionFilters,
  PaginationOptions
} from '../repositories/question.repository';
import { IQuestion, ITestCase } from '../models/Question';

export interface CreateQuestionDTO {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tags?: string[];
  testCases: ITestCase[];
  solution: string;
  constraints?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  hints?: string[];
  createdBy: string;
}

export interface UpdateQuestionDTO {
  title?: string;
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  topic?: string;
  tags?: string[];
  testCases?: ITestCase[];
  solution?: string;
  constraints?: string;
  examples?: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  hints?: string[];
}

export class QuestionService {
  // Get all questions with filters
  async getAllQuestions(
    filters: QuestionFilters,
    pagination: PaginationOptions
  ) {
    const { questions, total } = await questionRepository.findWithFilters(
      filters,
      pagination
    );

    return {
      questions,
      total,
      page: pagination.page,
      pages: Math.ceil(total / pagination.limit)
    };
  }

  // Get single question by ID
  async getQuestionById(
    questionId: string,
    includeHiddenTests: boolean = false
  ) {
    const question = await questionRepository.findByIdPublic(questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    // Filter hidden test cases for non-admin users
    if (!includeHiddenTests) {
      const filteredTestCases = question.testCases.filter(
        tc => !tc.isHidden
      );
      return {
        ...question.toObject(),
        testCases: filteredTestCases
      };
    }

    return question;
  }

  // Get question with solution (after user solves it or for admin)
  async getQuestionWithSolution(questionId: string) {
    const question = await questionRepository.findByIdWithSolution(questionId);

    if (!question) {
      throw new Error('Question not found');
    }

    return question;
  }

  // Create new question
  async createQuestion(data: CreateQuestionDTO): Promise<IQuestion> {
    // Check if title already exists
    const titleExists = await questionRepository.titleExists(data.title);
    if (titleExists) {
      throw new Error('A question with this title already exists');
    }

    // Validate test cases
    if (!data.testCases || data.testCases.length === 0) {
      throw new Error('At least one test case is required');
    }

    return await questionRepository.create(data as any);
  }

  // Update question
  async updateQuestion(
    questionId: string,
    data: UpdateQuestionDTO
  ): Promise<IQuestion> {
    // Check if question exists
    const existingQuestion = await questionRepository.findById(questionId);
    if (!existingQuestion) {
      throw new Error('Question not found');
    }

    // If updating title, check for duplicates
    if (data.title && data.title !== existingQuestion.title) {
      const titleExists = await questionRepository.titleExists(
        data.title,
        questionId
      );
      if (titleExists) {
        throw new Error('A question with this title already exists');
      }
    }

    const updatedQuestion = await questionRepository.update(questionId, data);

    if (!updatedQuestion) {
      throw new Error('Failed to update question');
    }

    return updatedQuestion;
  }

  // Delete question
  async deleteQuestion(questionId: string): Promise<void> {
    const deleted = await questionRepository.delete(questionId);
    if (!deleted) {
      throw new Error('Question not found or already deleted');
    }
  }

  // Get all topics
  async getTopics(): Promise<string[]> {
    const topics = await questionRepository.getDistinctTopics();
    return topics.sort();
  }

  // Get question statistics
  async getStatistics() {
    const [total, byDifficulty, byTopic] = await Promise.all([
      questionRepository.countDocuments({}),
      questionRepository.getCountByDifficulty(),
      questionRepository.getTopicStatistics()
    ]);

    return {
      total,
      byDifficulty,
      byTopic
    };
  }

  // Get questions by difficulty
  async getQuestionsByDifficulty(difficulty: string): Promise<IQuestion[]> {
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      throw new Error('Invalid difficulty level');
    }

    return await questionRepository.findByDifficulty(difficulty);
  }

  // Get questions by topic
  async getQuestionsByTopic(topic: string): Promise<IQuestion[]> {
    return await questionRepository.findByTopic(topic);
  }

  // Record submission (to be called from submission service)
  async recordSubmission(
    questionId: string,
    isSuccessful: boolean
  ): Promise<void> {
    await questionRepository.incrementSubmissions(questionId, isSuccessful);
  }
}

// Export instance
export default new QuestionService();