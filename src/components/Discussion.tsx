import React, { useState, useRef, useEffect } from 'react';
import { Paper } from '../types/paper';
import { Message, streamChatWithPaper, streamInitialPaperReview, PaperReview } from '../lib/ai';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ComputerDesktopIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

interface DiscussionProps {
  paper: Paper;
  isDarkMode: boolean;
}

export default function Discussion({ paper, isDarkMode }: DiscussionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<PaperReview | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage?.content]);

  useEffect(() => {
    const loadInitialReview = async () => {
      try {
        setError(null);
        let partialReview: Partial<PaperReview> = {};
        
        for await (const chunk of streamInitialPaperReview(paper)) {
          partialReview = { ...partialReview, ...chunk };
          setReview(partialReview as PaperReview);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(message);
        console.error('Error loading initial review:', error);
      } finally {
        setIsLoadingReview(false);
      }
    };

    loadInitialReview();
  }, [paper]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let streamContent = '';
      setStreamingMessage({ role: 'assistant', content: '', isStreaming: true });

      for await (const chunk of streamChatWithPaper(paper, input, messages)) {
        streamContent += chunk;
        setStreamingMessage({ role: 'assistant', content: streamContent, isStreaming: true });
      }

      const assistantMessage: Message = { role: 'assistant', content: streamContent };
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${message}`
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  if (error && !review && !isLoadingReview) {
    return (
      <div className={`p-6 rounded-xl ${
        isDarkMode ? 'bg-red-500/10' : 'bg-red-50'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <ExclamationTriangleIcon className={`h-5 w-5 ${
            isDarkMode ? 'text-red-400' : 'text-red-500'
          }`} />
          <h3 className={`font-medium ${
            isDarkMode ? 'text-red-400' : 'text-red-700'
          }`}>
            Error
          </h3>
        </div>
        <p className={`text-sm ${
          isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(90vh-200px)]">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingReview ? (
          <div className="flex items-center justify-center">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
              isDarkMode ? 'border-pink-500' : 'border-purple-600'
            }`} />
          </div>
        ) : review ? (
          <div className={`rounded-xl p-6 ${
            isDarkMode ? 'bg-white/5' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className={`h-5 w-5 ${
                isDarkMode ? 'text-pink-500' : 'text-purple-600'
              }`} />
              <h3 className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Paper Review
              </h3>
            </div>
            
            <div className={`space-y-4 ${
              isDarkMode ? 'text-white/90' : 'text-gray-700'
            }`}>
              <div>
                <h4 className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Summary
                </h4>
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown>{review.summary || ''}</ReactMarkdown>
                </div>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Key Innovation
                </h4>
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown>{review.novelty || ''}</ReactMarkdown>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-500'
                }`}>
                  Suggested Questions
                </h4>
                <div className="space-y-2">
                  {review.suggestedQuestions?.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question)}
                      className={`w-full text-left text-sm p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-white/5 hover:bg-white/10 text-white/90'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role === 'assistant' && (
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-pink-500/10' : 'bg-purple-100'
              }`}>
                <ComputerDesktopIcon className={`h-6 w-6 ${
                  isDarkMode ? 'text-pink-500' : 'text-purple-600'
                }`} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 ${
                message.role === 'user'
                  ? isDarkMode
                    ? 'bg-pink-500 text-white'
                    : 'bg-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-white/10 text-white'
                    : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
            {message.role === 'user' && (
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-pink-500/10' : 'bg-purple-100'
              }`}>
                <UserCircleIcon className={`h-6 w-6 ${
                  isDarkMode ? 'text-pink-500' : 'text-purple-600'
                }`} />
              </div>
            )}
          </div>
        ))}
        
        {streamingMessage && (
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              isDarkMode ? 'bg-pink-500/10' : 'bg-purple-100'
            }`}>
              <ComputerDesktopIcon className={`h-6 w-6 ${
                isDarkMode ? 'text-pink-500' : 'text-purple-600'
              }`} />
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
              isDarkMode
                ? 'bg-white/10 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{streamingMessage.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the paper..."
            className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-white placeholder-white/50'
                : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'
            } border focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-4 py-2 rounded-xl transition-colors ${
              isDarkMode
                ? 'bg-pink-500 text-white hover:bg-pink-600 disabled:bg-pink-500/50'
                : 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}