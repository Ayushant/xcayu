import mongoose from 'mongoose';
import Score from '../models/scoreModel.js';
import User from '../models/userModel.js';
import Quiz from '../models/quizModel.js';
import Simulation from '../models/simulationModel.js';

// Simple version that gets scores without complex population
export const getAllScores = async (req, res) => {
  try {
    console.log('==== FETCHING ALL SCORES ====');
    console.log('User Role:', req.user?.role);
    console.log('User College:', req.user?.college);
    console.log('User ID:', req.user?._id);
    
    // Get admin's college for filtering (only for admin users, not superadmin)
    let scoreFilter = {};
    if (req.user && (req.user.role === 'admin' || req.user.role === 'collegeAdmin') && req.user.college) {
      // For admin users, only show scores from their college
      const collegeStudents = await User.find({ 
        role: 'student', 
        college: req.user.college 
      }, '_id');
      
      const studentIds = collegeStudents.map(student => student._id);
      scoreFilter = { student: { $in: studentIds } };
      
      console.log(`✅ Filtering scores for ${req.user.role} college: ${req.user.college}, found ${studentIds.length} students`);
    } else if (req.user && req.user.role === 'superadmin') {
      console.log('⚠️ SuperAdmin detected - showing ALL scores from all colleges');
    } else {
      console.log('⚠️ No filtering applied - user role or college missing');
    }
    
    // Get scores with filter applied
  const scores = await Score.find(scoreFilter).sort({ submittedAt: -1 });
    console.log(`Found ${scores.length} scores in database`);
    
    // Get all users and quizzes separately to avoid population issues
    const users = await User.find({});
  const quizzes = await Quiz.find({}).select('title maxMarks questions');
    
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
      
      // ✅ FIX: Calculate correct maxMarks = Number of questions × 10
      const quizMaxMarks = (quiz.questions?.length || 0) * 10 || score.maxMarks || 100;
      
      // Round score to nearest whole number for display
      const roundedScore = Math.round(score.totalScore || 0);
      return {
        _id: score._id, // MongoDB ID for fetching details
        id: score._id,  // Alias for compatibility
        student: {
          _id: score.student,
          fullName: student.fullName || student.name || 'Unknown Student',
          email: student.email || 'No Email'
        },
        quiz: {
          _id: score.quiz,
          title: score.simulationName || quiz.title || 'Unnamed Quiz',
          maxMarks: quizMaxMarks
        },
        studentName: student.fullName || student.name || 'Unknown Student',
        studentEmail: student.email || 'No Email',
        totalScore: roundedScore,
        instructorScore: score.instructorScore || 0,
        status: score.status || 'pending',
        submittedAt: score.submittedAt,
        hasSubmissions: (score.answers && score.answers.length > 0) || !!score.simulationName,
        quizTitle: score.simulationName || quiz.title || 'Unnamed Quiz',
        feedback: score.feedback || '',
        totalQuestions: score.totalQuestions || quiz.questions?.length || 0,
        correctAnswers: score.answers ? score.answers.filter(a => a.isCorrect).length : 0,
        simulationType: score.simulationType || 'quiz',
        accuracy: score.accuracy || null,
        answers: score.answers || [],
        // Add display fields for consistent UI (Super Admin controlled)
        maxMarks: quizMaxMarks,
        displayScore: roundedScore,
        displayMaxMarks: quizMaxMarks
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

// Get only real student submissions (filters out test data)
export const getRealStudentScores = async (req, res) => {
  try {
    console.log('Fetching real student scores only...');
    
    // Get admin's college for filtering (only for admin users)
    let scoreFilter = {};
    if (req.user && req.user.role === 'admin' && req.user.college) {
      const collegeStudents = await User.find({ 
        role: 'student', 
        college: req.user.college 
      }, '_id');
      
      const studentIds = collegeStudents.map(student => student._id);
      scoreFilter = { student: { $in: studentIds } };
      
      console.log(`Filtering scores for admin college: ${req.user.college}, found ${studentIds.length} students`);
    }
    
    // Get scores with filter applied
    const scores = await Score.find(scoreFilter).sort({ submittedAt: -1 });
    console.log(`Found ${scores.length} total scores in database`);
    
    // Get all users and quizzes
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
    
    // Filter for real submissions only (very lenient to catch all real students)
    const realScores = scores.filter(score => {
      const student = userMap[score.student?.toString()];
      
      // Basic requirements - must have student and be completed
      if (!student) return false;
      if (score.status !== 'completed') return false;
      
      // Must have actual submission data (answers for quiz or simulation name for simulations)
      if (!score.answers?.length && !score.simulationName) return false;
      
      // Only filter out very obvious test accounts (be very specific)
      const email = student.email || '';
      const name = student.fullName || '';
      
      // Only exclude accounts that are clearly automated test data
      if (email === 'n@gmail.com' && name === 'nn') {
        return false; // This is the obvious test account
      }
      
      // Include everything else - let admins see all student activity
      return true;
    });
    
    console.log(`Filtered to ${realScores.length} real student submissions`);
    
    // Format real scores
    const formattedScores = realScores.map(score => {
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
        hasSubmissions: (score.answers && score.answers.length > 0) || !!score.simulationName,
        quizTitle: score.simulationName || quiz.title || 'Unnamed Quiz',
        feedback: score.feedback || '',
        totalQuestions: score.totalQuestions || quiz.questions?.length || 0,
        correctAnswers: score.answers ? score.answers.filter(a => a.isCorrect).length : 0,
        simulationType: score.simulationType || 'quiz',
        accuracy: score.accuracy || null
      };
    });

    // Calculate statistics for real data only
    const totalStudents = new Set(realScores.map(s => s.student?.toString())).size;
    const activeSessions = 0; // Real data doesn't include in-progress
    const completedToday = realScores.filter(s => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return s.status === 'completed' && s.submittedAt >= today;
    }).length;
    
    const completedScores = realScores.filter(s => s.status === 'completed' && s.totalScore);
    const averageScore = completedScores.length > 0 
      ? (completedScores.reduce((sum, s) => sum + s.totalScore, 0) / completedScores.length).toFixed(1)
      : '0.0';

    const statistics = {
      totalStudents,
      activeSessions,
      completedSessions: completedToday,
      averageScore
    };

    console.log('Returning real student scores:', {
      scoreCount: formattedScores.length,
      statistics
    });

    res.json({
      scores: formattedScores,
      statistics
    });
  } catch (error) {
    console.error('Error fetching real student scores:', error);
    res.status(500).json({ 
      message: 'Error fetching real student scores',
      details: error.message,
      scores: [],
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
    // ✅ FIX: Calculate correct total marks = Number of questions × 10
    const scoresWithMax = scores.map(score => {
      const sObj = score.toObject();

      // Calculate quiz max marks: Number of questions × 10
      let quizMax = 100; // Default fallback
      
      if (Array.isArray(sObj.quiz?.questions) && sObj.quiz.questions.length > 0) {
        quizMax = sObj.quiz.questions.length * 10;
      } else if (Array.isArray(sObj.answers) && sObj.answers.length > 0) {
        // Fallback: use number of answers as question count
        quizMax = sObj.answers.length * 10;
      }

      // Compute a displayScore scaled to Super Admin's quizMax
      let displayScore = 0;
      const hasRanking = sObj.answers?.some(a => a.questionType === 'ranking' || typeof a.rankingScore === 'number');
      if (hasRanking) {
        // totalScore is percentage (0-100). Scale to quizMax
        const pct = Math.max(0, Math.min(100, Number(sObj.totalScore || 0)));
        displayScore = (pct / 100) * quizMax;
      } else {
        // MCQ-style: totalScore is raw points; estimate max raw then scale to quizMax
        const rawMax = sObj.totalQuestions || (Array.isArray(sObj.answers) ? sObj.answers.length : 0);
        if (rawMax > 0) {
          const pct = Math.max(0, Math.min(100, (Number(sObj.totalScore || 0) / rawMax) * 100));
          displayScore = (pct / 100) * quizMax;
        } else {
          // Fallback: if we can't determine, show as-is but cap at quizMax
          displayScore = Math.min(Number(sObj.totalScore || 0), quizMax);
        }
      }

      // Round to one decimal for consistent UI
      const roundedDisplay = Math.round(displayScore * 10) / 10;

      return {
        ...sObj,
        maxMarks: quizMax, // expose for denominator
        displayScore: roundedDisplay,
        displayMaxMarks: quizMax
      };
    });
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
    
    const score = await Score.findById(id);
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    // Validate instructor score doesn't exceed limit
    const maxInstructorScore = score.maxInstructorScore || 50;
    if (instructorScore !== null && instructorScore !== undefined) {
      if (instructorScore < 0) {
        return res.status(400).json({ message: 'Instructor score cannot be negative' });
      }
      if (instructorScore > maxInstructorScore) {
        return res.status(400).json({ 
          message: `Instructor score cannot exceed ${maxInstructorScore}. Please enter a value between 0 and ${maxInstructorScore}.` 
        });
      }
      score.instructorScore = instructorScore;
    }
    
    if (feedback !== undefined) {
      score.feedback = feedback;
    }
    
    // Calculate final score (totalScore + instructorScore)
    score.finalScore = score.totalScore + (score.instructorScore || 0);
    
    // Validate final score doesn't exceed max limit
    const maxFinalScore = (score.maxMarks || 100) + maxInstructorScore;
    if (score.finalScore > maxFinalScore) {
      return res.status(400).json({ 
        message: `Final score (${score.finalScore}) exceeds maximum allowed (${maxFinalScore})` 
      });
    }
    
    await score.save();
    
    res.json(score);
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get student's own scores
export const getMyScores = async (req, res) => {
  try {
    const studentId = req.user._id;
    const scores = await Score.find({ student: studentId })
      .populate('quiz', 'title description duration difficulty maxMarks questions')
      .populate('student', 'fullName email college')
      .sort({ submittedAt: -1 });

    // ✅ FIX: Calculate correct maxMarks = Number of questions × 10
    const scoresWithCorrectMax = scores.map(score => {
      // Calculate based on number of questions
      const questionsCount = score.quiz?.questions?.length || 0;
      const quizMaxMarks = questionsCount * 10 || score.maxMarks || 100;
      
      // Round score to nearest whole number
      const roundedScore = Math.round(score.totalScore || 0);
      return {
        ...score.toObject(),
        maxMarks: quizMaxMarks, // Correct calculation: questions × 10
        displayMaxMarks: quizMaxMarks, // For frontend
        displayScore: roundedScore, // Rounded actual score
        quiz: {
          ...score.quiz?.toObject?.() || score.quiz,
          maxMarks: quizMaxMarks // Correct calculation: questions × 10
        }
      };
    });

    console.log('📊 getMyScores - Sending to frontend:', scoresWithCorrectMax.map(s => ({
      title: s.quiz?.title,
      score: s.totalScore,
      maxMarks: s.maxMarks,
      quizMaxMarks: s.quiz?.maxMarks
    })));

    res.json({ scores: scoresWithCorrectMax });
  } catch (error) {
    console.error('Error fetching my scores:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit quiz and create score
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const studentId = req.user._id;

    console.log('=== BACKEND: Submitting quiz ===');
    console.log('Quiz ID:', quizId);
    console.log('Student ID:', studentId);
    console.log('Number of answers:', answers?.length);
    if (answers && answers.length > 0) {
      console.log('First answer:', JSON.stringify(answers[0], null, 2));
    }

    // Get the quiz to check correct answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('📋 QUIZ LOADED:', {
      quizId: quiz._id,
      title: quiz.title,
      maxMarks: quiz.maxMarks,
      questionsCount: quiz.questions?.length
    });

    // Detect quiz type (ranking vs multiple-choice)
    const isRankingQuiz = answers && answers.length > 0 && answers[0].selectedRanking !== undefined;

    console.log('Quiz type:', isRankingQuiz ? 'RANKING' : 'MULTIPLE-CHOICE');

    // Calculate total score based on quiz type
    let correctCount = 0;
    let totalPoints = 0;
    let processedAnswers = [];

    if (answers && answers.length > 0) {
      if (isRankingQuiz) {
        // Process ranking quiz
        answers.forEach((answer, index) => {
          const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
          
          if (question) {
            // 🎯 NEW LOGIC: Award marks based on which option student ranks at top (Rank 1)
            let rankingScore = 0;
            let earnedPoints = 0;
            let totalPossiblePoints = 0;
            
            const correctRanking = question.options
              .map(opt => ({ 
                text: opt.text, 
                rank: opt.correctRank, 
                marks: opt.marks || 0 // Use marks set by Super Admin
              }))
              .sort((a, b) => a.rank - b.rank);
            
            // Find what student ranked at position 1 (top choice)
            const studentRanking = answer.selectedRanking.sort((a, b) => a.rank - b.rank);
            const studentTopChoice = studentRanking[0]; // Only the TOP option
            
            // Find the correct top choice (rank 1) - for comparison only
            const correctTopChoice = correctRanking[0];
            
            // Calculate max possible points (highest marks among all options)
            totalPossiblePoints = Math.max(...question.options.map(opt => opt.marks || 0));
            
            // 🎯 Award points based on WHICH option student put at top
            // Find the option student selected and award its marks
            const selectedOption = question.options.find(opt => opt.text === studentTopChoice?.text);
            earnedPoints = selectedOption?.marks || 0; // Get marks for the option they chose
            
            // Calculate percentage based on what they earned vs max possible
            rankingScore = totalPossiblePoints > 0 ? (earnedPoints / totalPossiblePoints) * 100 : 0;
            
            totalPoints += earnedPoints; // Add earned points to total

            console.log(`Question ${index + 1}:`, 
                        'Student chose:', studentTopChoice?.text, 
                        'Worth:', earnedPoints, 'marks',
                        'Out of max:', totalPossiblePoints,
                        'Percentage:', rankingScore.toFixed(1) + '%');

            // Find the top-ranked option to get its impact
            const topRankedOption = studentTopChoice; // Use the actual top choice
            const selectedOptionData = question.options.find(opt => opt.text === topRankedOption?.text);
            const selectedOptionText = topRankedOption?.text || '';
            const selectedOptionImpact = selectedOptionData?.impact || '';

            // Create processed answer - show which option student selected gets points
            const optionsWithPoints = question.options.map(opt => {
              const isStudentTopChoice = studentTopChoice?.text === opt.text;
              
              // Award points for whichever option student put at top
              let optionEarnedPoints = 0;
              if (isStudentTopChoice) {
                optionEarnedPoints = opt.marks || 0; // Award marks for the option they selected
              }
              
              return {
                text: opt.text,
                isCorrect: opt.isCorrect,
                correctRank: opt.correctRank,
                points: Math.round(optionEarnedPoints), // Points earned (only top choice)
                maxPoints: Math.round(opt.marks || 0), // Max marks this option is worth
                impact: opt.impact
              };
            });

            processedAnswers.push({
              question: answer.questionId,
              questionText: answer.questionText || question.text,
              questionType: 'ranking',
              selectedRanking: answer.selectedRanking,
              correctRanking: correctRanking,
              instruction: answer.instruction,
              rankingScore: rankingScore,
              instructionScore: 0, // Will be set by college admin
              points: earnedPoints,
              maxPoints: totalPossiblePoints,
              options: optionsWithPoints,
              selectedOption: selectedOptionText,
              selectedOptionImpact: selectedOptionImpact
            });
          }
        });
      } else {
        // Process multiple-choice quiz
        answers.forEach((answer, index) => {
          const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
          let isCorrect = false;
          let points = 0;

          if (question) {
            // Find the correct option for this question
            const correctOption = question.options.find(opt => opt.isCorrect);
            isCorrect = answer.selectedAnswer === correctOption?.text;
            
            if (isCorrect) {
              correctCount++;
              points = 1; // Base points for correct answer
            }

            // Bonus points for reasoning (if provided and substantial)
            if (answer.reasoning && answer.reasoning.length > 50) {
              points += 0.1; // 10% bonus for good reasoning
            }

            totalPoints += points;
          }

            // Find selected option impact
            const selectedOptionText = answer.selectedAnswer;
            const selectedOptionData = question?.options?.find(opt => opt.text === selectedOptionText);
            const selectedOptionImpact = selectedOptionData?.impact || '';

            // Create processed answer with detailed information
            processedAnswers.push({
              question: answer.questionId,
              questionText: question?.text || question?.question || 'Question not found',
              questionType: question?.type || 'multiple-choice',
              selectedOption: selectedOptionText,
              selectedOptionImpact: selectedOptionImpact,
              correctAnswer: question?.options?.find(opt => opt.isCorrect)?.text || 'Correct answer not found',
              isCorrect: isCorrect,
              timeSpent: answer.timeTaken || 0,
              reasoning: answer.reasoning || '',
              points: points,
              options: question?.options || []
            });
        });
      }
    }

    // Calculate total possible points for ranking quiz
    let totalPossiblePoints = 0;
    if (isRankingQuiz) {
      // Sum of MAXIMUM marks from each question (highest option value per question)
      quiz.questions.forEach(q => {
        const maxMarksInQuestion = Math.max(...q.options.map(opt => opt.marks || 0));
        totalPossiblePoints += maxMarksInQuestion;
      });
      console.log('📊 Total possible points (sum of max marks per question):', totalPossiblePoints);
    }

    // Calculate percentage score
    const percentage = isRankingQuiz 
      ? totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0
      : answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

    // 🎯 CRITICAL: For ranking quizzes, ALWAYS use totalPossiblePoints (sum of option marks)
    // Do NOT use quiz.maxMarks as it may be set incorrectly or to a different value
    const quizMaxMarks = isRankingQuiz ? totalPossiblePoints : (quiz.maxMarks || 100);
    
    console.log('🎯 SCORE SETTINGS:', {
      'isRankingQuiz': isRankingQuiz,
      'quiz.maxMarks (IGNORED for ranking)': quiz.maxMarks,
      'totalPossiblePoints (sum of top option marks)': totalPossiblePoints,
      'quizMaxMarks (USING THIS)': quizMaxMarks,
      'Logic': isRankingQuiz ? 'Using sum of option marks ✅' : 'Using quiz.maxMarks ✅'
    });
    
    // Calculate display score - use totalPoints directly (already scaled correctly)
    let displayScore;
    if (isRankingQuiz) {
      // For ranking quiz: totalPoints is already the earned marks, just use it directly
      displayScore = totalPoints;
    } else {
      // For MCQ: scale percentage to Super Admin's maxMarks
      displayScore = (percentage / 100) * quizMaxMarks;
    }

    console.log('📊 SCORE CALCULATION:', {
      totalPoints,
      totalPossiblePoints: isRankingQuiz ? totalPossiblePoints : answers.length,
      percentage: percentage.toFixed(2) + '%',
      quizMaxMarks: quizMaxMarks,
      displayScore: displayScore.toFixed(2),
      formula: isRankingQuiz 
        ? `Earned ${totalPoints} marks out of ${quizMaxMarks} total marks`
        : `(${percentage.toFixed(2)} / 100) * ${quizMaxMarks} = ${displayScore.toFixed(2)}`
    });

    // Get student's college for proper filtering
    const student = await User.findById(studentId);
    
    const score = new Score({
      student: studentId,
      quiz: quizId,
      college: student.college || '',
      totalScore: Math.round(displayScore * 10) / 10, // Earned marks (e.g., 9 out of 11)
      maxMarks: quizMaxMarks, // Use quizMaxMarks (which is totalPossiblePoints for ranking)
      answers: processedAnswers,
      status: 'completed',
      submittedAt: new Date()
    });

    await score.save();
    
    // Populate quiz and student data for response and socket event
    await score.populate('quiz', 'title description questions duration');
    await score.populate('student', 'fullName email college');
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io && score.student?.college) {
      console.log(`📡 Emitting score-submitted event to college: ${score.student.college}`);
      io.to(`college-${score.student.college}`).emit('score-submitted', {
        scoreId: score._id,
        studentName: score.student.fullName,
        studentEmail: score.student.email,
        quizTitle: quiz.title,
        totalScore: percentage,
        submittedAt: score.submittedAt
      });
    }

    // Format response for frontend with display values
    const responseData = isRankingQuiz ? {
      _id: score._id,
      totalScore: Math.round(displayScore * 10) / 10, // Earned marks
      maxMarks: totalPossiblePoints, // CRITICAL: Add maxMarks at top level
      percentage: percentage,
      displayScore: Math.round(displayScore * 10) / 10,
      displayMaxMarks: totalPossiblePoints, // Use sum of all top option marks
      answers: processedAnswers.map(ans => ({
        questionText: ans.questionText,
        selectedRanking: ans.selectedRanking,
        correctRanking: ans.correctRanking,
        instruction: ans.instruction,
        rankingScore: ans.rankingScore,
        instructionScore: ans.instructionScore,
        points: ans.points,
        maxPoints: ans.maxPoints,
        options: ans.options // Include options with their earned points
      })),
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        maxMarks: totalPossiblePoints // Use sum of all top option marks (consistent)
      },
      completedAt: score.submittedAt
    } : {
      _id: score._id,
      totalScore: Math.round(displayScore * 10) / 10,
      percentage: percentage,
      displayScore: Math.round(displayScore * 10) / 10,
      displayMaxMarks: quizMaxMarks,
      answers: processedAnswers.map(ans => ({
        selectedAnswer: ans.selectedOption,
        isCorrect: ans.isCorrect,
        isAutoSubmitted: false,
        score: ans.points,
        timeTaken: ans.timeSpent,
        reasoning: ans.reasoning,
        question: ans.questionText,
        correctAnswer: ans.correctAnswer
      })),
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        maxMarks: quizMaxMarks,
        questions: quiz.questions.map(q => ({
          question: q.text || q.question,
          type: q.type || 'multiple-choice',
          correctAnswer: q.options.find(opt => opt.isCorrect)?.text || ''
        }))
      },
      timeTaken: processedAnswers.reduce((sum, ans) => sum + (ans.timeSpent || 0), 0),
      completedAt: score.submittedAt
    };
    
    console.log('✅ Quiz submitted successfully!');
    console.log('Score ID:', score._id);
    console.log('Display Score:', displayScore.toFixed(2), '/', quizMaxMarks);
    console.log('Percentage:', percentage.toFixed(2) + '%');
    
    res.status(201).json({ data: responseData });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit simulation and create score record
export const submitSimulation = async (req, res) => {
  try {
    const { simulationName, score, accuracy, totalQuestions, answers } = req.body;
    const studentId = req.user._id;

    console.log('Submitting simulation:', { simulationName, score, accuracy, totalQuestions, userId: studentId });
    console.log('Answers received:', answers?.length || 0, 'answers');

    // Validate score is a valid number and within reasonable range
    let numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      console.warn('Invalid score received:', score, 'Using 0 as fallback');
      numericScore = 0;
    }

    // Create simulation record
    const simulation = new Simulation({
      userId: studentId,
      simulationName,
      score: numericScore, // Use validated numeric score
      isCompleted: true
    });

    await simulation.save();

    // Process simulation answers to include detailed question data
    let processedSimulationAnswers = [];
    if (answers && answers.length > 0) {
      processedSimulationAnswers = answers.map((answer, index) => {
        // Create a valid ObjectId for simulation questions
        let questionObjectId;
        try {
          // Check if answer.questionId is a valid ObjectId string
          if (answer.questionId && mongoose.Types.ObjectId.isValid(answer.questionId)) {
            questionObjectId = new mongoose.Types.ObjectId(answer.questionId);
            console.log(`Using valid questionId: ${answer.questionId}`);
          } else {
            // Generate a new ObjectId for simulation questions
            questionObjectId = new mongoose.Types.ObjectId();
            console.log(`Generated new ObjectId for answer ${index}, questionId was: ${answer.questionId}`);
          }
        } catch (error) {
          // Fallback to new ObjectId if anything goes wrong
          questionObjectId = new mongoose.Types.ObjectId();
          console.log(`Error creating ObjectId for answer ${index}:`, error.message);
        }

        return {
          question: questionObjectId,
          questionText: answer.questionText || `Simulation Question ${index + 1}`,
          questionType: 'strategic-simulation',
          selectedOption: answer.selectedAnswer || answer.decision || '',
          correctAnswer: answer.correctAnswer || 'Strategic Decision',
          isCorrect: answer.isCorrect || false,
          timeSpent: answer.timeTaken || 0,
          reasoning: answer.reasoning || '',
          points: answer.points || (answer.isCorrect ? 1 : 0),
          options: answer.options || []
        };
      });
    }

    // Create corresponding score record for admin dashboard
    const scoreRecord = new Score({
      student: studentId,
      quiz: null, // No quiz for simulations
      totalScore: numericScore, // Use validated numeric score
      instructorScore: 0,
      answers: processedSimulationAnswers, 
      status: 'completed',
      submittedAt: new Date(),
      simulationName, // Add simulation name to distinguish from quiz scores
      simulationType: 'strategic-simulation',
      accuracy,
      totalQuestions
    });

    await scoreRecord.save();

    console.log('Simulation and score record created successfully:', {
      simulationId: simulation._id,
      scoreRecordId: scoreRecord._id,
      totalScore: scoreRecord.totalScore,
      studentId: studentId,
      answersCount: processedSimulationAnswers.length
    });
    res.status(201).json({ 
      message: 'Simulation submitted successfully',
      simulation, 
      scoreRecord,
      totalScore: scoreRecord.totalScore
    });
  } catch (error) {
    console.error('Error submitting simulation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get score by ID with full details
export const getScoreById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const score = await Score.findById(id)
      .populate('student', 'fullName email college')
      .populate('quiz', 'title description questions');
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    res.json(score);
  } catch (error) {
    console.error('Error fetching score by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Edit score by admin (total score or instruction score)
export const editScoreByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newScore, reason, questionIndex, newInstructionScore } = req.body;
    const adminId = req.user._id;
    
    const score = await Score.findById(id);
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }
    
    const oldScore = score.totalScore;
    
    // If editing instruction score for a specific question
    if (questionIndex !== undefined && newInstructionScore !== undefined) {
      const oldInstructionScore = score.answers[questionIndex].instructionScore || 0;
      score.answers[questionIndex].instructionScore = newInstructionScore;
      
      // Recalculate total score (ranking score + instruction score)
      const totalPoints = score.answers.reduce((sum, answer) => 
        sum + (answer.rankingScore || answer.points || 0) + (answer.instructionScore || 0), 0
      );
      const maxPoints = score.answers.length * 200; // 100 for ranking + 100 for instruction per question
      score.totalScore = (totalPoints / maxPoints) * 100;
      
      score.scoreEdits = score.scoreEdits || [];
      score.scoreEdits.push({
        editedBy: adminId,
        editedAt: new Date(),
        oldScore,
        newScore: score.totalScore,
        reason,
        questionIndex,
        oldQuestionScore: oldInstructionScore,
        newQuestionScore: newInstructionScore,
        editType: 'instruction'
      });
    }
    // If editing total score
    else if (newScore !== undefined) {
      score.totalScore = newScore;
      score.scoreEdits = score.scoreEdits || [];
      score.scoreEdits.push({
        editedBy: adminId,
        editedAt: new Date(),
        oldScore,
        newScore,
        reason,
        editType: 'total'
      });
    }
    
    await score.save();
    
    // Populate data for socket event
    await score.populate('student', 'fullName email college');
    await score.populate('quiz', 'title');
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io && score.student?.college) {
      console.log(`📡 Emitting score-edited event to college: ${score.student.college}`);
      io.to(`college-${score.student.college}`).emit('score-edited', {
        scoreId: score._id,
        studentName: score.student.fullName,
        quizTitle: score.quiz?.title,
        totalScore: score.totalScore,
        editType: questionIndex !== undefined 
          ? (newInstructionScore !== undefined ? 'instruction' : 'ranking')
          : 'total'
      });
    }
    
    res.json({
      message: 'Score updated successfully',
      score
    });
  } catch (error) {
    console.error('Error editing score:', error);
    res.status(500).json({ message: error.message });
  }
};
