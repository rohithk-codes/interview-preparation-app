<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import QuestionCard from '../components/questions/QuestionCard';
import QuestionFilters from '../components/questions/QuestionFilters';
import { Question, QuestionFilters as FilterType } from '../types';
import apiService from '../services/api';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<FilterType>({
    difficulty: '',
    topic: '',
    search: '',
    status: 'all'
  });

  useEffect(() => {
    loadQuestions();
  }, [filters, currentPage]);

  useEffect(() => {
    loadSolvedQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');

    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };

      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.topic) params.topic = filters.topic;
      if (filters.search) params.search = filters.search;

      const response = await apiService.getQuestions(params);

      if (response.success) {
        let filteredQuestions = response.data;

        // Filter by solved/unsolved status
        if (filters.status === 'solved') {
          filteredQuestions = filteredQuestions.filter(q => 
            solvedQuestionIds.has(q._id)
          );
        } else if (filters.status === 'unsolved') {
          filteredQuestions = filteredQuestions.filter(q => 
            !solvedQuestionIds.has(q._id)
          );
        }

        setQuestions(filteredQuestions);
        setTotalPages(response.pages);
        setTotal(response.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load questions');
=======
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/questions');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const loadSolvedQuestions = async () => {
    try {
      const response = await apiService.getUserSubmissions();
      if (response.success && response.data) {
        const solved = new Set(
          response.data
            .filter(sub => sub.status === 'Accepted')
            .map(sub => typeof sub.questionId === 'string' ? sub.questionId : sub.questionId._id)
        );
        setSolvedQuestionIds(solved);
      }
    } catch (error) {
      console.error('Failed to load solved questions:', error);
    }
  };

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Practice Questions</h1>
          <p className="text-gray-600 mt-2">
            Solve coding problems and improve your skills
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <QuestionFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-error-light border border-error text-error-dark px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Questions List */}
        {!loading && !error && (
          <>
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {questions.length} of {total} questions
            </div>

            {/* Questions */}
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question._id}
                    question={question}
                    isSolved={solvedQuestionIds.has(question._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No questions found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
                            ${
                              currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Questions;
=======
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-error-light border border-error text-error-dark px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
          <p className="text-xs text-blue-700">
            Admin: admin@example.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29
