import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import InterviewSetup from '../components/interview/InterviewSetup';
import ChatInterface from '../components/interview/ChatInterface';
import SessionSummary from '../components/interview/SessionSummary';
import type{ ChatMessage, InterviewQuestion, InterviewSession } from '../types';
import apiService from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft } from 'lucide-react';

type ViewState = 'setup' | 'chat' | 'summary';

const InterviewPractice: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [viewState, setViewState] = useState<ViewState>('setup');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  // Load active session on mount
  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    // Check if user has an active session
    // For now, we'll start fresh each time
    // You can implement session recovery here
  };

  const handleStartSession = async (
    category: string,
    type: string,
    questionCount: number
  ) => {
    setLoading(true);
    try {
      const response = await apiService.startInterviewSession(
        category,
        type,
        questionCount
      );

      if (response.success && response.data) {
        setSession(response.data.session);
        setCurrentQuestion(response.data.firstQuestion);

        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          type: 'bot',
          content: `Welcome! Let's practice ${category} ${type} questions. I'll ask you ${questionCount} questions and provide instant feedback. You can type or speak your answers. Ready?`,
          timestamp: new Date()
        };

        // Add first question
        const questionMessage: ChatMessage = {
          id: response.data.firstQuestion._id,
          type: 'bot',
          content: response.data.firstQuestion.question,
          timestamp: new Date()
        };

        setMessages([welcomeMessage, questionMessage]);
        setViewState('chat');
        toast.success('Session started! Good luck!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (
    answer: string,
    isVoiceAnswer: boolean,
    timeSpent: number
  ) => {
    if (!session || !currentQuestion) return;

    setSubmitting(true);

    try {
      // Add user's answer to messages
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: answer,
        timestamp: new Date(),
        isVoiceAnswer
      };
      setMessages(prev => [...prev, userMessage]);

      // Submit to backend
      const response = await apiService.submitInterviewAnswer(
        session._id,
        currentQuestion._id,
        answer,
        isVoiceAnswer,
        timeSpent
      );

      if (response.success && response.data) {
        const { evaluation, nextQuestion, isComplete, sessionSummary } = response.data;

        // Add evaluation message
        const evaluationMessage: ChatMessage = {
          id: `eval-${Date.now()}`,
          type: 'bot',
          content: `Your score: ${evaluation.percentage}%`,
          timestamp: new Date(),
          evaluation: {
            percentage: evaluation.percentage,
            matchedKeywords: evaluation.matchedKeywords,
            missedKeywords: evaluation.missedKeywords,
            feedback: evaluation.feedback
          }
        };
        setMessages(prev => [...prev, evaluationMessage]);

        if (isComplete) {
          // Session complete
          setSessionSummary(sessionSummary);
          
          // Add completion message
          const completionMessage: ChatMessage = {
            id: 'complete',
            type: 'bot',
            content: '🎉 Congratulations! You\'ve completed all questions. Let\'s see how you did!',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completionMessage]);

          // Show summary after a delay
          setTimeout(() => {
            setViewState('summary');
          }, 2000);
        } else if (nextQuestion) {
          // Add next question
          setCurrentQuestion(nextQuestion);
          const nextQuestionMessage: ChatMessage = {
            id: nextQuestion._id,
            type: 'bot',
            content: nextQuestion.question,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextQuestionMessage]);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    if (session && viewState === 'chat') {
      const confirm = window.confirm(
        'Are you sure you want to exit? Your progress will be saved.'
      );
      if (confirm) {
        navigate('/questions');
      }
    } else {
      navigate('/questions');
    }
  };

  return (
    <Layout>
      {viewState !== 'setup' && (
        <button
          onClick={handleExit}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit Interview
        </button>
      )}

      {viewState === 'setup' && (
        <InterviewSetup onStart={handleStartSession} loading={loading} />
      )}

      {viewState === 'chat' && currentQuestion && session && (
        <div className="h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ChatInterface
            currentQuestion={currentQuestion}
            questionNumber={session.currentQuestionIndex + 1}
            totalQuestions={session.questionIds.length}
            onSubmitAnswer={handleSubmitAnswer}
            submitting={submitting}
            messages={messages}
          />
        </div>
      )}

      {viewState === 'summary' && sessionSummary && (
        <SessionSummary summary={sessionSummary} />
      )}
    </Layout>
  );
};

export default InterviewPractice;