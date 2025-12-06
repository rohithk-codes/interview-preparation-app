import React from 'react';
import { Bot, User, Mic, CheckCircle2, XCircle } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isBot ? 'bg-primary-600' : 'bg-gray-700'
        }`}
      >
        {isBot ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isBot ? '' : 'flex justify-end'}`}>
        <div
          className={`max-w-2xl rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-white border border-gray-200'
              : 'bg-primary-600 text-white'
          }`}
        >
          {/* Voice indicator for user messages */}
          {!isBot && message.isVoiceAnswer && (
            <div className="flex items-center gap-1 text-xs mb-2 opacity-80">
              <Mic className="w-3 h-3" />
              <span>Voice Answer</span>
            </div>
          )}

          {/* Message text */}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {/* Evaluation if present */}
          {message.evaluation && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {/* Score */}
              <div className="flex items-center gap-2 mb-3">
                {message.evaluation.percentage >= 60 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-900">
                  Score: {message.evaluation.percentage}%
                </span>
              </div>

              {/* Matched Keywords */}
              {message.evaluation.matchedKeywords.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-green-700">
                    ✓ Mentioned:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {message.evaluation.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missed Keywords */}
              {message.evaluation.missedKeywords.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-orange-700">
                    ⚠️ Consider mentioning:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {message.evaluation.missedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-orange-50 text-orange-700 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.evaluation.feedback}
                </p>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-xs mt-2 ${
              isBot ? 'text-gray-500' : 'text-white opacity-70'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;