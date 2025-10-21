import mongoose from 'mongoose';

/**
 * Quiz Progress Model
 * 
 * Tracks student progress for each quiz:
 * - Current question index
 * - Answered questions and answers
 * - Start and access times
 * - Session status
 * 
 * Allows students to resume from where they left off
 */

const quizProgressSchema = new mongoose.Schema({
  // References
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },

  // Progress tracking
  currentQuestion: {
    type: Number,
    default: 0 // 0-indexed
  },
  totalQuestions: {
    type: Number,
    required: true
  },

  // Answered questions storage
  answeredQuestions: [{
    questionIndex: {
      type: Number,
      required: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    selectedRanking: [{
      text: String,
      rank: Number
    }],
    selectedOption: String,
    instruction: String,
    reasoning: String,
    answeredAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Session tracking
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'abandoned', 'completed'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },

  // Metadata
  college: {
    type: String
  },
  sessionId: {
    type: String, // Unique identifier for this session
    unique: true,
    sparse: true
  },

  // For preventing duplicate submissions
  submitted: {
    type: Boolean,
    default: false
  },
  submittedScoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Score'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate progress entries
quizProgressSchema.index({ student: 1, quiz: 1, status: 1 });
quizProgressSchema.index({ student: 1, quiz: 1, submitted: 1 });

// Auto-update lastAccessedAt when document is updated
quizProgressSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date();
  next();
});

const QuizProgress = mongoose.model('QuizProgress', quizProgressSchema);

export default QuizProgress;
