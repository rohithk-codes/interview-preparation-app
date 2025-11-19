import React, { useState } from 'react'
import type{ TestResult } from '../../types'
import{CheckCircle2,XCircle,ChevronDown,ChevronRight,Clock} from "lucide-react"

interface TestResultsProps{
  results:TestResult[]
}
 
const TestResults = ({results}:TestResultsProps) => {

  const [expandedIndex,setExpandedIndex] = useState<number | null>(0)

  const passedCount = results.filter((r)=>r.passed).length
  const totalCount = results.length
  const allPassed = passedCount === totalCount

  const toggleExpanded = (index:number)=>{
    setExpandedIndex(expandedIndex ===index? null : index)
  }
 return (
    <div className="card">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              allPassed
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {allPassed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                All Passed
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                {passedCount}/{totalCount} Passed
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              allPassed ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${(passedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`border rounded-lg ${
              result.passed
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            {/* Test Case Header */}
            <button
              onClick={() => toggleExpanded(index)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                {result.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium text-gray-900">
                  Test Case {index + 1}
                </span>
                {result.executionTime !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {result.executionTime}ms
                  </span>
                )}
              </div>
              {expandedIndex === index ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Test Case Details */}
            {expandedIndex === index && (
              <div className="px-4 pb-4 space-y-3">
                {/* Input */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">
                    Input:
                  </span>
                  <pre className="text-sm bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                    {result.input}
                  </pre>
                </div>

                {/* Expected Output */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">
                    Expected Output:
                  </span>
                  <pre className="text-sm bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                    {result.expectedOutput}
                  </pre>
                </div>

                {/* Actual Output */}
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">
                    Your Output:
                  </span>
                  <pre
                    className={`text-sm bg-white p-2 rounded border overflow-x-auto ${
                      result.passed
                        ? 'border-green-200'
                        : 'border-red-200'
                    }`}
                  >
                    {result.actualOutput || 'No output'}
                  </pre>
                </div>

                {/* Error Message */}
                {result.error && (
                  <div>
                    <span className="text-sm font-medium text-red-700 block mb-1">
                      Error:
                    </span>
                    <pre className="text-sm bg-red-50 text-red-700 p-2 rounded border border-red-200 overflow-x-auto">
                      {result.error}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestResults
