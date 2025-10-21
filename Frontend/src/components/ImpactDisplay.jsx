import React from 'react';

/**
 * Impact Display Component
 * 
 * Shows impact text for selected options after quiz completion
 * - Only displays impact for chosen options
 * - Organized by rank/priority
 * - Shows decimal points per option
 * - Premium gaming UI styling
 */

const ImpactDisplay = ({ answers, quiz }) => {
  if (!answers || !quiz) {
    return null;
  }

  return (
    <div className="space-y-8 my-8">
      <h2 className="text-3xl font-black text-white mb-6 flex items-center">
        <svg className="w-8 h-8 text-cyan-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Strategic Impact Analysis
      </h2>

      {answers.map((answer, idx) => {
        if (!answer.impacts || answer.impacts.length === 0) {
          return null;
        }

        return (
          <div
            key={idx}
            className="premium-card border-2 border-cyan-400/30 hover:border-cyan-400/60 transition-all"
          >
            {/* Question Title */}
            <div className="flex items-start mb-6">
              <div className="neon-badge">
                {idx + 1}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-black text-2xl text-white">
                  {answer.questionText}
                </h3>
              </div>
            </div>

            {/* Impacts Section */}
            <div className="space-y-4">
              {answer.impacts
                .sort((a, b) => a.rank - b.rank)
                .map((impact, impactIdx) => (
                  <div
                    key={impactIdx}
                    className="glass-panel p-6 border-2 border-cyan-400/30 hover:border-cyan-400/50 transition-all group"
                  >
                    {/* Priority Rank */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-black text-white text-lg">
                        {impact.rank}
                      </div>
                      
                      <div className="flex-1">
                        {/* Option Text */}
                        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition">
                          {impact.text}
                        </h4>

                        {/* Points Display */}
                        <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-full mb-3">
                          <span className="text-sm font-bold text-blue-300">
                            Points: {typeof impact.points === 'number' ? impact.points.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Impact Text */}
                    {impact.impact && (
                      <div className="ml-14 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white/90 leading-relaxed italic">
                          <span className="text-cyan-300 font-semibold">Impact: </span>
                          {impact.impact}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImpactDisplay;
