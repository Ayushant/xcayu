import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const findStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
    console.log('Connected\n');

    // Find Karan
    const karan = await User.findOne({ email: /khandu@gmail.com/i });
    console.log('Karan:', karan ? {
      name: karan.fullName,
      email: karan.email,
      college: karan.college,
      role: karan.role
    } : 'NOT FOUND');

    // Find Omkar
    const omkar = await User.findOne({ email: /om1@gmail.com/i });
    console.log('Omkar:', omkar ? {
      name: omkar.fullName,
      email: omkar.email,
      college: omkar.college,
      role: omkar.role
    } : 'NOT FOUND');

    // Find all GTU students
    console.log('\n=== GTU College Students ===');
    const gtuStudents = await User.find({ college: 'gtu', role: 'student' });
    console.log(`Found ${gtuStudents.length} students in GTU college:`);
    gtuStudents.forEach(s => console.log(`- ${s.fullName} (${s.email})`));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

findStudents();

