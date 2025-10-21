import React, { useState, useEffect } from 'react';
import ChatbotButton from './ChatbotButton';
import ChatbotWindow from './ChatbotWindow';
import { chatbotData } from './chatbotData';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  // Initialize chatbot with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          { text: chatbotData.greeting.message, isBot: true }
        ]);
        setQuickReplies(chatbotData.greeting.quickReplies);
        setIsTyping(false);
      }, 800);
    }
  }, [isOpen]);

  const handleQuickReplyClick = (reply) => {
    // Add user message
    setMessages(prev => [...prev, { text: reply, isBot: false }]);
    setQuickReplies([]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = chatbotData.faqs[reply];
      
      if (response) {
        setMessages(prev => [...prev, { text: response.answer, isBot: true }]);
        setQuickReplies(response.quickReplies);
      } else {
        // Fallback response
        setMessages(prev => [...prev, { 
          text: "I'm not sure about that. Let me help you with something else!", 
          isBot: true 
        }]);
        setQuickReplies(chatbotData.greeting.quickReplies);
      }
      
      setIsTyping(false);
    }, 1200);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ChatbotButton onClick={handleToggle} />
      <ChatbotWindow
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        isTyping={isTyping}
        quickReplies={quickReplies}
        onQuickReplyClick={handleQuickReplyClick}
      />
    </>
  );
};

export default Chatbot;

