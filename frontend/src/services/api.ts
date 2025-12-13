import type { AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import type {
  ApiResponse,
  AuthResponse,
  Question,
  QuestionsResponse,
  QuestionStats,
  Submission,
  SubmissionResponse,
  UserStats,
} from "../types";

class ApiService {
  private api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: (import.meta as any).env?.VITE_API_URL || "http://localhost:7000/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    //Add auth token to request
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    //Handle response errors
    // this.api.interceptors.response.use(
    //   (response) => response,
    //   (error: AxiosError<ApiResponse>) => {
    //     if (error.response?.status === 401) {
    //       //Token expired or invalid
    //       localStorage.removeItem("token");
    //       localStorage.removeItem("user");
    //       window.location.href = "/login";
    //     }
    //     return Promise.reject(error);
    //   }
    // );
  }

  //Auth APIs
  async signup(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/auth/signup", {
      name,
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/auth/google", {
      credential,
    });
    return response.data;
  }

  //Quesiton APIs

  async getQuestions(params?: {
    difficulty?: string;
    topic?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<QuestionsResponse> {
    const response = await this.api.get<QuestionsResponse>("/questions", {
      params,
    });
    return response.data;
  }

  async getQuestionById(id: string): Promise<ApiResponse<Question>> {
    console.log("question by id")
    const response = await this.api.get(`/questions/${id}`);
    return response.data;
  }

  async createQuestion(
    data: Partial<Question>
  ): Promise<ApiResponse<Question>> {
    const response = await this.api.post("/questions", data);
    return response.data;
  }

  async updateQuestion(
    id: string,
    data: Partial<Question>
  ): Promise<ApiResponse<Question>> {
    const response = await this.api.put(`/question/${id}`, data);
    return response.data;
  }

  async deleteQuestion(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/questions/${id}`);
    return response.data;
  }

  async getTopics(): Promise<ApiResponse<string[]>> {
    const response = await this.api.get("/questions/topics");
    return response.data;
  }

  async getQuestionStats(): Promise<ApiResponse<QuestionStats>> {
    const response = await this.api.get("/questions/stats");
    return response.data;
  }

  //Submission APIs
  async submitCode(
    questionId: string,
    code: string,
    language: string
  ): Promise<SubmissionResponse> {
    const response = await this.api.post<SubmissionResponse>("/submissions", {
      questionId,
      code,
      language,
    });
    return response.data;
  }

  async runCode(
    questionId: string,
    code: string,
    language: string
  ): Promise<ApiResponse> {
    const response = await this.api.post("/submissions/run", {
      questionId,
      code,
      language,
    });
    console.log("response data", response.data)
    return response.data;
  }

  async getUserSubmissions(limit?: number): Promise<ApiResponse<Submission[]>> {
    const response = await this.api.get("/submissions/user", {
      params: { limit },
    });
    return response.data;
  }

  async getQuestionSubmissions(
    quesitonId: string
  ): Promise<ApiResponse<Submission[]>> {
    const response = await this.api.get(`/submissions/question/${quesitonId}`);
    console.log("responseeeee",response)
    return response.data;
  }

  async getSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    const response = await this.api.get(`/submissions/${id}`);
    return response.data;
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    const response = await this.api.get("/submissions/stats/user");
    return response.data;
  }

  async getRecentSubmissions(
    limit?: number
  ): Promise<ApiResponse<Submission[]>> {
    const response = await this.api.get("/submissions/recent", {
      params: { limit },
    });
    return response.data;
  }

  async checkQuestionSolved(
    questionId: string
  ): Promise<ApiResponse<{ solved: boolean }>> {
    const response = await this.api.get(`/submissions/solved/${questionId}`);
    return response.data;
  }

  // Interview Q&A APIs
 async startInterviewSession(
    category: string,
    type: string,
    questionCount?: number
  ): Promise<ApiResponse> {
    const response = await this.api.post('/interview/start', {
      category,
      type,
      questionCount
    });
    return response.data;
  }

  async submitInterviewAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    isVoiceAnswer: boolean,
    timeSpent: number
  ): Promise<ApiResponse> {
    const response = await this.api.post('/interview/answer', {
      sessionId,
      questionId,
      answer,
      isVoiceAnswer,
      timeSpent
    });
    return response.data;
  }

  async getInterviewSession(sessionId: string): Promise<ApiResponse> {
    const response = await this.api.get(`/interview/session/${sessionId}`);
    return response.data;
  }

  async getCurrentInterviewQuestion(sessionId: string): Promise<ApiResponse> {
    const response = await this.api.get(`/interview/session/${sessionId}/current`);
    return response.data;
  }

  async getInterviewHistory(): Promise<ApiResponse> {
    const response = await this.api.get('/interview/history');
    return response.data;
  }

  async getInterviewStats(): Promise<ApiResponse> {
    const response = await this.api.get('/interview/stats');
    return response.data;
  }

  async abandonInterviewSession(sessionId: string): Promise<ApiResponse> {
    const response = await this.api.post(`/interview/session/${sessionId}/abandon`);
    return response.data;
  }

  async getInterviewFilters(): Promise<ApiResponse> {
    const response = await this.api.get('/interview/filters');
    return response.data;
  }

  async getInterviewQuestionCount(category: string, type: string): Promise<ApiResponse> {
    const response = await this.api.get('/interview/count', {
      params: { category, type }
    });
    return response.data;
  }
}

export default new ApiService();