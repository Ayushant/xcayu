import React, { useEffect, useRef } from 'react';
import ChatbotMessage from './ChatbotMessage';
import ChatbotQuickReplies from './ChatbotQuickReplies';

const TypingIndicator = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

const ChatbotWindow = ({ isOpen, onClose, messages, isTyping, quickReplies, onQuickReplyClick }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999] md:hidden"
        onClick={onClose}
      />

      {/* Chat window */}
      <div
        className="fixed z-[1000] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 ease-in-out"
        style={{
          bottom: '24px',
          right: '24px',
          width: 'min(380px, calc(100vw - 48px))',
          height: 'min(600px, calc(100vh - 48px))',
          maxWidth: '95vw',
          maxHeight: '85vh',
          animation: 'scaleIn 0.3s ease-in-out'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base">Xaction Assistant</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages area - THIS is the scrollable area */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
          style={{
            height: 'calc(100% - 64px - 80px)', // Total height - header - quick replies area
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {messages.map((msg, index) => (
            <ChatbotMessage key={index} message={msg.text} isBot={msg.isBot} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies area - Fixed at bottom */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-b from-transparent to-white/50">
          {quickReplies.length > 0 && (
            <ChatbotQuickReplies replies={quickReplies} onReplyClick={onQuickReplyClick} />
          )}
          {/* Optional: Text input placeholder */}
          <div className="relative">
            <input
              type="text"
              placeholder="Type your message..."
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-500 cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Custom scrollbar */
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }

          .overflow-y-auto::-webkit-scrollbar-track {
            background: transparent;
          }

          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }

          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.7);
          }
        `}</style>
      </div>
    </>
  );
};

export default ChatbotWindow;

