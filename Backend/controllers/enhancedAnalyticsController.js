import Score from '../models/scoreModel.js';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import License from '../models/licenseModel.js';
import { successResponse, errorResponse } from '../utils/errorHandler.js';

/**
 * Enhanced Analytics Controller
 * 
 * Features:
 * - Per-degree performance breakdown
 * - Student performance trend lines
 * - Time-based analysis
 * - Improvement tracking
 * - Comparative analytics
 */

/**
 * Get per-degree performance breakdown
 * Shows detailed metrics for each degree program
 */
export const getDegreePerformanceBreakdown = async (req, res) => {
  try {
    const { college, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (college) filter.college = new RegExp(college, 'i');
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate by degree
    const degreeStats = await Score.aggregate([
      { $match: filter },
      { $match: { degree: { $exists: true, $ne: '', $ne: null } } },
      {
        $group: {
          _id: '$degree',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$totalScore' },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' },
          medianScore: { $median: { input: '$totalScore', method: 'approximate' } },
          students: { $addToSet: '$student' },
          quizAttempts: {
            $sum: { $cond: [{ $eq: ['$simulationType', 'quiz'] }, 1, 0] }
          },
          simulationAttempts: {
            $sum: { $cond: [{ $eq: ['$simulationType', 'strategic-simulation'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          degree: '$_id',
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 2] },
          maxScore: { $round: ['$maxScore', 2] },
          minScore: { $round: ['$minScore', 2] },
          medianScore: { $round: ['$medianScore', 2] },
          uniqueStudents: { $size: '$students' },
          quizAttempts: 1,
          simulationAttempts: 1,
          passRate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: [
                      { $size: { $filter: { input: '$students', cond: { $gte: ['$$this.averageScore', 60] } } } },
                      { $size: '$students' }
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    return successResponse(res, 200, 'Degree performance breakdown fetched successfully', {
      degreeStats,
      totalDegrees: degreeStats.length
    });
  } catch (error) {
    console.error('Error fetching degree performance breakdown:', error);
    return errorResponse(res, 500, 'Error fetching degree performance breakdown', error.message);
  }
};

/**
 * Get student performance trend line
 * Tracks improvement over time for individual students
 */
export const getStudentTrendLine = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { timeFrame = '30days' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeFrame) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get student details
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return errorResponse(res, 404, 'Student not found');
    }

    // Get all scores for this student within timeframe
    const scores = await Score.find({
      student: studentId,
      submittedAt: { $gte: startDate, $lte: now },
      status: 'completed'
    })
    .populate('quiz', 'title difficulty')
    .populate('course', 'courseName courseCode')
    .sort({ submittedAt: 1 });

    // Calculate trend data
    const trendData = scores.map((score, index) => ({
      date: score.submittedAt,
      score: score.totalScore,
      quizTitle: score.quiz?.title || score.simulationName || 'Unknown',
      difficulty: score.quiz?.difficulty || 'Medium',
      type: score.simulationType || 'quiz',
      courseName: score.course?.courseName || 'N/A',
      attemptNumber: index + 1,
      accuracy: score.accuracy || score.totalScore
    }));

    // Calculate statistics
    const totalAttempts = scores.length;
    const averageScore = scores.reduce((sum, s) => sum + s.totalScore, 0) / totalAttempts || 0;
    const firstScore = scores[0]?.totalScore || 0;
    const lastScore = scores[scores.length - 1]?.totalScore || 0;
    const improvement = lastScore - firstScore;
    const improvementPercentage = firstScore > 0 ? ((improvement / firstScore) * 100) : 0;

    // Calculate moving average (7-day window)
    const movingAverageWindow = Math.min(7, scores.length);
    const movingAverage = trendData.map((point, index) => {
      const start = Math.max(0, index - movingAverageWindow + 1);
      const window = trendData.slice(start, index + 1);
      const avg = window.reduce((sum, p) => sum + p.score, 0) / window.length;
      return {
        ...point,
        movingAverage: Math.round(avg * 100) / 100
      };
    });

    return successResponse(res, 200, 'Student trend line fetched successfully', {
      student: {
        id: student._id,
        name: student.fullName,
        email: student.email,
        college: student.college,
        degree: student.degree
      },
      trendData: movingAverage,
      statistics: {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        firstScore: Math.round(firstScore * 100) / 100,
        lastScore: Math.round(lastScore * 100) / 100,
        improvement: Math.round(improvement * 100) / 100,
        improvementPercentage: Math.round(improvementPercentage * 100) / 100,
        trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable'
      },
      timeFrame
    });
  } catch (error) {
    console.error('Error fetching student trend line:', error);
    return errorResponse(res, 500, 'Error fetching student trend line', error.message);
  }
};

/**
 * Get comparative college analytics
 * Compare multiple colleges side by side
 */
export const getComparativeCollegeAnalytics = async (req, res) => {
  try {
    const { colleges, metric = 'averageScore' } = req.query;

    let collegeList;
    if (colleges) {
      collegeList = colleges.split(',').map(c => c.trim());
    } else {
      // Get all colleges from licenses
      const licenses = await License.find({ status: 'Active' });
      collegeList = licenses.map(l => l.college);
    }

    const comparativeData = await Promise.all(
      collegeList.map(async (college) => {
        // Get college license info
        const license = await License.findOne({ college });

        // Get student count
        const studentCount = await User.countDocuments({ role: 'student', college });

        // Get score statistics
        const scoreStats = await Score.aggregate([
          { $match: { college, status: 'completed' } },
          {
            $group: {
              _id: null,
              averageScore: { $avg: '$totalScore' },
              totalAttempts: { $sum: 1 },
              maxScore: { $max: '$totalScore' },
              minScore: { $min: '$totalScore' }
            }
          }
        ]);

        // Get quiz vs simulation breakdown
        const typeBreakdown = await Score.aggregate([
          { $match: { college, status: 'completed' } },
          {
            $group: {
              _id: '$simulationType',
              count: { $sum: 1 },
              avgScore: { $avg: '$totalScore' }
            }
          }
        ]);

        const stats = scoreStats[0] || {
          averageScore: 0,
          totalAttempts: 0,
          maxScore: 0,
          minScore: 0
        };

        return {
          college,
          license: {
            status: license?.status || 'No License',
            expiryDate: license?.expiryDate,
            maxStudents: license?.maxStudents || 0,
            currentStudents: studentCount
          },
          performance: {
            averageScore: Math.round(stats.averageScore * 100) / 100,
            totalAttempts: stats.totalAttempts,
            maxScore: Math.round(stats.maxScore * 100) / 100,
            minScore: Math.round(stats.minScore * 100) / 100,
            attemptsPerStudent: studentCount > 0 ? Math.round((stats.totalAttempts / studentCount) * 100) / 100 : 0
          },
          typeBreakdown: typeBreakdown.map(t => ({
            type: t._id || 'quiz',
            count: t.count,
            avgScore: Math.round(t.avgScore * 100) / 100
          }))
        };
      })
    );

    // Sort by selected metric
    const sortedData = comparativeData.sort((a, b) => {
      return b.performance[metric] - a.performance[metric];
    });

    return successResponse(res, 200, 'Comparative analytics fetched successfully', {
      comparativeData: sortedData,
      metric,
      totalColleges: sortedData.length
    });
  } catch (error) {
    console.error('Error fetching comparative analytics:', error);
    return errorResponse(res, 500, 'Error fetching comparative analytics', error.message);
  }
};

/**
 * Get time-based performance analysis
 * Track performance changes over different time periods
 */
export const getTimeBasedAnalysis = async (req, res) => {
  try {
    const { college, degree, interval = 'daily' } = req.query;

    // Calculate time range
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Build filter
    const filter = {
      submittedAt: { $gte: thirtyDaysAgo, $lte: now },
      status: 'completed'
    };
    if (college) filter.college = new RegExp(college, 'i');
    if (degree) filter.degree = degree;

    // Determine date grouping format
    let dateFormat;
    switch (interval) {
      case 'hourly':
        dateFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$submittedAt' } };
        break;
      case 'daily':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } };
        break;
      case 'weekly':
        dateFormat = { $dateToString: { format: '%Y-W%V', date: '$submittedAt' } };
        break;
      case 'monthly':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$submittedAt' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } };
    }

    // Aggregate by time period
    const timeBasedData = await Score.aggregate([
      { $match: filter },
      {
        $group: {
          _id: dateFormat,
          averageScore: { $avg: '$totalScore' },
          totalAttempts: { $sum: 1 },
          uniqueStudents: { $addToSet: '$student' }
        }
      },
      {
        $project: {
          period: '$_id',
          averageScore: { $round: ['$averageScore', 2] },
          totalAttempts: 1,
          uniqueStudents: { $size: '$uniqueStudents' }
        }
      },
      { $sort: { period: 1 } }
    ]);

    return successResponse(res, 200, 'Time-based analysis fetched successfully', {
      timeBasedData,
      interval,
      totalPeriods: timeBasedData.length
    });
  } catch (error) {
    console.error('Error fetching time-based analysis:', error);
    return errorResponse(res, 500, 'Error fetching time-based analysis', error.message);
  }
};

/**
 * Get improvement rankings
 * Identify students with most improvement
 */
export const getImprovementRankings = async (req, res) => {
  try {
    const { college, degree, limit = 10 } = req.query;

    // Build filter for students
    const studentFilter = { role: 'student' };
    if (college) studentFilter.college = new RegExp(college, 'i');
    if (degree) studentFilter.degree = degree;

    const students = await User.find(studentFilter).select('-password');

    // Calculate improvement for each student
    const improvementData = await Promise.all(
      students.map(async (student) => {
        const scores = await Score.find({
          student: student._id,
          status: 'completed'
        }).sort({ submittedAt: 1 });

        if (scores.length < 2) {
          return null; // Need at least 2 scores to calculate improvement
        }

        const firstScore = scores[0].totalScore;
        const lastScore = scores[scores.length - 1].totalScore;
        const improvement = lastScore - firstScore;
        const improvementPercentage = firstScore > 0 ? ((improvement / firstScore) * 100) : 0;
        const averageScore = scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length;

        return {
          student: {
            id: student._id,
            name: student.fullName,
            email: student.email,
            college: student.college,
            degree: student.degree
          },
          metrics: {
            firstScore: Math.round(firstScore * 100) / 100,
            lastScore: Math.round(lastScore * 100) / 100,
            improvement: Math.round(improvement * 100) / 100,
            improvementPercentage: Math.round(improvementPercentage * 100) / 100,
            averageScore: Math.round(averageScore * 100) / 100,
            totalAttempts: scores.length
          }
        };
      })
    );

    // Filter out nulls and sort by improvement
    const validData = improvementData
      .filter(d => d !== null)
      .sort((a, b) => b.metrics.improvement - a.metrics.improvement)
      .slice(0, parseInt(limit));

    return successResponse(res, 200, 'Improvement rankings fetched successfully', {
      rankings: validData,
      totalStudents: validData.length
    });
  } catch (error) {
    console.error('Error fetching improvement rankings:', error);
    return errorResponse(res, 500, 'Error fetching improvement rankings', error.message);
  }
};

export default {
  getDegreePerformanceBreakdown,
  getStudentTrendLine,
  getComparativeCollegeAnalytics,
  getTimeBasedAnalysis,
  getImprovementRankings
};

