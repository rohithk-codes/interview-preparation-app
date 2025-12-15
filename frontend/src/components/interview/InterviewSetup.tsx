import React, { useState } from "react";
import { Code2, MessageSquare, Zap } from "lucide-react";

interface InterviewSetupProps {
  onStart: (category: string, type: string, questionCount: number) => void;
  loading: boolean;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({
  onStart,
  loading,
}) => {
  const [category, setCategory] = useState("javascript");
  const [type, setType] = useState("frontend");
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(category, type, questionCount);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interview Practice
        </h1>
        <p className="text-gray-600">
          Practice answering technical interview questions with instant feedback
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <Code2 className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">
            Technical Questions
          </h3>
          <p className="text-sm text-gray-600">Real interview questions</p>
        </div>
        <div className="card text-center">
          <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Instant Feedback</h3>
          <p className="text-sm text-gray-600">Get scored immediately</p>
        </div>
        <div className="card text-center">
          <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">Voice Support</h3>
          <p className="text-sm text-gray-600">Type or speak answers</p>
        </div>
      </div>

      {/* Setup Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Configure Your Session</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language / Technology
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "javascript", label: "JavaScript" },
                { value: "python", label: "Python" },
                { value: "java", label: "Java" },
                { value: "general", label: "General CS" },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-lg border-2  transition-all ${
                    category === cat.value
                      ? "border-primary-600 bg-orange-400 text-white"
                      : "border-gray-200 hover:border-orange-400"
                  }`}
                >
                  <span className="font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Area
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "frontend", label: "Frontend" },
                { value: "backend", label: "Backend" },
                { value: "fullstack", label: "Full Stack" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    type === t.value
                      ? "border-primary-600 bg-green-500 text-white"
                      : "border-gray-200 hover:border-green-500"
                  }`}
                >
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3 (Quick)</span>
              <span>10 (Full)</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700
    text-white
    font-semibold
    py-3 px-4
    rounded-lg
    transition-all 
    duration-200 
    disabled:opacity-50
     disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center   gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-200"></div>
                Starting Session...
              </span>
            ) : (
              "Start Interview Practice"
            )}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips for Success</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Answer in complete sentences</li>
          <li>• Include key technical terms</li>
          <li>• Use the microphone for practice speaking</li>
          <li>• Review feedback to improve</li>
        </ul>
      </div>
    </div>
  );
};

export default InterviewSetup;
