'use client';

import { ChatbotMessage } from '@/types';

interface ChatMessageProps {
  message: ChatbotMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
        }`}
      >
        <div
          className={`text-sm whitespace-pre-wrap ${
            isUser ? '' : 'prose prose-sm dark:prose-invert max-w-none'
          }`}
        >
          {message.content.split('\n').map((line, index) => (
            <span key={index}>
              {line.startsWith('**') && line.endsWith('**') ? (
                <strong>{line.slice(2, -2)}</strong>
              ) : line.startsWith('- ') ? (
                <span className="block ml-2">{line}</span>
              ) : (
                line
              )}
              {index < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
