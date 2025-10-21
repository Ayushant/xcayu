import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['student', 'admin', 'superadmin', 'collegeAdmin']
  },
  fullName: { type: String, required: true },
  college: { type: String },
  // Student's degree (for simulation access control)
  degree: { 
    type: String,
    enum: ['MBA', 'BE', 'BTech', 'Law', 'BBA', 'BCA', 'MCA', 'MSc', 'BSc', 'MTech', 'BA', 'MA', 'PhD', 'Other', ''],
    default: ''
  },
  // Student's selected course (for course-restricted quiz access)
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
export default User;
