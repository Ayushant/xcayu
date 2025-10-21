import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const Score = mongoose.model('Score', scoreSchema);

const quizSchema = new mongoose.Schema({}, { strict: false });
const Quiz = mongoose.model('Quiz', quizSchema);

mongoose.connect('mongodb://localhost:27017/quizdb')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find ALL scores
    const allScores = await Score.find({});
    console.log(`📊 TOTAL SCORES IN DATABASE: ${allScores.length}\n`);
    
    // Get all quizzes
    const allQuizzes = await Quiz.find({});
    console.log(`📚 TOTAL QUIZZES IN DATABASE: ${allQuizzes.length}\n`);
    
    // Show each score
    for (let score of allScores) {
      const quiz = await Quiz.findById(score.quiz);
      console.log(`Score: totalScore=${score.totalScore}, maxMarks=${score.maxMarks}`);
      console.log(`  Quiz: ${quiz?.title} (maxMarks=${quiz?.maxMarks})`);
    }
    
    console.log('\n✅ Done');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
