import React from 'react';

const ChatbotMessage = ({ message, isBot }) => {
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-slideUp`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isBot
            ? 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
        }`}
        style={{
          animation: 'slideUp 0.2s ease-out'
        }}
      >
        <p className="text-sm leading-relaxed whitespace-pre-line">{message}</p>
      </div>
    </div>
  );
};

export default ChatbotMessage;

