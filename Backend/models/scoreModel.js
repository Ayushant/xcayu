import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: false // Make optional for simulations
  },
  totalScore: {
    type: Number,
    required: true,
    default: 0
  },
  maxMarks: {
    type: Number,
    default: 100 // Maximum marks for this quiz (set by super admin)
  },
  instructorScore: {
    type: Number,
    default: 0
  },
  maxInstructorScore: {
    type: Number,
    default: 50 // Maximum instructor score allowed
  },
  finalScore: {
    type: Number,
    default: 0 // totalScore + instructorScore (cannot exceed maxMarks + maxInstructorScore)
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'not-started'],
    default: 'not-started'
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      required: false // Make optional for simulations
    },
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'text', 'strategic-simulation', 'ranking'],
      default: 'multiple-choice'
    },
    // For ranking-based MCQs
    selectedRanking: [{
      text: String,
      rank: Number // Student's ranking
    }],
    correctRanking: [{
      text: String,
      rank: Number // Correct ranking
    }],
    rankingScore: {
      type: Number, // Percentage score based on ranking similarity (0-100)
      default: 0
    },
    // Points awarded for this answer
    points: {
      type: Number,
      default: 0 // Actual points earned (based on option selected or admin edit)
    },
    maxPoints: {
      type: Number,
      default: 10 // Maximum points possible for this question
    },
    // Student's instruction/explanation (mandatory per question)
    instruction: {
      type: String,
      required: true
    },
    instructionScore: {
      type: Number, // Score for the instruction/explanation (set by college admin)
      default: 0
    },
    selectedOption: {
      type: String, // Store the actual answer text, not just ObjectId
      required: false
    },
    selectedOptionImpact: {
      type: String, // Impact/explanation of the selected option (shown to students)
      default: ''
    },
    correctAnswer: {
      type: String, // Store the correct answer text
      required: false
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    reasoning: {
      type: String, // Student's reasoning for the answer
      default: ''
    },
    points: {
      type: Number, // Points awarded for this answer
      default: 0
    },
    options: [{
      text: String,
      isCorrect: Boolean,
      correctRank: Number,
      points: Number,
      impact: String
    }] // Store all options (with points & impact) for this question
  }],
  submittedAt: {
    type: Date
  },
  feedback: {
    type: String
  },
  // Simulation-specific fields
  simulationName: {
    type: String
  },
  simulationType: {
    type: String,
    enum: ['quiz', 'strategic-simulation'],
    default: 'quiz'
  },
  accuracy: {
    type: Number // Percentage accuracy for simulations
  },
  totalQuestions: {
    type: Number // Number of questions/decisions in simulation
  },
  // Enhanced fields for analytics
  college: {
    type: String,
    default: ''
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  simulation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation'
  },
  // Admin score editing
  scoreEdits: [{
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    oldScore: {
      type: Number,
      required: true
    },
    newScore: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    // Track per-question edits
    questionIndex: {
      type: Number
    },
    oldQuestionScore: {
      type: Number
    },
    newQuestionScore: {
      type: Number
    },
    editType: {
      type: String,
      enum: ['total', 'ranking', 'instruction'],
      default: 'total'
    }
  }]
}, {
  timestamps: true
});

const Score = mongoose.model('Score', scoreSchema);

export default Score;
