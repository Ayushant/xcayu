import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import Quiz from '../models/quizModel.js';

const router = express.Router();

// Get all quizzes (Student accessible - only active quizzes for their course)
router.get('/', protect, async (req, res) => {
  try {
    const User = (await import('../models/userModel.js')).default;
    const Course = (await import('../models/courseModel.js')).default;
    
    // Base filter for active quizzes
    const filter = { 
      isActive: true, 
      status: 'Active'
    };
    
    // COURSE & DEGREE RESTRICTION: Students can only see quizzes for their degree
    if (req.user.role === 'student') {
      // Get full user data to check degree
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // If user has a degree, filter quizzes by courses matching that degree
      if (user.degree) {
        const coursesForDegree = await Course.find({ degree: user.degree }).select('_id');
        const courseIds = coursesForDegree.map(c => c._id);
        
        if (courseIds.length === 0) {
          return res.json({
            success: true,
            quizzes: [],
            message: `No courses found for ${user.degree}. Please contact your administrator.`
          });
        }
        
        filter.course = { $in: courseIds };
      } else if (req.user.course) {
        // Fallback: Use assigned course if no degree
        filter.course = req.user.course;
      } else {
        return res.json({
          success: true,
          quizzes: [],
          message: 'No degree or course assigned. Please contact your administrator.'
        });
      }
      
      // Also filter by college if specified
      if (user.college) {
        filter.$or = [
          { college: user.college },
          { college: '' },
          { college: { $exists: false } }
        ];
      }
    }
    
    const quizzes = await Quiz.find(filter)
      .populate('course', 'courseName courseCode department degree')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      quizzes: quizzes,
      totalQuizzes: quizzes.length
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching quizzes' 
    });
  }
});

// Get all quizzes (Admin only - all quizzes)
router.get('/quizzes', protect, adminOnly, async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

// Add new quiz (with ranking MCQs and preface)
router.post('/quizzes', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, preface, course, questions, status, difficulty, passingScore, tags, college, maxMarks } = req.body;
    
    // Validate required fields
    if (!title || !description || !course) {
      return res.status(400).json({ 
        message: 'Validation failed',
        details: {
          title: title ? undefined : 'Title is required',
          description: description ? undefined : 'Description is required',
          course: course ? undefined : 'Course is required'
        }
      });
    }
    
    const newQuiz = new Quiz({
      title,
      description,
      preface: preface || '',
      course,
      status: status || 'Active',
      questions: questions || [],
      difficulty: difficulty || 'Medium',
      passingScore: passingScore || 60,
      tags: tags || [],
      college: college || '',
      maxMarks: maxMarks || 100, // Super Admin's total marks
      createdBy: req.user.id,
      isActive: true
    });

    await newQuiz.save();
    
    // Populate course details
    await newQuiz.populate('course', 'courseName courseCode');
    
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: newQuiz
    });
  } catch (error) {
    console.error('Quiz creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
});

// Update quiz
router.put('/quizzes/:id', protect, adminOnly, async (req, res) => {
  try {
    const updateData = req.body;
    
    // Ensure maxMarks is preserved or updated
    if (!updateData.maxMarks) {
      const existingQuiz = await Quiz.findById(req.params.id);
      updateData.maxMarks = existingQuiz?.maxMarks || 100;
    }
    
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: quiz
    });
  } catch (error) {
    console.error('Quiz update error:', error);
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  }
});

// Delete quiz
router.delete('/quizzes/:id', protect, adminOnly, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz' });
  }
});

export default router;
