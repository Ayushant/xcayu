import Score from '../models/scoreModel.js';
import User from '../models/userModel.js';
import Quiz from '../models/quizModel.js';

// Simple version that gets scores without complex population
export const getAllScores = async (req, res) => {
  try {
    console.log('Fetching all scores...');
    
    // Get all scores
    const scores = await Score.find().sort({ submittedAt: -1 });
    console.log(`Found ${scores.length} scores in database`);
    
    // Get all users and quizzes separately to avoid population issues
    const users = await User.find({});
    const quizzes = await Quiz.find({});
    
    // Create lookup maps
    const userMap = {};
    const quizMap = {};
    
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    quizzes.forEach(quiz => {
      quizMap[quiz._id.toString()] = quiz;
    });
    
    // Format scores manually
    const formattedScores = scores.map(score => {
      const student = userMap[score.student?.toString()] || {};
      const quiz = quizMap[score.quiz?.toString()] || {};
      
      return {
        id: score._id,
        studentName: student.fullName || student.name || 'Unknown Student',
        studentEmail: student.email || 'No Email',
        totalScore: score.totalScore || 0,
        instructorScore: score.instructorScore || 0,
        status: score.status || 'pending',
        submittedAt: score.submittedAt,
        hasSubmissions: score.answers && score.answers.length > 0,
        quizTitle: quiz.title || 'Unnamed Quiz',
        feedback: score.feedback || '',
        totalQuestions: quiz.questions?.length || 0,
        correctAnswers: score.answers ? score.answers.filter(a => a.isCorrect).length : 0
      };
    });

    // Calculate simple statistics
    const totalStudents = new Set(scores.map(s => s.student?.toString())).size;
    const activeSessions = scores.filter(s => s.status === 'in-progress').length;
    const completedToday = scores.filter(s => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return s.status === 'completed' && s.submittedAt >= today;
    }).length;
    
    const completedScores = scores.filter(s => s.status === 'completed' && s.totalScore);
    const averageScore = completedScores.length > 0 
      ? (completedScores.reduce((sum, s) => sum + s.totalScore, 0) / completedScores.length).toFixed(1)
      : '0.0';

    const statistics = {
      totalStudents,
      activeSessions,
      completedSessions: completedToday,
      averageScore
    };

    console.log('Returning formatted scores:', {
      scoreCount: formattedScores.length,
      statistics
    });

    res.json({
      scores: formattedScores,
      statistics
    });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ 
      message: 'Error fetching scores',
      details: error.message,
      scores: [], // Return empty array as fallback
      statistics: {
        totalStudents: 0,
        activeSessions: 0,
        completedSessions: 0,
        averageScore: '0.0'
      }
    });
  }
};

// Get scores by quiz ID
export const getScoresByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const scores = await Score.find({ quiz: quizId });
    
    // Get users separately
    const userIds = scores.map(s => s.student);
    const users = await User.find({ _id: { $in: userIds }});
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    const formattedScores = scores.map(score => ({
      ...score.toObject(),
      studentName: userMap[score.student?.toString()]?.fullName || 'Unknown',
      studentEmail: userMap[score.student?.toString()]?.email || 'No Email'
    }));
    
    res.json(formattedScores);
  } catch (error) {
    console.error('Error fetching scores by quiz:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get scores by student ID
export const getScoresByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const scores = await Score.find({ student: studentId });
    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores by student:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update score
export const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructorScore, feedback } = req.body;
    
    const score = await Score.findByIdAndUpdate(
      id,
      { instructorScore, feedback },
      { new: true }
    );
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    res.json(score);
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit quiz and create score
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const studentId = req.user._id;

    // Calculate total score based on correct answers
    let totalScore = 0;
    if (answers && answers.length > 0) {
      answers.forEach(answer => {
        if (answer.isCorrect) {
          totalScore += 1;
        }
      });
      // Convert to percentage
      totalScore = (totalScore / answers.length) * 100;
    }

    const score = new Score({
      student: studentId,
      quiz: quizId,
      totalScore,
      answers,
      status: 'completed',
      submittedAt: new Date()
    });

    await score.save();
    res.status(201).json(score);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: error.message });
  }
};