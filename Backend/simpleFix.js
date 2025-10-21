// SIMPLEST FIX POSSIBLE - Just copy MongoDB connection string and run
import mongoose from 'mongoose';

// PASTE YOUR MONGODB CONNECTION STRING HERE:
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizdb';

async function quickFix() {
  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI);
    
    const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }));
    const Score = mongoose.model('Score', new mongoose.Schema({}, { strict: false }));
    
    // Get latest quiz
    const quiz = await Quiz.findOne().sort({ createdAt: -1 });
    console.log(`Quiz: ${quiz.title}`);
    console.log(`Current maxMarks: ${quiz.maxMarks}`);
    
    // Update to 50
    await Quiz.updateOne({ _id: quiz._id }, { $set: { maxMarks: 50 } });
    console.log('✅ Updated to 50');
    
    // Delete old scores
    const deleted = await Score.deleteMany({ quiz: quiz._id });
    console.log(`✅ Deleted ${deleted.deletedCount} old scores`);
    
    // Verify
    const updated = await Quiz.findById(quiz._id);
    console.log(`\nFinal maxMarks: ${updated.maxMarks}`);
    console.log(updated.maxMarks === 50 ? '✅ SUCCESS!' : '❌ FAILED');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

quickFix();
