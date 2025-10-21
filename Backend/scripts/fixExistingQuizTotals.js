/**
 * Fix Existing Quiz Total Marks
 * 
 * This script updates all existing quiz score records in the database
 * to use the correct total marks calculation: questions.length × 10
 * 
 * Run this AFTER deploying the code fixes to update historical data.
 */

import Score from '../models/scoreModel.js';
import Quiz from '../models/quizModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixExistingQuizTotals = async () => {
  try {
    console.log('🔄 Starting quiz total marks fix...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all scores with quiz data
    const scores = await Score.find({}).populate('quiz');
    console.log(`📊 Found ${scores.length} score records to check\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const score of scores) {
      try {
        if (!score.quiz || !score.quiz.questions) {
          console.log(`⚠️  Skipping score ${score._id}: Missing quiz or questions`);
          skipped++;
          continue;
        }

        // Calculate correct total: questions × 10
        const questionsCount = score.quiz.questions.length;
        const correctTotal = questionsCount * 10;

        // Only update if different
        if (score.maxMarks !== correctTotal) {
          const oldMaxMarks = score.maxMarks;
          
          // Update maxMarks
          score.maxMarks = correctTotal;
          
          // Recalculate percentage
          if (correctTotal > 0 && score.totalScore) {
            const newPercentage = ((score.totalScore / correctTotal) * 100);
            score.percentage = Math.round(newPercentage * 100) / 100;
          }
          
          await score.save();
          updated++;
          
          console.log(`✅ Updated score ${score._id}:`);
          console.log(`   Quiz: ${score.quiz.title}`);
          console.log(`   Questions: ${questionsCount}`);
          console.log(`   Old total: ${oldMaxMarks} → New total: ${correctTotal}`);
          console.log(`   Student score: ${score.totalScore}/${correctTotal} (${score.percentage}%)`);
          console.log('');
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`❌ Error processing score ${score._id}:`, err.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total records checked: ${scores.length}`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped (already correct): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));
    console.log('\n✅ Migration complete!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
};

// Run the migration
fixExistingQuizTotals();
