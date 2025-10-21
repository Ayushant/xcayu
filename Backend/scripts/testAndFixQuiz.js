// TEST AND FIX SCRIPT FOR 50 MARKS QUIZ
// Run this with: node testAndFixQuiz.js

import mongoose from 'mongoose';
import Quiz from '../models/quizModel.js';
import Score from '../models/scoreModel.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizdb';

async function testAndFixQuiz() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // STEP 1: Find all quizzes and show their maxMarks
    console.log('📋 STEP 1: Checking all quizzes...');
    const allQuizzes = await Quiz.find({}, { title: 1, maxMarks: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(10);
    
    console.log('\n📊 Recent Quizzes:');
    console.log('─'.repeat(80));
    allQuizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title}`);
      console.log(`   ID: ${quiz._id}`);
      console.log(`   maxMarks: ${quiz.maxMarks || 'UNDEFINED ⚠️'}`);
      console.log(`   Created: ${quiz.createdAt}`);
      console.log('─'.repeat(80));
    });

    // STEP 2: Find quizzes without maxMarks or with wrong maxMarks
    console.log('\n🔍 STEP 2: Finding quizzes that need fixing...');
    const quizzesNeedingFix = await Quiz.find({
      $or: [
        { maxMarks: { $exists: false } },
        { maxMarks: null },
        { maxMarks: { $ne: 50 } } // Find quizzes that should be 50 but aren't
      ]
    });

    if (quizzesNeedingFix.length === 0) {
      console.log('✅ All quizzes have maxMarks set correctly!');
    } else {
      console.log(`⚠️  Found ${quizzesNeedingFix.length} quiz(es) that may need fixing:\n`);
      quizzesNeedingFix.forEach((quiz, index) => {
        console.log(`${index + 1}. ${quiz.title}`);
        console.log(`   Current maxMarks: ${quiz.maxMarks || 'undefined'}`);
        console.log(`   Quiz ID: ${quiz._id}\n`);
      });
    }

    // STEP 3: Interactive fix - Update quiz to have maxMarks: 50
    console.log('\n🔧 STEP 3: Fix Options');
    console.log('─'.repeat(80));
    console.log('To fix a specific quiz, uncomment and modify the code below:');
    console.log('\n// EXAMPLE FIX CODE:');
    console.log('/*');
    console.log('const quizIdToFix = "YOUR_QUIZ_ID_HERE"; // Replace with actual ID');
    console.log('const newMaxMarks = 50; // Set your desired total');
    console.log('');
    console.log('await Quiz.updateOne(');
    console.log('  { _id: quizIdToFix },');
    console.log('  { $set: { maxMarks: newMaxMarks } }');
    console.log(');');
    console.log('console.log(`✅ Updated quiz to have maxMarks: ${newMaxMarks}`);');
    console.log('*/');

    // UNCOMMENT BELOW TO AUTO-FIX LATEST QUIZ
    /*
    if (allQuizzes.length > 0) {
      const latestQuiz = allQuizzes[0];
      console.log(`\n🔧 Auto-fixing latest quiz: "${latestQuiz.title}"`);
      
      await Quiz.updateOne(
        { _id: latestQuiz._id },
        { $set: { maxMarks: 50 } }
      );
      
      const updated = await Quiz.findById(latestQuiz._id);
      console.log(`✅ Updated! New maxMarks: ${updated.maxMarks}`);
      
      // Also delete old scores for this quiz so students can retake
      const deletedScores = await Score.deleteMany({ quiz: latestQuiz._id });
      console.log(`🗑️  Deleted ${deletedScores.deletedCount} old score(s)`);
      console.log('📝 Students can now retake the quiz with correct total marks');
    }
    */

    // STEP 4: Check scores for a specific quiz
    console.log('\n📊 STEP 4: Checking scores...');
    if (allQuizzes.length > 0) {
      const latestQuiz = allQuizzes[0];
      const scores = await Score.find({ quiz: latestQuiz._id })
        .populate('student', 'fullName email')
        .limit(5);
      
      if (scores.length > 0) {
        console.log(`\n📈 Scores for "${latestQuiz.title}":`);
        console.log('─'.repeat(80));
        scores.forEach((score, index) => {
          console.log(`${index + 1}. ${score.student?.fullName || 'Unknown'}`);
          console.log(`   Score: ${score.totalScore} / ${score.maxMarks || latestQuiz.maxMarks || '???'}`);
          console.log(`   Submitted: ${score.submittedAt}`);
          console.log('─'.repeat(80));
        });
      } else {
        console.log('ℹ️  No scores found for latest quiz');
      }
    }

    console.log('\n✅ Diagnostic complete!');
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Identify which quiz needs maxMarks = 50');
    console.log('2. Uncomment the auto-fix code above and run again');
    console.log('3. OR manually update via MongoDB:');
    console.log('   db.quizzes.updateOne({ _id: ObjectId("QUIZ_ID") }, { $set: { maxMarks: 50 } })');
    console.log('4. Delete old scores for that quiz');
    console.log('5. Have students retake the quiz');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAndFixQuiz();
