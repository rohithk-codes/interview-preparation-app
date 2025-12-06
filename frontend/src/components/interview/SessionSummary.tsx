import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, Clock, Mic, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface SessionSummaryProps {
  summary: {
    totalQuestions: number;
    overallScore: number;
    totalTimeSpent: number;
    voiceAnswersCount: number;
    breakdown: {
      excellent: number;
      good: number;
      needsImprovement: number;
    };
    strongestConcepts: string[];
    areasToImprove: string[];
    recommendations: string[];
  };
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ summary }) => {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent Performance! 🎉';
    if (score >= 60) return 'Good Job! 👍';
    return 'Keep Practicing! 💪';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Session Complete!
        </h1>
        <p className="text-gray-600">
          Here's how you performed
        </p>
      </div>

      {/* Overall Score */}
      <div className={`card text-center mb-6 ${getScoreBg(summary.overallScore)}`}>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          {getScoreMessage(summary.overallScore)}
        </h2>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(summary.overallScore)}`}>
          {summary.overallScore}%
        </div>
        <p className="text-gray-600">Overall Score</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{summary.breakdown.excellent}</div>
          <div className="text-sm text-gray-600">Excellent</div>
        </div>

        <div className="card text-center">
          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{summary.breakdown.good}</div>
          <div className="text-sm text-gray-600">Good</div>
        </div>

        <div className="card text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{summary.breakdown.needsImprovement}</div>
          <div className="text-sm text-gray-600">Need Work</div>
        </div>

        <div className="card text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(summary.totalTimeSpent)}
          </div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </div>
      </div>

      {/* Voice Usage */}
      {summary.voiceAnswersCount > 0 && (
        <div className="card mb-6 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">
                Great use of voice answers!
              </h3>
              <p className="text-sm text-purple-700">
                You practiced {summary.voiceAnswersCount} verbal explanations
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Strengths */}
      {summary.strongestConcepts.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Your Strengths</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.strongestConcepts.map((concept, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Areas to Improve */}
      {summary.areasToImprove.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Areas to Improve</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.areasToImprove.map((area, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {summary.recommendations.length > 0 && (
        <div className="card mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 Recommendations
          </h3>
          <ul className="space-y-2">
            {summary.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/interview')}
          className="flex-1 btn-primary"
        >
          Start New Session
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 btn-secondary"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
};

export default SessionSummary;