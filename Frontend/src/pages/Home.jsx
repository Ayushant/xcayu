import React from "react";
import { useNavigate } from "react-router-dom";
import { EvervaultCard, Icon } from "../components/ui/evervault-card";
import Chatbot from "../components/Chatbot/Chatbot";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-2">
              Demo Video and Brief about the simulation
            </h1>
          </div>

          {/* Video Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-purple-500 border-opacity-30">
              <div className="aspect-video bg-black relative overflow-hidden">
                <iframe
                  className="w-full h-full"
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '0'
                  }}
                  src="https://www.youtube.com/embed/U89lSIFf16k?autoplay=1&mute=1&loop=1&playlist=U89lSIFf16k&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&playsinline=1&cc_load_policy=0&cc_lang_pref=en&widget_referrer=https://yourwebsite.com&origin=https://yourwebsite.com"
                  title="Simulation Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                
                {/* CSS overlay to hide YouTube branding in control bar */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '200px',
                    height: '50px',
                    background: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
                
                {/* Additional overlay to block any remaining YouTube elements */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '120px',
                    height: '40px',
                    background: 'rgba(0,0,0,0.9)',
                    pointerEvents: 'none',
                    zIndex: 3
                  }}
                />
              </div>
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-900 to-gray-800">
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  Experience the Area Manager Simulation – an immersive educational platform designed to help students 
                  understand real-world business management scenarios. Navigate through complex decision-making processes 
                  and build essential management skills in a safe learning environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 py-10 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Our Coming Up Simulation & Other Activities
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-3 sm:mb-5"></div>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
              Discover our upcoming interactive simulations designed to elevate your management skills
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Card 1 - Team Management */}
            <div className="group relative">
              <div className="border-2 border-blue-200 flex flex-col p-4 sm:p-5 relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -top-2 -left-2 sm:-top-2.5 sm:-left-2.5 text-blue-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -bottom-2 -left-2 sm:-bottom-2.5 sm:-left-2.5 text-blue-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 text-blue-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 text-blue-600" />

                <div className="w-full h-32 sm:h-40 mb-3 sm:mb-4">
                  <EvervaultCard text="🎯" />
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-gray-900 text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                    Team Management Simulation
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 flex-1">
                    Learn to manage diverse teams, allocate resources, and drive productivity in various business scenarios.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-medium">
                      Leadership
                    </span>
                    <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300 font-medium">
                      Teamwork
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Strategic Planning */}
            <div className="group relative">
              <div className="border-2 border-purple-200 flex flex-col p-4 sm:p-5 relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl hover:border-purple-500 hover:shadow-2xl transition-all duration-300">
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -top-2 -left-2 sm:-top-2.5 sm:-left-2.5 text-purple-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -bottom-2 -left-2 sm:-bottom-2.5 sm:-left-2.5 text-purple-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 text-purple-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 text-purple-600" />

                <div className="w-full h-32 sm:h-40 mb-3 sm:mb-4">
                  <EvervaultCard text="💡" />
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-gray-900 text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                    Strategic Planning Workshop
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 flex-1">
                    Develop long-term strategic thinking skills through interactive planning exercises and real-world case studies.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300 font-medium">
                      Strategy
                    </span>
                    <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-300 font-medium">
                      Analysis
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Crisis Management */}
            <div className="group relative">
              <div className="border-2 border-green-200 flex flex-col p-4 sm:p-5 relative bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl hover:border-green-500 hover:shadow-2xl transition-all duration-300">
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -top-2 -left-2 sm:-top-2.5 sm:-left-2.5 text-green-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -bottom-2 -left-2 sm:-bottom-2.5 sm:-left-2.5 text-green-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 text-green-600" />
                <Icon className="absolute h-4 w-4 sm:h-5 sm:w-5 -bottom-2 -right-2 sm:-bottom-2.5 sm:-right-2.5 text-green-600" />

                <div className="w-full h-32 sm:h-40 mb-3 sm:mb-4">
                  <EvervaultCard text="⚡" />
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-gray-900 text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                    Crisis Management Training
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 flex-1">
                    Master the art of making critical decisions under pressure and leading teams through challenging situations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-medium">
                      Decision Making
                    </span>
                    <span className="text-xs px-2 sm:px-3 py-1 rounded-full bg-teal-100 text-teal-700 border border-teal-300 font-medium">
                      Resilience
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm">
            © 2025 atkind. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm mt-2">
            Powered by <a href="https://atkind.com" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">atkind.com</a>
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Home;