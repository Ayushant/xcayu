import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({}, { strict: false });
const Quiz = mongoose.model('Quiz', quizSchema);

const scoreSchema = new mongoose.Schema({}, { strict: false });
const Score = mongoose.model('Score', scoreSchema);

mongoose.connect('mongodb://localhost:27017/quizdb')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find quiz with "dfdrt" in title
    const quiz = await Quiz.findOne({ title: /dfdrt/i });
    
    if (quiz) {
      console.log('📝 QUIZ DETAILS:');
      console.log('Title:', quiz.title);
      console.log('MaxMarks:', quiz.maxMarks);
      console.log('Questions:', quiz.questions?.length);
      console.log('\n');
      
      // Find scores for this quiz
      const scores = await Score.find({ quiz: quiz._id })
        .populate('student', 'username')
        .populate('quiz', 'title maxMarks');
      
      console.log('📊 SCORES FOR THIS QUIZ:');
      scores.forEach((score, i) => {
        console.log(`\nScore ${i + 1}:`);
        console.log('  Student:', score.student?.username);
        console.log('  Total Score:', score.totalScore);
        console.log('  Max Marks (score):', score.maxMarks);
        console.log('  Display Max Marks:', score.displayMaxMarks);
        console.log('  Quiz MaxMarks:', score.quiz?.maxMarks);
      });
    } else {
      console.log('❌ Quiz not found with title containing "dfdrt"');
      
      // List all quizzes
      const allQuizzes = await Quiz.find({}).select('title maxMarks');
      console.log('\n📚 ALL QUIZZES:');
      allQuizzes.forEach(q => {
        console.log(`  - ${q.title} (maxMarks: ${q.maxMarks})`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
