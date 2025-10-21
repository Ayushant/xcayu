/**
 * Debug Script: Check Student Colleges
 * Shows which college each student belongs to
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Score from '../models/scoreModel.js';

dotenv.config();

const checkStudentColleges = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all students
    const students = await User.find({ role: 'student' })
      .select('fullName email college')
      .sort('college');

    console.log('📊 ALL STUDENTS:');
    console.log('='.repeat(80));
    students.forEach(student => {
      console.log(`Name: ${student.fullName}`);
      console.log(`Email: ${student.email}`);
      console.log(`College: ${student.college || '(NO COLLEGE)'}`);
      console.log('-'.repeat(80));
    });

    // Get all admins
    console.log('\n👥 ALL ADMINS:');
    console.log('='.repeat(80));
    const admins = await User.find({ role: { $in: ['admin', 'collegeAdmin', 'superadmin'] } })
      .select('fullName email role college')
      .sort('role');

    admins.forEach(admin => {
      console.log(`Name: ${admin.fullName}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`College: ${admin.college || '(NO COLLEGE)'}`);
      console.log('-'.repeat(80));
    });

    // Check scores
    console.log('\n📝 ALL SCORES WITH STUDENT INFO:');
    console.log('='.repeat(80));
    const scores = await Score.find({})
      .populate('student', 'fullName email college')
      .populate('quiz', 'title')
      .select('student quiz totalScore submittedAt college')
      .sort('-submittedAt');

    scores.forEach(score => {
      console.log(`Student: ${score.student?.fullName} (${score.student?.email})`);
      console.log(`Student College: ${score.student?.college || '(NO COLLEGE)'}`);
      console.log(`Score College Field: ${score.college || '(NO COLLEGE)'}`);
      console.log(`Quiz: ${score.quiz?.title || 'N/A'}`);
      console.log(`Score: ${score.totalScore}%`);
      console.log(`Submitted: ${score.submittedAt}`);
      console.log('-'.repeat(80));
    });

    // Group by college
    console.log('\n🏫 STUDENTS BY COLLEGE:');
    console.log('='.repeat(80));
    const collegeGroups = {};
    students.forEach(student => {
      const college = student.college || 'NO_COLLEGE';
      if (!collegeGroups[college]) {
        collegeGroups[college] = [];
      }
      collegeGroups[college].push(student);
    });

    Object.keys(collegeGroups).sort().forEach(college => {
      console.log(`\n📍 College: ${college}`);
      console.log(`   Student Count: ${collegeGroups[college].length}`);
      collegeGroups[college].forEach(student => {
        console.log(`   - ${student.fullName} (${student.email})`);
      });
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

checkStudentColleges();

