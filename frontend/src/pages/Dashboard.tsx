import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import type { UserStats, Submission, Question } from "../types";
import apiService from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Target, TrendingUp, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

const Dashboard= () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, submissionsRes] = await Promise.all([
        apiService.getUserStats(),
        apiService.getRecentSubmissions(10)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (submissionsRes.success && submissionsRes.data) {
        setRecentSubmissions(submissionsRes.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard</p>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const difficultyData = [
    { name: 'Easy', value: stats.byDifficulty.Easy, color: '#10b981' },
    { name: 'Medium', value: stats.byDifficulty.Medium, color: '#f59e0b' },
    { name: 'Hard', value: stats.byDifficulty.Hard, color: '#ef4444' }
  ];

  const submissionData = [
    { name: 'Accepted', value: stats.acceptedSubmissions, color: '#10b981' },
    { name: 'Failed', value: stats.totalSubmissions - stats.acceptedSubmissions, color: '#ef4444' }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Accepted') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'Running' || status === 'Pending') return <Clock className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your progress and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Solved</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalSolved}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{stats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{stats.acceptedSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Difficulty Distribution */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Problems by Difficulty</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Submission Status */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Submission Results</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => {
                const question = submission.questionId as Question;
                return (
                  <div
                    key={submission._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(submission.status)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {typeof question === 'string' ? 'Question' : question.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span>{formatDate(submission.submittedAt)}</span>
                          <span>•</span>
                          <span className={
                            submission.status === 'Accepted' 
                              ? 'text-green-600 font-medium' 
                              : 'text-red-600 font-medium'
                          }>
                            {submission.status}
                          </span>
                          <span>•</span>
                          <span>{submission.passedTestCases}/{submission.totalTestCases} passed</span>
                        </div>
                      </div>
                    </div>
                    {submission.executionTime && (
                      <div className="text-sm text-gray-500">
                        {submission.executionTime}ms
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;