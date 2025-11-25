import React from 'react'
import type { Question } from '../../types'
import {Tag,BarChart3} from "lucide-react"
interface QuestionDescription{
  question:Question
}

const QuestionDescription = ({question}:QuestionDescription) => {
 const difficultyColors = {
    Easy: 'text-green-600 bg-green-50',
    Medium: 'text-yellow-600 bg-yellow-50',
    Hard: 'text-red-600 bg-red-50'
  };
 return (
    <div className="card">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {question.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Badge */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              difficultyColors[question.difficulty]
            }`}
          >
            {question.difficulty}
          </span>

          {/* Topic */}
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Tag className="w-4 h-4" />
            {question.topic}
          </span>


          {/* Acceptance Rate */}
          {question.acceptanceRate !== undefined && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <BarChart3 className="w-4 h-4" />
              {question.acceptanceRate}% Acceptance
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Description
        </h2>
        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {question.description}
        </div>
      </div>

      {/* Examples */}
      {question.examples && question.examples.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Examples
          </h2>
          <div className="space-y-4">
            {question.examples.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Input:</span>
                  <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-200">
                    {example.input}
                  </pre>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Output:</span>
                  <pre className="mt-1 text-sm bg-white p-2 rounded border border-gray-200">
                    {example.output}
                  </pre>
                </div>
                {example.explanation && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Explanation:</span>
                    <p className="mt-1 text-sm text-gray-600">{example.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints */}
      {question.constraints && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Constraints
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {question.constraints}
            </pre>
          </div>
        </div>
      )}

      {/* Hints */}
      {question.hints && question.hints.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Hints
          </h2>
          <div className="space-y-2">
            {question.hints.map((hint, index) => (
              <details key={index} className="bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-700">
                  Hint {index + 1}
                </summary>
                <p className="mt-2 text-sm text-gray-700">{hint}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionDescription
