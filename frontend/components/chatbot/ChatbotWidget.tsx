'use client';

import { useState, useCallback } from 'react';
import { ChatbotPanel } from './ChatbotPanel';
import { useChatbot } from '@/hooks/useChatbot';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, suggestions, sendMessage } = useChatbot();

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Panel */}
      {isOpen && (
        <ChatbotPanel
          messages={messages}
          isLoading={isLoading}
          suggestions={suggestions}
          onSend={sendMessage}
          onClose={handleClose}
        />
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center
                   transition-all duration-300 hover:scale-105 active:scale-95
                   ${
                     isOpen
                       ? 'bg-gray-600 hover:bg-gray-700'
                       : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                   }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
