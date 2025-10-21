// IMMEDIATE FIX: Update Quiz to 50 Marks and Test
// Run with: node quickFix50Marks.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizdb';

async function quickFix() {
  try {
    console.log('🚀 QUICK FIX: Setting Quiz to 50 Marks\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Quiz = mongoose.model('Quiz');
    const Score = mongoose.model('Score');

    // Find the most recent quiz
    const latestQuiz = await Quiz.findOne().sort({ createdAt: -1 });
    
    if (!latestQuiz) {
      console.log('❌ No quiz found!');
      process.exit(1);
    }

    console.log('📋 Found Quiz:');
    console.log(`   Title: ${latestQuiz.title}`);
    console.log(`   Current maxMarks: ${latestQuiz.maxMarks || 'undefined'}`);
    console.log(`   ID: ${latestQuiz._id}\n`);

    // Update to 50 marks
    console.log('🔧 Updating maxMarks to 50...');
    await Quiz.updateOne(
      { _id: latestQuiz._id },
      { $set: { maxMarks: 50 } }
    );

    const updated = await Quiz.findById(latestQuiz._id);
    console.log(`✅ Updated! New maxMarks: ${updated.maxMarks}\n`);

    // Delete old scores
    console.log('🗑️  Deleting old scores...');
    const result = await Score.deleteMany({ quiz: latestQuiz._id });
    console.log(`✅ Deleted ${result.deletedCount} old score(s)\n`);

    console.log('🎉 FIX COMPLETE!');
    console.log('\n📝 Next Steps:');
    console.log('1. Restart backend server (npm start)');
    console.log('2. Student takes quiz');
    console.log('3. Should show "X.X / 50" ✅');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

quickFix();
