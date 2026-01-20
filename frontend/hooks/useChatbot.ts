'use client';

/**
 * useChatbot Hook - AI-Powered Task Management Chatbot
 *
 * PHASE III AI CHATBOT INTEGRATION:
 * This hook manages the chatbot state and communication with the backend.
 * Currently uses pattern-matching NLP for command parsing.
 *
 * Future AI enhancements (Phase III):
 * - Integration with OpenAI/Anthropic API for natural language understanding
 * - Context-aware responses based on user's task history
 * - Smart task suggestions and prioritization
 * - Natural conversation flow with memory
 * - Voice input/output support
 */

import { useState, useCallback } from 'react';
import { sendChatMessage, isApiError } from '@/lib/api';
import { ChatbotMessage } from '@/types';

interface UseChatbotReturn {
  messages: ChatbotMessage[];
  isLoading: boolean;
  suggestions: string[];
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChatbot(): UseChatbotReturn {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    // Don't process if it's just a prompt for the user
    if (content.endsWith(': ')) {
      return;
    }

    // Add user message
    const userMessage: ChatbotMessage = {
      id: `user-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setSuggestions([]);

    try {
      const result = await sendChatMessage(content);

      if (isApiError(result)) {
        // Add error message
        const errorMessage: ChatbotMessage = {
          id: `assistant-${Date.now()}`,
          content: result.error.message || 'Something went wrong. Please try again.',
          role: 'assistant',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setSuggestions(['Help', 'Show my tasks']);
      } else {
        // Add assistant message
        const assistantMessage: ChatbotMessage = {
          id: `assistant-${Date.now()}`,
          content: result.data.message,
          role: 'assistant',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setSuggestions(result.data.suggestions || []);

        // If a task was created, modified, or deleted, the task list should be refreshed
        // This is handled by the TaskActivityProvider in the app
        if (
          result.data.success &&
          ['add', 'complete', 'delete'].includes(result.data.intent)
        ) {
          // Dispatch a custom event that can be listened to by the tasks page
          window.dispatchEvent(new CustomEvent('chatbot:task-updated'));
        }
      }
    } catch (error) {
      const errorMessage: ChatbotMessage = {
        id: `assistant-${Date.now()}`,
        content: 'Unable to connect to the server. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSuggestions(['Help']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
  }, []);

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    clearMessages,
  };
}
