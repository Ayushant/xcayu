import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
  
  const students = await User.find({ role: 'student' });
  console.log(`\nTotal students: ${students.length}\n`);
  
  students.forEach(s => {
    console.log(`${s.fullName} | ${s.email} | College: ${s.college || 'NONE'}`);
  });
  
  await mongoose.disconnect();
  process.exit(0);
})();

