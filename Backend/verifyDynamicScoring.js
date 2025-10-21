import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({}, { strict: false });
const Quiz = mongoose.model('Quiz', quizSchema);

const scoreSchema = new mongoose.Schema({}, { strict: false });
const Score = mongoose.model('Score', scoreSchema);

mongoose.connect('mongodb://localhost:27017/quizdb')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find the quiz
    const quiz = await Quiz.findOne({ title: /dfdrt/i });
    
    if (!quiz) {
      console.log('❌ Quiz not found');
      process.exit(0);
    }
    
    console.log('📝 QUIZ IN DATABASE:');
    console.log('======================');
    console.log('Title:', quiz.title);
    console.log('MaxMarks (Super Admin Set):', quiz.maxMarks);
    console.log('Questions:', quiz.questions?.length || 0);
    console.log('\n');
    
    // Find scores for this quiz
    const scores = await Score.find({ quiz: quiz._id });
    
    console.log(`📊 SCORES FOR THIS QUIZ: ${scores.length} found\n`);
    
    if (scores.length === 0) {
      console.log('⚠️  No scores yet. Student needs to take the quiz first.\n');
    } else {
      console.log('SCORES:');
      console.log('======================');
      scores.forEach((score, i) => {
        console.log(`\nScore ${i + 1}:`);
        console.log('  totalScore:', score.totalScore);
        console.log('  maxMarks:', score.maxMarks);
        console.log('  displayScore:', score.displayScore);
        console.log('  displayMaxMarks:', score.displayMaxMarks);
        console.log('  Status:', score.status);
        console.log('  What student sees: ' + (score.displayScore || score.totalScore) + ' / ' + (score.displayMaxMarks || score.maxMarks));
      });
    }
    
    console.log('\n\n✅ VERIFICATION:');
    console.log('======================');
    
    if (!quiz.maxMarks) {
      console.log('❌ PROBLEM: Quiz has no maxMarks!');
    } else {
      console.log('✅ Quiz maxMarks = ' + quiz.maxMarks);
    }
    
    if (scores.length > 0) {
      const score = scores[0];
      if (score.maxMarks === quiz.maxMarks) {
        console.log('✅ Score maxMarks matches quiz maxMarks (' + score.maxMarks + ')');
      } else {
        console.log('❌ Score maxMarks (' + score.maxMarks + ') != quiz maxMarks (' + quiz.maxMarks + ')');
      }
    }
    
    console.log('\n\n🔄 NEXT STEPS:');
    console.log('======================');
    console.log('1. If no scores: Student takes quiz and submits');
    console.log('2. Check dashboard: Should show "X / ' + quiz.maxMarks + '"');
    console.log('3. Check results: Should show "X / ' + quiz.maxMarks + '"');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
