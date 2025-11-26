import React, { useState, useEffect } from "react";
import type { Submission } from "../../types";
import apiService from "../../services/api";
import { X, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface SubmissionHistoryProps {
  questionId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SubmissionHistory = ({
  questionId,
  isOpen,
  onClose,
}: SubmissionHistoryProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSubmissions();
    }
  }, [isOpen, questionId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getQuestionSubmissions(questionId);
      if (response.success && response.data) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error("Failed to load submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Wrong Answer":
      case "Runtime Error":
      case "Time Limit Exceeded":
      case "Compilation Error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "Running":
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

const getStatusColor = (status:string)=>{
    switch (status) {
      case 'Accepted':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Wrong Answer':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'Runtime Error':
      case 'Compilation Error':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Time Limit Exceeded':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Running':
      case 'Pending':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
}

const formatDate = (dateString:string)=>{
const date = new Date(dateString)
const now = new Date();
const diffInMs = now.getTime() - date.getTime()
const diffInMins = Math.floor(diffInMs/60000);
const diffInHours = Math.floor(diffInMs/3600000)
const diffInDays = Math.floor(diffInMs/86400000)

if(diffInMins<1) return `Just now`
if(diffInMins<60) return `${diffInMins}m ago`
if(diffInHours<24) return `${diffInHours}h ago`
if(diffInDays<7) return `${diffInDays}d ago`
return date.toLocaleDateString()
}

if(!isOpen) return null;

 return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Submission History
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No submissions yet</p>
            </div>
          ) : selectedSubmission ? (
            // Submission Detail View
            <div className="p-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-primary-600 hover:text-primary-700 mb-4"
              >
                ← Back to list
              </button>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedSubmission.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedSubmission.status
                    )}`}
                  >
                    {selectedSubmission.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedSubmission.passedTestCases}/{selectedSubmission.totalTestCases} tests passed
                  </span>
                </div>

                {/* Code */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Code</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    {selectedSubmission.code}
                  </pre>
                </div>

                {/* Test Results */}
                {selectedSubmission.testResults && selectedSubmission.testResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Test Results</h3>
                    <div className="space-y-2">
                      {selectedSubmission.testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.passed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {result.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">Test Case {index + 1}</span>
                          </div>
                          {!result.passed && (
                            <div className="text-sm space-y-1 ml-6">
                              <div>
                                <span className="font-medium">Expected:</span> {result.expectedOutput}
                              </div>
                              <div>
                                <span className="font-medium">Got:</span> {result.actualOutput}
                              </div>
                              {result.error && (
                                <div className="text-red-600">
                                  <span className="font-medium">Error:</span> {result.error}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {selectedSubmission.error && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-700">Error</h3>
                    <pre className="bg-red-50 text-red-700 p-4 rounded-lg overflow-x-auto text-sm">
                      {selectedSubmission.error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Submissions List
            <div className="p-6 space-y-3">
              {submissions.map((submission) => (
                <button
                  key={submission._id}
                  onClick={() => setSelectedSubmission(submission)}
                  className="w-full card hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(submission.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                              submission.status
                            )}`}
                          >
                            {submission.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {submission.passedTestCases}/{submission.totalTestCases} passed
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatDate(submission.submittedAt)}</span>
                          {submission.executionTime && (
                            <>
                              <span>•</span>
                              <span>{submission.executionTime}ms</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="uppercase">{submission.language}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-primary-600 text-sm font-medium">
                      View Details →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

};


export default SubmissionHistory