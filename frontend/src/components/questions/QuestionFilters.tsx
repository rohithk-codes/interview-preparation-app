import React, { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import type { QuestionFilters as FilterType } from "../../types";
import apiService from "../../services/api";

interface QuestionFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

const QuestionFilters = ({ filters, onFilterChange }: QuestionFiltersProps) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await apiService.getTopics();
      if (response.success && response.data) {
        setTopics(response.data);
      }
    } catch (error) {
      console.error("Failed to load topics:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleDifficultyChange = (difficulty: string) => {
    onFilterChange({
      ...filters,
      difficulty: filters.difficulty === difficulty ? "" : difficulty,
    });
  };

  const handleTopicChange = (topic: string) => {
    onFilterChange({
      ...filters,
      topic: filters.topic === topic ? "" : topic,
    });
  };

  const handleStatusChange = (status: "all" | "solved" | "unsolved") => {
    onFilterChange({
      ...filters,
      status: filters.status === status ? "all" : status,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      difficulty: "",
      topic: "",
      search: "",
      status: "all",
    });
  };

  const hasActiveFilters =
    filters.difficulty || filters.topic || filters.status !== "all";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search questions..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Filter Toggle Button (Mobile) */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden w-full btn-secondary flex items-center justify-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full"></span>
        )}
      </button>

      {/* Filters Panel */}
      <div
        className={`
          space-y-4 md:block
          ${showFilters ? "block" : "hidden"}
        `}
      >
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        )}

        {/* Difficulty Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h3>
          <div className="flex flex-wrap gap-2">
            {["Easy", "Medium", "Hard"].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => handleDifficultyChange(difficulty)}
                className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      filters.difficulty === difficulty
                        ? "bg-primary-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "solved", label: "Solved" },
              { value: "unsolved", label: "Unsolved" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value as any)}
                className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      filters.status === status.value
                        ? "bg-primary-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Topic</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicChange(topic)}
                className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      filters.topic === topic
                        ? "bg-primary-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  `}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionFilters;
