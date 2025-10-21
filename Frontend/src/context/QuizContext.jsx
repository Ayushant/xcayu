import React, { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext();

export const quizQuestions = [
  {
    id: 1,
    day: 1,
    title: 'Salesman Recruitment Strategy',
    description: `Cover the top confectionary, bakery, supermarkets across NCR numbering 1500 in 3 to 6 months. 
      These outlets are the key stores for Tedbury's and are very snooty by nature.`,
    timeLimit: 120, // 2 minutes
    rules: [
      "Each Salesman can cover maximum of 8-10 outlets per day considering the distances",
      "These outlets prefer visit of salesman twice every week.",
      "Your manpower budget should be 6-7% of annual sales",
      "The salary of best salesman in Tedbury's is very high"
    ],
    options: [
      {
        id: 'A',
        text: 'Poach best salesmen from Tedbury',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'B',
        text: 'Recruit experienced from other food/non-food brands',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'C',
        text: 'Build team of freshers & moderate experience',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'D',
        text: 'Mix of experienced, moderate, and freshers from food brands',
        correctOrder: 1,
        points: 30
      }
    ]
  },
  {
    id: 2,
    day: 2,
    title: 'Distribution Strategy',
    description: 'You need to establish an effective distribution network for your chocolate products across NCR.',
    timeLimit: 90, // 1.5 minutes
    rules: [
      "Products need temperature-controlled storage",
      "Delivery time is critical for freshness",
      "Need to cover 1500 outlets within 6 months",
      "Limited cold chain infrastructure available"
    ],
    options: [
      {
        id: 'A',
        text: 'Partner with existing FMCG distributors',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'B',
        text: 'Set up own distribution network',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'C',
        text: 'Use third-party logistics providers',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'D',
        text: 'Hybrid model with own and partner network',
        correctOrder: 1,
        points: 30
      }
    ]
  },
  {
    id: 3,
    day: 3,
    title: 'Pricing Strategy',
    description: 'Need to determine optimal pricing strategy for the Indian market while maintaining premium positioning.',
    timeLimit: 75, // 1.25 minutes
    rules: [
      "Competition pricing is 10-15% lower",
      "Need to maintain premium brand image",
      "Price sensitivity in Indian market",
      "Raw material costs are high"
    ],
    options: [
      {
        id: 'A',
        text: 'Premium pricing 20% above market',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'B',
        text: 'Match competitor pricing',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'C',
        text: 'Selective premium pricing',
        correctOrder: 1,
        points: 30
      },
      {
        id: 'D',
        text: 'Introductory discount pricing',
        correctOrder: 2,
        points: 25
      }
    ]
  },
  {
    id: 4,
    day: 4,
    title: 'Market Penetration',
    description: 'Develop strategy to penetrate the market effectively and gain market share.',
    timeLimit: 105, // 1.75 minutes
    rules: [
      "Limited brand awareness in India",
      "Strong competition from established players",
      "Need quick market presence",
      "Limited marketing budget"
    ],
    options: [
      {
        id: 'A',
        text: 'Focus on premium retail outlets',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'B',
        text: 'Mass market approach',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'C',
        text: 'Targeted digital marketing',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'D',
        text: 'Phased market entry strategy',
        correctOrder: 1,
        points: 30
      }
    ]
  },
  {
    id: 5,
    day: 5,
    title: 'Product Portfolio',
    description: 'Decide which products to launch first in the Indian market.',
    timeLimit: 60, // 1 minute
    rules: [
      "Different taste preferences in India",
      "Need for temperature stability",
      "Competition strong in certain segments",
      "Limited shelf space in stores"
    ],
    options: [
      {
        id: 'A',
        text: 'Launch all products simultaneously',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'B',
        text: 'Start with bestsellers only',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'C',
        text: 'Focus on India-specific variants',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'D',
        text: 'Phased portfolio introduction',
        correctOrder: 1,
        points: 30
      }
    ]
  },
  {
    id: 6,
    day: 6,
    title: 'Trade Marketing Strategy',
    description: 'Design trade marketing approach for retailer engagement.',
    timeLimit: 90, // 1.5 minutes
    rules: [
      "Limited retailer relationships",
      "Need for display space",
      "Competition offers high margins",
      "Limited trade marketing budget"
    ],
    options: [
      {
        id: 'A',
        text: 'High trade margins',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'B',
        text: 'Exclusive display arrangements',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'C',
        text: 'Performance-based incentives',
        correctOrder: 1,
        points: 30
      },
      {
        id: 'D',
        text: 'Basic trade support',
        correctOrder: 4,
        points: 15
      }
    ]
  },
  {
    id: 7,
    day: 7,
    title: 'Consumer Promotion',
    description: 'Plan consumer promotion strategy for brand building.',
    timeLimit: 75, // 1.25 minutes
    rules: [
      "Need for quick brand recognition",
      "Limited promotional budget",
      "Competition is aggressive",
      "Premium brand positioning"
    ],
    options: [
      {
        id: 'A',
        text: 'Heavy discounting',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'B',
        text: 'Digital-first engagement',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'C',
        text: 'Influencer partnerships',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'D',
        text: 'Integrated marketing approach',
        correctOrder: 1,
        points: 30
      }
    ]
  },
  {
    id: 8,
    day: 8,
    title: 'Quality Control',
    description: 'Establish quality control measures for the supply chain.',
    timeLimit: 90, // 1.5 minutes
    rules: [
      "Temperature sensitivity",
      "Long supply chain",
      "Multiple handling points",
      "Need to maintain global standards"
    ],
    options: [
      {
        id: 'A',
        text: 'Automated monitoring systems',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'B',
        text: 'Regular manual checks',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'C',
        text: 'Third-party quality audits',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'D',
        text: 'Integrated quality management',
        correctOrder: 1,
        points: 30
      }
    ]
  },
  {
    id: 9,
    day: 9,
    title: 'Channel Strategy',
    description: 'Determine the most effective sales channels.',
    timeLimit: 105, // 1.75 minutes
    rules: [
      "Multiple retail formats",
      "E-commerce growing rapidly",
      "Modern trade vs traditional trade",
      "Need for cold chain"
    ],
    options: [
      {
        id: 'A',
        text: 'Focus on modern trade',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'B',
        text: 'Traditional trade only',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'C',
        text: 'E-commerce focus',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'D',
        text: 'Multi-channel approach',
        correctOrder: 1,
        points: 30
      }
    ]
  },
  {
    id: 10,
    day: 10,
    title: 'Growth Strategy',
    description: 'Plan the next phase of growth after initial market entry.',
    timeLimit: 120, // 2 minutes
    rules: [
      "Initial market response available",
      "Competition reacting to entry",
      "Need for sustainable growth",
      "Resource constraints"
    ],
    options: [
      {
        id: 'A',
        text: 'Rapid expansion',
        correctOrder: 4,
        points: 15
      },
      {
        id: 'B',
        text: 'Focus on profitability',
        correctOrder: 2,
        points: 25
      },
      {
        id: 'C',
        text: 'Market consolidation',
        correctOrder: 3,
        points: 20
      },
      {
        id: 'D',
        text: 'Balanced growth approach',
        correctOrder: 1,
        points: 30
      }
    ]
  }
];

export function QuizProvider({ children }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Initialize timer when question changes
  useEffect(() => {
    if (currentQuestion < quizQuestions.length) {
      setTimeLeft(quizQuestions[currentQuestion].timeLimit);
      setIsTimerActive(true);
    }
  }, [currentQuestion]);

  const handleTimeUp = () => {
    // Auto-submit with current state when time runs out
    autoSubmitAnswer();
  };

  const autoSubmitAnswer = () => {
    const question = quizQuestions[currentQuestion];
    const orderedOptions = question.options.map((opt, index) => ({
      ...opt,
      order: index + 1
    }));
    
    submitAnswer(question.id, orderedOptions, '', true); // true indicates auto-submission
  };

  const submitAnswer = (questionId, orderedOptions, reasoning, isAutoSubmit = false) => {
    setIsTimerActive(false); // Stop timer when answer is submitted
    
    const question = quizQuestions[currentQuestion];
    let questionScore = 0;
    let accuracyPerOption = {};

    // Calculate score and accuracy for each option
    orderedOptions.forEach((option, index) => {
      const correctOption = question.options.find(opt => opt.id === option.id);
      const positionDifference = Math.abs(correctOption.correctOrder - (index + 1));
      const accuracy = Math.max(0, 100 - (positionDifference * 25)); // 25% penalty per position off
      
      accuracyPerOption[option.id] = {
        accuracy,
        userPosition: index + 1,
        correctPosition: correctOption.correctOrder,
        points: correctOption.correctOrder === index + 1 ? correctOption.points : 0
      };

      if (correctOption.correctOrder === index + 1) {
        questionScore += correctOption.points;
      }
    });

    // Add bonus points for providing reasoning (optional) - but not for auto-submit
    const reasoningPoints = !isAutoSubmit && reasoning && reasoning.length > 50 ? 10 : 0;
    questionScore += reasoningPoints;

    // Calculate time taken
    const timeTaken = question.timeLimit - timeLeft;

    // Save answer with detailed analysis
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId,
      orderedOptions,
      reasoning,
      score: questionScore,
      reasoningPoints,
      accuracyPerOption,
      title: question.title,
      totalAccuracy: Object.values(accuracyPerOption).reduce((acc, curr) => acc + curr.accuracy, 0) / 4,
      timeTaken,
      isAutoSubmitted: isAutoSubmit
    };
    setAnswers(newAnswers);

    // Update total score
    setScore(prevScore => prevScore + questionScore);

    // Move to next question or show results
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const submitQuiz = () => {
    // Force submission of current question if on last question
    if (currentQuestion === quizQuestions.length - 1) {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(0);
    setShowResults(false);
    setTimeLeft(quizQuestions[0].timeLimit);
    setIsTimerActive(true);
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuestion,
        totalQuestions: quizQuestions.length,
        question: quizQuestions[currentQuestion],
        answers,
        score,
        showResults,
        timeLeft,
        isTimerActive,
        submitAnswer,
        submitQuiz,
        restartQuiz,
        handleTimeUp,
        setTimeLeft
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
