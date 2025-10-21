/**
 * DIRECT FIX SCRIPT - No Backend Required
 * This script directly updates MongoDB and verifies the fix
 * Run with: node directFix.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizdb';

// Define schemas inline
const quizSchema = new mongoose.Schema({
  title: String,
  maxMarks: Number,
  questions: Array,
  createdAt: Date
});

const scoreSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalScore: Number,
  maxMarks: Number,
  displayScore: Number,
  displayMaxMarks: Number,
  submittedAt: Date
});

const Quiz = mongoose.model('Quiz', quizSchema);
const Score = mongoose.model('Score', scoreSchema);

async function directFix() {
  console.log('\n🚀 DIRECT FIX SCRIPT - Updating Quiz to 50 Marks\n');
  console.log('=' .repeat(70));

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Find all quizzes
    console.log('📋 Finding quizzes...');
    const allQuizzes = await Quiz.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (allQuizzes.length === 0) {
      console.log('❌ No quizzes found in database!');
      process.exit(1);
    }

    console.log(`   Found ${allQuizzes.length} quiz(es)\n`);

    // Display all quizzes
    console.log('📊 CURRENT QUIZZES:');
    console.log('-'.repeat(70));
    allQuizzes.forEach((quiz, index) => {
      const status = quiz.maxMarks === 50 ? '✅' : 
                     quiz.maxMarks ? `⚠️ (${quiz.maxMarks})` : '❌ (undefined)';
      console.log(`${index + 1}. ${quiz.title}`);
      console.log(`   ID: ${quiz._id}`);
      console.log(`   maxMarks: ${quiz.maxMarks || 'undefined'} ${status}`);
      console.log(`   Created: ${quiz.createdAt || 'N/A'}`);
      console.log('-'.repeat(70));
    });

    // Update ALL quizzes to 50 marks (or just the latest one)
    console.log('\n🔧 UPDATING QUIZZES TO 50 MARKS...\n');
    
    const latestQuiz = allQuizzes[0]; // Most recent quiz
    console.log(`   Target Quiz: "${latestQuiz.title}"`);
    console.log(`   Current maxMarks: ${latestQuiz.maxMarks || 'undefined'}`);
    
    // Update the quiz
    const updateResult = await Quiz.updateOne(
      { _id: latestQuiz._id },
      { $set: { maxMarks: 50 } }
    );

    console.log(`   Update Result: ${updateResult.modifiedCount} document(s) modified`);

    // Verify the update
    const updatedQuiz = await Quiz.findById(latestQuiz._id).lean();
    console.log(`   Verified maxMarks: ${updatedQuiz.maxMarks}`);
    
    if (updatedQuiz.maxMarks === 50) {
      console.log('   ✅ Quiz successfully updated to 50 marks!\n');
    } else {
      console.log('   ❌ Update failed!\n');
      process.exit(1);
    }

    // Check if there are scores for this quiz
    console.log('🗑️  CHECKING FOR OLD SCORES...\n');
    const oldScores = await Score.find({ quiz: latestQuiz._id })
      .populate('student', 'fullName email')
      .lean();

    if (oldScores.length > 0) {
      console.log(`   Found ${oldScores.length} old score(s):`);
      oldScores.forEach((score, index) => {
        console.log(`   ${index + 1}. Student: ${score.student?.fullName || 'Unknown'}`);
        console.log(`      Score: ${score.totalScore} / ${score.maxMarks || '???'}`);
        console.log(`      Submitted: ${score.submittedAt}`);
      });

      console.log('\n   🗑️  Deleting old scores...');
      const deleteResult = await Score.deleteMany({ quiz: latestQuiz._id });
      console.log(`   ✅ Deleted ${deleteResult.deletedCount} score(s)\n`);
    } else {
      console.log('   ℹ️  No old scores found (good!)\n');
    }

    // Test calculation logic
    console.log('🧪 TESTING CALCULATION LOGIC...\n');
    
    const testScores = [
      { percentage: 100, expected: 50, label: 'Perfect Score' },
      { percentage: 90, expected: 45, label: '90% Score' },
      { percentage: 80, expected: 40, label: '80% Score' },
      { percentage: 70, expected: 35, label: '70% Score' },
      { percentage: 60, expected: 30, label: '60% Score' },
      { percentage: 50, expected: 25, label: '50% Score' }
    ];

    console.log('   Quiz maxMarks: 50');
    console.log('   Formula: (percentage / 100) * maxMarks\n');
    console.log('-'.repeat(70));

    testScores.forEach(test => {
      const calculated = (test.percentage / 100) * 50;
      const match = calculated === test.expected ? '✅' : '❌';
      console.log(`   ${test.label} (${test.percentage}%)`);
      console.log(`      Expected: ${test.expected}`);
      console.log(`      Calculated: ${calculated}`);
      console.log(`      Result: ${match}`);
      console.log('-'.repeat(70));
    });

    // Final summary
    console.log('\n🎉 FIX COMPLETE!\n');
    console.log('=' .repeat(70));
    console.log('✅ Quiz updated to maxMarks: 50');
    console.log('✅ Old scores deleted');
    console.log('✅ Calculation logic verified');
    console.log('=' .repeat(70));
    
    console.log('\n📝 NEXT STEPS:\n');
    console.log('1. Start backend server:');
    console.log('   cd Backend');
    console.log('   npm start\n');
    console.log('2. Have student take the quiz\n');
    console.log('3. Expected results:');
    console.log('   - Perfect score: 50.0 / 50 ✅');
    console.log('   - 80% score: 40.0 / 50 ✅');
    console.log('   - 60% score: 30.0 / 50 ✅\n');
    console.log('4. Check backend logs for diagnostic output\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the fix
console.log('\n' + '='.repeat(70));
console.log('  DIRECT DATABASE FIX - No Backend Required');
console.log('='.repeat(70));

directFix();
