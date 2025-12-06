import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import type { ChatMessage as ChatMessageType, InterviewQuestion } from '../../types';
import { Send, Mic, MicOff, Loader } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface ChatInterfaceProps {
  currentQuestion: InterviewQuestion;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string, isVoiceAnswer: boolean, timeSpent: number) => void;
  submitting: boolean;
  messages: ChatMessageType[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentQuestion,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  submitting,
  messages
}) => {
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset start time when question changes
  useEffect(() => {
    setStartTime(new Date());
    setAnswer('');
    resetTranscript();
  }, [currentQuestion._id]);

  // Update answer with voice transcript
  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim() || submitting) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    onSubmitAnswer(answer.trim(), isListening, timeSpent);
    
    setAnswer('');
    resetTranscript();
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Interview Practice
            </h2>
            <p className="text-sm text-gray-600">
              Question {questionNumber} of {totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {Math.round((questionNumber / totalQuestions) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Voice Error */}
            {speechError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {speechError}
              </div>
            )}

            {/* Voice Status */}
            {isListening && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded animate-pulse">
                <Mic className="w-4 h-4" />
                <span>Listening... Speak your answer</span>
              </div>
            )}

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isListening
                    ? 'Listening to your answer...'
                    : 'Type your answer or use the microphone...'
                }
                className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                disabled={submitting || isListening}
              />

              {/* Voice Button */}
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                {isSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    disabled={submitting}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                )}

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!answer.trim() || submitting}
                  className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send answer"
                >
                  {submitting ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Helper Text */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {isSupported ? (
                  <span>💡 Press the mic button to speak your answer</span>
                ) : (
                  <span>⚠️ Voice input not supported in this browser</span>
                )}
              </div>
              <span>Press Enter to send (Shift+Enter for new line)</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;