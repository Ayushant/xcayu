import React from 'react';

const ChatbotQuickReplies = ({ replies, onReplyClick }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReplyClick(reply)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
          style={{
            animation: `slideUp 0.2s ease-out ${index * 0.05}s both`
          }}
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default ChatbotQuickReplies;

