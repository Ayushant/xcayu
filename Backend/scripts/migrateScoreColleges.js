/**
 * Migration Script: Populate College Field in Scores
 * 
 * This script populates the college field in all existing scores
 * by getting the college information from the associated student.
 * 
 * Usage: node Backend/scripts/migrateScoreColleges.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Score from '../models/scoreModel.js';
import User from '../models/userModel.js';

// Load environment variables
dotenv.config();

const migrateScoreColleges = async () => {
  try {
    console.log('🔄 Starting college field migration for scores...\n');

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all scores without college field or with empty college
    const scoresWithoutCollege = await Score.find({
      $or: [
        { college: { $exists: false } },
        { college: '' },
        { college: null }
      ]
    }).populate('student', 'college fullName email');

    console.log(`📊 Found ${scoresWithoutCollege.length} scores without college field\n`);

    if (scoresWithoutCollege.length === 0) {
      console.log('✅ All scores already have college field populated!');
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Update each score with the student's college
    for (const score of scoresWithoutCollege) {
      try {
        if (!score.student) {
          console.warn(`⚠️  Score ${score._id} has no associated student - SKIPPED`);
          skippedCount++;
          continue;
        }

        const studentCollege = score.student.college;
        
        if (!studentCollege) {
          console.warn(`⚠️  Student ${score.student.fullName} (${score.student.email}) has no college - SKIPPED`);
          skippedCount++;
          continue;
        }

        // Update the score with the college
        await Score.updateOne(
          { _id: score._id },
          { $set: { college: studentCollege } }
        );

        successCount++;
        console.log(`✅ Updated score ${score._id} - Student: ${score.student.fullName}, College: ${studentCollege}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating score ${score._id}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} scores`);
    console.log(`⚠️  Skipped: ${skippedCount} scores (no student/college)`);
    console.log(`❌ Errors: ${errorCount} scores`);
    console.log('='.repeat(60) + '\n');

    // Verify the migration
    const remainingWithoutCollege = await Score.countDocuments({
      $or: [
        { college: { $exists: false } },
        { college: '' },
        { college: null }
      ]
    });

    console.log(`📊 Remaining scores without college: ${remainingWithoutCollege}`);

    if (remainingWithoutCollege === 0) {
      console.log('\n🎉 Migration completed successfully! All scores have college field populated.');
    } else {
      console.log(`\n⚠️  Migration completed with ${remainingWithoutCollege} scores still without college field.`);
      console.log('These scores may have missing student data and require manual review.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the migration
migrateScoreColleges();

