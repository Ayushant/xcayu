import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  degree: {
    type: String,
    enum: ['MBA', 'BE', 'BTech', 'Law', 'BBA', 'BCA', 'MCA', 'MSc', 'BSc', 'MTech', 'BA', 'MA', 'PhD', 'Other', ''],
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: String, // e.g., "1 Semester", "2 Semesters"
    default: '1 Semester'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;

