// licenseModel.js
import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema({
  college: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  maxStudents: {
    type: Number,
    required: true
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Suspended'],
    default: 'Active'
  },
  // Courses available for this license
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  assignedSimulations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Simulation'
  }],
  assignedQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  department: {
    type: String,
    default: ''
  },
  contactPerson: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  // Prevent automatic index creation that might conflict
  autoIndex: false,
  timestamps: true
});

// Manually create only the email unique index
licenseSchema.index({ email: 1 }, { unique: true });

const License = mongoose.model("License", licenseSchema);
export default License;
