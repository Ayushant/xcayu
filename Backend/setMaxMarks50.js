import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({}, { strict: false });
const Quiz = mongoose.model('Quiz', quizSchema);

mongoose.connect('mongodb://localhost:27017/quizdb')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find the quiz
    const quiz = await Quiz.findOne({ title: /dfdrt/i });
    
    if (!quiz) {
      console.log('❌ Quiz not found');
      process.exit(0);
    }
    
    console.log('📝 UPDATING QUIZ MAXMARKS:');
    console.log('======================');
    console.log('Title:', quiz.title);
    console.log('Current maxMarks:', quiz.maxMarks);
    console.log('Setting to: 50');
    console.log('');
    
    // Update maxMarks
    quiz.maxMarks = 50;
    await quiz.save();
    
    console.log('✅ Quiz updated!\n');
    console.log('Now when students submit:');
    console.log('- Dashboard will show: "X / 50"');
    console.log('- Results will show: "X / 50"');
    console.log('- Admin dashboard will show: "X / 50"\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
