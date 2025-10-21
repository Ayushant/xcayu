// simulationModel.js
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  title: String,
  score: Number,
  accuracy: Number,
  timeTaken: Number,
  isAutoSubmitted: { type: Boolean, default: false },
  orderedOptions: [{
    id: String,
    text: String,
    position: Number
  }],
  accuracyPerOption: mongoose.Schema.Types.Mixed
});

const simulationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  simulationName: { type: String, required: true },
  score: { type: Number, required: true },
  accuracy: Number,
  totalQuestions: Number,
  answers: [answerSchema],
  isCompleted: { type: Boolean, default: true },
  submittedAt: { type: Date, default: Date.now },
  // New fields for enhanced management
  college: {
    type: String,
    default: ''
  },
  degree: {
    type: String,
    enum: ['MBA', 'BE', 'BTech', 'Law', 'BBA', 'BCA', 'MCA', 'MSc', 'BSc', 'MTech', 'BA', 'MA', 'PhD', 'Other', ''],
    default: '',
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Template/Active status fields
  isTemplate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  description: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  },
  templateType: {
    type: String,
    default: 'Strategic Simulation'
  },
  // Login credentials for simulation access
  studentCredentials: {
    email: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    }
  },
  adminCredentials: {
    email: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

const Simulation = mongoose.model("Simulation", simulationSchema);
export default Simulation;
