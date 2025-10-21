// Script to update all scores so their maxMarks matches the Super Admin's quiz.maxMarks
// Usage: node Backend/scripts/fixScoreMaxMarks.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Score from '../models/scoreModel.js';
import Quiz from '../models/quizModel.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/xaction';

async function fixScoreMaxMarks() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const scores = await Score.find({});
  let updated = 0;

  for (const score of scores) {
    if (score.quiz) {
      const quiz = await Quiz.findById(score.quiz);
      if (quiz && typeof quiz.maxMarks === 'number') {
        if (score.maxMarks !== quiz.maxMarks) {
          score.maxMarks = quiz.maxMarks;
          await score.save();
          updated++;
          console.log(`Updated score ${score._id}: maxMarks set to ${quiz.maxMarks}`);
        }
      }
    }
  }

  console.log(`Done. Updated ${updated} scores.`);
  await mongoose.disconnect();
}

fixScoreMaxMarks().catch(err => {
  console.error('Error updating scores:', err);
  process.exit(1);
});
