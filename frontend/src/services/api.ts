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
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          //Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  //Auth APIs
  async signup(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/signup", {
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
    quesitonId: string,
    code: string,
    language: string
  ): Promise<ApiResponse> {
    const response = await this.api.post("/submission/run", {
      quesitonId,
      code,
      language,
    });
    return response.data;
  }

  async getUserSubmissions(limit?: number): Promise<ApiResponse<Submission[]>> {
    const response = await this.api.get("/submission/user", {
      params: { limit },
    });
    return response.data;
  }

  async getQuestionSubmissions(
    quesitonId: string
  ): Promise<ApiResponse<Submission[]>> {
    const response = await this.api.get(`/submissions/question/${quesitonId}`);
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
    const response = await this.api.get("/submission/recent", {
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
}

export default new ApiService();
