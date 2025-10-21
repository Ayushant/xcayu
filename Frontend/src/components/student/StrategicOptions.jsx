import React, { useState } from 'react';

const StrategicOptions = ({ onBack }) => {
  const [options, setOptions] = useState([
    {
      id: 'A',
      text: 'Poach best salesmen from Tedbury',
      order: 1
    },
      description: 'Recruit a team of experienced salespeople with proven track records in FMCG sales.',
      pros: [
        'Immediate market knowledge',
        'Existing relationships with retailers',
        'Minimal training required'
      ],
      cons: [
        'Higher salary expectations',
        'May have existing habits from competitors',
        'Limited to 20% of team at top salary'
      ]
    },
    {
      id: 2,
      title: 'Fresh Graduate Program',
      description: "Build a team primarily consisting of fresh graduates and train them in Pluto's methodologies.",
      pros: [
        'Lower salary costs',
        'Can be molded to company culture',
        'High energy and enthusiasm'
      ],
      cons: [
        'Requires extensive training',
        'No existing market knowledge',
        'Longer time to become effective'
      ]
    },
    {
      id: 3,
      title: 'Hybrid Approach',
      description: 'Mix of experienced professionals and fresh graduates with a structured mentoring program.',
      pros: [
        'Balance of experience and fresh perspective',
        'Knowledge transfer through mentoring',
        'Moderate salary costs'
      ],
      cons: [
        'Complex management required',
        'Varied performance levels initially',
        'Need for structured training program'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Strategic Options</h2>
        <p className="text-gray-600">Choose your recruitment strategy carefully. Each option has its own advantages and challenges.</p>
      </div>

      <div className="grid gap-6">
        {options.map((option) => (
          <div 
            key={option.id}
            className={`border rounded-lg p-6 cursor-pointer transition-all ${
              selectedOption === option.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <div className="flex items-center mb-4">
              <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                selectedOption === option.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {selectedOption === option.id && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{option.title}</h3>
            </div>
            
            <p className="text-gray-700 mb-4 ml-9">{option.description}</p>
            
            <div className="ml-9 grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-green-600 font-semibold mb-2">Advantages</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {option.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-red-600 font-semibold mb-2">Challenges</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {option.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            selectedOption 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!selectedOption}
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default StrategicOptions;
