import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Chatbot from "../components/Chatbot/Chatbot";

// Utility function for class names
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Mouse Enter Context for 3D effect
const MouseEnterContext = React.createContext(undefined);

// WobbleCard Component
const WobbleCard = ({ children, containerClassName, className }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
      }}
      className={cn("mx-auto w-full relative rounded-2xl overflow-hidden", containerClassName)}
    >
      <div
        className="relative h-full sm:rounded-2xl overflow-hidden"
        style={{
          boxShadow: "0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <motion.div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: "transform 0.1s ease-out",
          }}
          className={cn("h-full px-6 py-8", className)}
        >
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};

const Contact = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-3 sm:px-6 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 lg:space-y-16">
        {/* Header */}
        <div className="text-center py-4 sm:py-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto px-2"
          >
            Have questions about our consulting services? Need support or want to discuss partnerships? We're here to help and would love to hear from you.
          </motion.p>
        </div>

        {/* Contact Form */}
        <WobbleCard containerClassName="bg-gradient-to-br from-blue-600 to-indigo-700 max-w-4xl mx-auto">
          <form className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Send Us a Message</h2>
              <p className="text-blue-100 text-sm sm:text-base">Fill out the form below and we'll get back to you shortly</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-all bg-white/95 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-all bg-white/95 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5">Subject *</label>
              <input
                type="text"
                placeholder="What's this about?"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-all bg-white/95 backdrop-blur-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-blue-100 mb-1.5">Message *</label>
              <textarea
                rows={5}
                placeholder="Tell us how we can help you..."
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-all resize-none bg-white/95 backdrop-blur-sm"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-white text-blue-700 py-2.5 sm:py-3.5 rounded-lg text-sm sm:text-base font-bold hover:bg-blue-50 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Send Message →
            </button>
          </form>
        </WobbleCard>

        {/* Support Options */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-10 lg:mb-12">How We Can Help You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <WobbleCard containerClassName="bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">24/7 Support Chat</h3>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base leading-relaxed">Get instant help through our live chat support available around the clock.</p>
              </div>
            </WobbleCard>
            
            <WobbleCard containerClassName="bg-gradient-to-br from-indigo-600 to-purple-600">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Knowledge Base</h3>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base leading-relaxed">Find answers to common questions in our comprehensive documentation.</p>
              </div>
            </WobbleCard>
            
            <WobbleCard containerClassName="bg-gradient-to-br from-purple-600 to-pink-600 sm:col-span-2 lg:col-span-1">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Expert Consultation</h3>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base leading-relaxed">Schedule a one-on-one consultation with our consulting experts.</p>
              </div>
            </WobbleCard>
          </div>
        </div>

        {/* CTA */}
        <WobbleCard containerClassName="bg-gradient-to-br from-blue-700 to-indigo-800">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
              Skip the wait and discover how our consulting expertise can drive your success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button 
                onClick={() => {
                  navigate('/simulation');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white text-blue-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Start Your Journey
              </button>
              <button 
                onClick={() => {
                  navigate('/about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-white/10 transition-all transform hover:scale-105 cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>
        </WobbleCard>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-600 border-t border-gray-200 bg-white/50 mt-12">
        © 2025 atkind. All rights reserved. <br />
        Powered by <a href="https://atkind.com" className="text-blue-600 font-medium hover:text-blue-800">atkind.com</a>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Contact;