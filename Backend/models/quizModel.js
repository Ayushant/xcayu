import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  // Multiple numbered points (read-only descriptions for students)
  points: [{
    text: String
  }],
  // Maximum marks for this question (set by super admin)
  maxMarks: {
    type: Number,
    default: 10
  },
  // Ranking-based MCQ options
  options: [{
    text: String,
    correctRank: Number, // 1 = highest priority, 2 = second, etc.
    points: Number, // Points/marks for selecting this option (shown to students)
    isCorrect: Boolean, // Whether this is the correct answer
    impact: String // Explanation of what selecting this option means (shown to students after submission)
  }],
  // Instruction text for the question
  instructionRequired: {
    type: Boolean,
    default: true
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // Preface (front panel) shown before quiz starts
  preface: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Archived'],
    default: 'Active'
  },
  questions: [questionSchema],
  // Maximum total marks for this quiz (set by super admin)
  maxMarks: {
    type: Number,
    default: 100
  },
  // Course restriction - quiz belongs to specific course
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  simulationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  college: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  passingScore: {
    type: Number,
    default: 60
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
