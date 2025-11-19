import React from "react";
import { useNavigate } from "react-router-dom";
import type { Question } from "../../types/index";
import { CheckCircle2, Circle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  isSolved?: boolean;
}

const QuestionCard = ({ question, isSolved = false }: QuestionCardProps) => {
  const navigate = useNavigate();

  const difficultyColors = {
    Easy: "text-green-600 bg-green-50 border-green-200",
    Medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    Hard: "text-red-600 bg-red-50 border-red-200",
  };

  const handleClick = () => {
    console.log("id",question._id)
    navigate(`/questions/${question._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="card hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Status icon and content */}
        <div className="flex items-start gap-3 flex-1">
         
          <div className="flex-shrink-0 mt-1">
            {isSolved ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {question.title}
            </h3>

            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {question.description.substring(0, 150)}...
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {question.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                >
                  {tag}
                </span>
              ))}
              {question.tags.length > 3 && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md">
                  +{question.tags.length - 3}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{question.topic}</span>
              <span>•</span>
              <span>
                {question.acceptanceRate
                  ? `${question.acceptanceRate}% acceptance`
                  : "No submissions yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Difficulty badge */}
        <div className="flex-shrink-0">
          <span
            className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                ${difficultyColors[question.difficulty]}
              `}
          >
            {question.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
