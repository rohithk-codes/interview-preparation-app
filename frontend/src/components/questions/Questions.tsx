import React, { useState, useEffect } from "react";
import Layout from "../common/Layout";
import QuestionCard from "./QuestionCard";
import QuestionFilters from "./QuestionFilters";
import type { Question, QuestionFilters as FileType } from "../../types";
import apiService from "../../services/api";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

const Questions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<FileType>({
    difficulty: "",
    topic: "",
    search: "",
    status: "all",
  });

  useEffect(() => {
    loadQuestions();
  }, [filters, currentPage]);

  useEffect(() => {
    loadSolvedQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.topic) params.topic = filters.topic;
      if (filters.search) params.search = filters.search;

      const response = await apiService.getQuestions(params);

      if (response.success) {
        let filteredQuestions = response.data;
        if (filters.status === "solved") {
          filteredQuestions = filteredQuestions.filter(
            (q) => !solvedQuestionIds.has(q._id)
          );
        } else if (filters.status === "unsolved") {
          filteredQuestions = filteredQuestions.filter(
            (q) => !solvedQuestionIds.has(q._id)
          );
        }
        setQuestions(filteredQuestions);
        setTotalPages(response.pages);
        setTotal(response.total);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const loadSolvedQuestions = async () => {
    try {
      const response = await apiService.getUserSubmissions();
      if (response.success && response.data) {
        const solved = new Set(
          response.data
            .filter((sub) => sub.status === "Accepted")
            .map((sub) =>
              typeof sub.questionId === "string"
                ? sub.questionId
                : sub.questionId._id
            )
        );
        setSolvedQuestionIds(solved);
      }
    } catch (error) {
      console.error("Failed to load solved question", error);
    }
  };

  const handleFilterChange = (newFilters: FileType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Practice Questions
          </h1>
          <p className="text-gray-600 mt-2">
            Solve coding problems and improve your skills
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <QuestionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-error-light border border-error text-error-dark px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Questions List */}
        {!loading && !error && (
          <>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
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
                                ? "bg-primary-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
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
                    }
                  )}
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
