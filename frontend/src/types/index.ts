// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

// Question types
export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tags: string[];
  testCases: TestCase[];
  solution?: string;
  constraints?: string;
  examples?: Example[];
  hints?: string[];
  acceptanceRate?: number;
  totalSubmissions: number;
  successfulSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Question[];
}

// Submission types
export interface TestResult {
  testCaseIndex: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime?: number;
  error?: string;
}

export type SubmissionStatus = 
  | 'Pending'
  | 'Running'
  | 'Accepted'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Compilation Error';

export interface Submission {
  _id: string;
  userId: string;
  questionId: string | Question;
  code: string;
  language: string;
  status: SubmissionStatus;
  testResults: TestResult[];
  totalTestCases: number;
  passedTestCases: number;
  executionTime?: number;
  memory?: number;
  error?: string;
  submittedAt: string;
}

export interface SubmissionResponse {
  success: boolean;
  message?: string;
  data: Submission;
}

// Statistics types
export interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  totalSolved: number;
  successRate: number;
  byDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

export interface QuestionStats {
  total: number;
  byDifficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  byTopic: Array<{
    topic: string;
    count: number;
  }>;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Filter types
export interface QuestionFilters {
  difficulty?: string;
  topic?: string;
  search?: string;
  status?: 'all' | 'solved' | 'unsolved';
}