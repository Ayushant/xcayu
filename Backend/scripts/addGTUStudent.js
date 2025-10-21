import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
  console.log('Connected to database\n');

  // Create a test student for GTU college
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const gtuStudent = new User({
    fullName: 'Test GTU Student',
    email: 'student@gtu.edu',
    password: hashedPassword,
    role: 'student',
    college: 'gtu'
  });

  await gtuStudent.save();
  console.log('✅ Created test student for GTU college:');
  console.log(`   Name: ${gtuStudent.fullName}`);
  console.log(`   Email: ${gtuStudent.email}`);
  console.log(`   College: ${gtuStudent.college}`);
  console.log(`   Password: password123`);

  await mongoose.disconnect();
  console.log('\n✅ Done!');
  process.exit(0);
})();

