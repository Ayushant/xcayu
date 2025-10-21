import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const Score = mongoose.model('Score', scoreSchema);

const quizSchema = new mongoose.Schema({}, { strict: false });
const Quiz = mongoose.model('Quiz', quizSchema);

mongoose.connect('mongodb://localhost:27017/quizdb')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find quiz
    const quiz = await Quiz.findOne({ title: /dfdrt/i });
    if (!quiz) {
      console.log('❌ Quiz not found');
      process.exit(0);
    }
    
    console.log('📝 QUIZ INFO:');
    console.log('Title:', quiz.title);
    console.log('MaxMarks:', quiz.maxMarks);
    console.log('\n');
    
    // Find all scores for this quiz
    const scores = await Score.find({ quiz: quiz._id });
    console.log(`📊 Found ${scores.length} score(s) for this quiz\n`);
    
    // Update all scores to use quiz's maxMarks
    if (scores.length > 0) {
      scores.forEach((score, i) => {
        console.log(`Score ${i + 1}:`);
        console.log('  Before: maxMarks =', score.maxMarks, ', totalScore =', score.totalScore);
      });
      
      console.log('\n🔄 UPDATING ALL SCORES...\n');
      
      // Update each score
      for (let score of scores) {
        score.maxMarks = quiz.maxMarks;  // Set to quiz's maxMarks (50)
        await score.save();
        console.log(`✅ Updated score: totalScore=${score.totalScore}, maxMarks=${score.maxMarks}`);
      }
      
      console.log('\n✅ ALL SCORES UPDATED TO maxMarks: ' + quiz.maxMarks);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
