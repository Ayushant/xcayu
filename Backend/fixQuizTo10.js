import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({}, { strict: false });
const Quiz = mongoose.model('Quiz', quizSchema);

const scoreSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const Score = mongoose.model('Score', scoreSchema);

mongoose.connect('mongodb://localhost:27017/quizdb')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    // Find quiz with "dfdrt" in title
    const quiz = await Quiz.findOne({ title: /dfdrt/i });
    if (quiz) {
      console.log('📝 CURRENT QUIZ DETAILS:');
      console.log('Title:', quiz.title);
      console.log('MaxMarks:', quiz.maxMarks);
      console.log('\n');
      // Update to 10
      quiz.maxMarks = 10;
      await quiz.save();
      console.log('✅ Quiz updated to maxMarks: 10!\n');
      // Delete old scores
      const deletedScores = await Score.deleteMany({ quiz: quiz._id });
      console.log(`🗑️  Deleted ${deletedScores.deletedCount} old score(s)`);
      console.log('✅ DONE! Students need to retake the quiz to see correct score.\n');
    } else {
      console.log('❌ Quiz not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
