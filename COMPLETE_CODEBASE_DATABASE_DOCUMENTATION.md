# 📚 Complete Codebase & Database Documentation

**Project**: Xaction - Strategic Quiz & Simulation Platform  
**Date**: October 20, 2025  
**Database**: MongoDB (quizdb)  
**Stack**: MERN (MongoDB, Express, React, Node.js)

---

## 🗄️ DATABASE ARCHITECTURE

### Database Connection
```javascript
MongoDB URI: mongodb://127.0.0.1:27017/quizdb
Connection: Mongoose ODM
Location: Backend/config/db.js
```

---

## 📊 DATABASE MODELS (Complete Schema)

### 1. **User Model** (`userModel.js`)

```javascript
{
  email: String (unique, required),
  password: String (required, bcrypt hashed),
  role: Enum ['student', 'admin', 'superadmin', 'collegeAdmin'],
  fullName: String (required),
  college: String,
  degree: Enum ['MBA', 'BE', 'BTech', 'Law', 'BBA', 'BCA', 'MCA', 'MSc', 'BSc', 'MTech', 'BA', 'MA', 'PhD', 'Other', ''],
  course: ObjectId (ref: Course),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Roles**:
- `student` - Takes quizzes and simulations
- `admin` - Manages college-level quizzes and students
- `collegeAdmin` - Advanced college administration
- `superadmin` - Full system access

---

### 2. **Quiz Model** (`quizModel.js`)

```javascript
{
  title: String (required),
  description: String (required),
  preface: String (front panel shown before quiz),
  status: Enum ['Active', 'Draft', 'Archived'],
  questions: [QuestionSchema],
  maxMarks: Number (default: 100),
  course: ObjectId (ref: Course, required),
  simulationId: ObjectId (ref: Simulation),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  college: String,
  difficulty: Enum ['Easy', 'Medium', 'Hard'],
  passingScore: Number (default: 60),
  tags: [String],
  timestamps: true
}
```

**Question Schema**:
```javascript
{
  text: String (required),
  points: [{text: String}], // Read-only descriptions
  maxMarks: Number (default: 10),
  options: [{
    text: String,
    correctRank: Number, // 1 = highest priority
    points: Number, // Marks for selecting this option
    isCorrect: Boolean,
    impact: String // Explanation shown after submission
  }],
  instructionRequired: Boolean (default: true)
}
```

---

### 3. **Score Model** (`scoreModel.js`)

```javascript
{
  student: ObjectId (ref: User, required),
  quiz: ObjectId (ref: Quiz, optional for simulations),
  totalScore: Number (default: 0),
  maxMarks: Number (default: 100),
  instructorScore: Number (default: 0),
  maxInstructorScore: Number (default: 50),
  finalScore: Number (totalScore + instructorScore),
  status: Enum ['completed', 'in-progress', 'not-started'],
  answers: [AnswerSchema],
  submittedAt: Date,
  feedback: String,
  
  // Simulation fields
  simulationName: String,
  simulationType: Enum ['quiz', 'strategic-simulation'],
  accuracy: Number,
  totalQuestions: Number,
  
  // Analytics
  college: String,
  course: ObjectId (ref: Course),
  simulation: ObjectId (ref: Simulation),
  
  // Admin editing
  scoreEdits: [{
    editedBy: ObjectId (ref: User),
    editedAt: Date,
    oldScore: Number,
    newScore: Number,
    reason: String,
    questionIndex: Number,
    oldQuestionScore: Number,
    newQuestionScore: Number,
    editType: Enum ['total', 'ranking', 'instruction']
  }],
  timestamps: true
}
```

**Answer Schema**:
```javascript
{
  question: ObjectId,
  questionText: String (required),
  questionType: Enum ['multiple-choice', 'text', 'strategic-simulation', 'ranking'],
  
  // Ranking fields
  selectedRanking: [{text: String, rank: Number}],
  correctRanking: [{text: String, rank: Number}],
  rankingScore: Number (0-100 percentage),
  
  // Scoring
  points: Number (actual points earned),
  maxPoints: Number (maximum possible),
  instruction: String (mandatory explanation),
  instructionScore: Number (scored by admin),
  
  // MCQ fields
  selectedOption: String,
  selectedOptionImpact: String,
  correctAnswer: String,
  isCorrect: Boolean,
  reasoning: String,
  
  // Options storage
  options: [{
    text: String,
    isCorrect: Boolean,
    correctRank: Number,
    points: Number,
    impact: String
  }]
}
```

---

### 4. **Simulation Model** (`simulationModel.js`)

```javascript
{
  userId: ObjectId (ref: User, required),
  simulationName: String (required),
  score: Number (required),
  accuracy: Number,
  totalQuestions: Number,
  answers: [AnswerSchema],
  isCompleted: Boolean (default: true),
  submittedAt: Date,
  
  // Management
  college: String,
  degree: Enum (same as User),
  course: ObjectId (ref: Course),
  createdBy: ObjectId (ref: User),
  
  // Status
  isTemplate: Boolean (default: false),
  isActive: Boolean (default: true),
  status: Enum ['Active', 'Inactive', 'Archived'],
  description: String,
  instructions: String,
  templateType: String (default: 'Strategic Simulation'),
  
  // Access credentials
  studentCredentials: {
    email: String,
    password: String
  },
  adminCredentials: {
    email: String,
    password: String
  },
  timestamps: true
}
```

---

### 5. **Course Model** (`courseModel.js`)

```javascript
{
  courseName: String (required),
  courseCode: String (unique, uppercase, required),
  department: String (required),
  degree: Enum (same as User),
  description: String,
  duration: String (e.g., "1 Semester"),
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User, required),
  timestamps: true
}
```

**Indexes**:
- `courseCode` (for fast queries)
- `department`

---

### 6. **License Model** (`licenseModel.js`)

```javascript
{
  college: String (required),
  email: String (unique, required),
  password: String (required, hashed),
  maxStudents: Number (required),
  currentStudents: Number (default: 0),
  expiryDate: Date (required),
  status: Enum ['Active', 'Expired', 'Suspended'],
  
  // Resources
  courses: [ObjectId] (ref: Course),
  assignedSimulations: [ObjectId] (ref: Simulation),
  assignedQuizzes: [ObjectId] (ref: Quiz),
  
  // Metadata
  department: String,
  contactPerson: String,
  phone: String,
  notes: String,
  timestamps: true
}
```

**Indexes**:
- `email` (unique)

---

### 7. **QuizProgress Model** (`quizProgressModel.js`)

```javascript
{
  student: ObjectId (ref: User, required),
  quiz: ObjectId (ref: Quiz, required),
  course: ObjectId (ref: Course),
  
  // Progress
  currentQuestion: Number (default: 0, 0-indexed),
  totalQuestions: Number (required),
  
  // Answers
  answeredQuestions: [{
    questionIndex: Number (required),
    questionId: ObjectId,
    selectedRanking: [{text: String, rank: Number}],
    selectedOption: String,
    instruction: String,
    reasoning: String,
    answeredAt: Date
  }],
  
  // Session
  status: Enum ['in-progress', 'submitted', 'abandoned', 'completed'],
  startedAt: Date,
  lastAccessedAt: Date,
  completedAt: Date,
  college: String,
  sessionId: String (unique),
  
  // Submission tracking
  submitted: Boolean (default: false),
  submittedScoreId: ObjectId (ref: Score),
  timestamps: true
}
```

**Indexes**:
- Compound: `{student, quiz, status}`
- Compound: `{student, quiz, submitted}`

---

### 8. **Result Model** (`resultModel.js`)

```javascript
{
  student: ObjectId (ref: User, required),
  quiz: ObjectId (ref: Quiz, required),
  score: Number (required),
  totalQuestions: Number (required),
  correctAnswers: Number (required),
  percentage: Number (required),
  timeSpent: Number (seconds),
  answers: [{
    questionId: ObjectId (required),
    questionText: String (required),
    selectedAnswer: String (required),
    correctAnswer: String (required),
    isCorrect: Boolean (required),
    timeSpent: Number
  }],
  submittedAt: Date,
  status: Enum ['completed', 'incomplete', 'abandoned'],
  timestamps: true
}
```

**Indexes**:
- Compound: `{student, quiz}`
- `submittedAt` (descending)
- `score` (descending)

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Token System
```javascript
// Token generation
generateToken(userId, role, expiresIn='30d')

// Token payload
{
  id: userId,
  role: userRole,
  iat: timestamp,
  exp: timestamp
}

// Storage
localStorage.setItem('token', token)
localStorage.setItem('userRole', role)
```

### Middleware
```javascript
// authMiddleware.js
protect() - Validates JWT token
adminOnly() - Admin/SuperAdmin/CollegeAdmin only
isCollegeAdmin() - CollegeAdmin only
```

### Password Security
```javascript
// bcryptjs hashing
bcrypt.hash(password, 10) // Registration
bcrypt.compare(password, hashedPassword) // Login
```

---

## 🎯 SCORING SYSTEM

### Ranking Quiz Scoring Algorithm

**Current System (Fixed)**:
```javascript
For each option in student's ranking:
  1. Find option in correct ranking
  2. Calculate position difference
  3. If exact match (position = correct position):
     → Award FULL points for option
  4. If close match (off by 1-2 positions):
     → Calculate proximity score
     → Award PARTIAL points = optionPoints × proximityScore × 0.5
  5. Store earned points per option

Total Score = Sum of all earned points
Percentage = (Total Earned / Total Possible) × 100
```

**Proximity Formula**:
```javascript
positionDifference = |studentIndex - correctIndex|
maxDifference = totalOptions - 1
proximityScore = 1 - (positionDifference / maxDifference)
partialPoints = optionPoints × proximityScore × 0.5
```

**Example**:
```
4 options, each worth 5 points:
- Option A: Ranked #1 (correct: #1) → 5.0 pts ✅
- Option B: Ranked #3 (correct: #2) → 1.7 pts 🟡
- Option C: Ranked #4 (correct: #3) → 1.7 pts 🟡
- Option D: Ranked #2 (correct: #4) → 0.8 pts 🟡
Total: 9.2 / 20 pts (46%)
```

---

## 🛣️ API ROUTES

### Authentication (`authRoutes.js`)
```
POST /api/auth/login - User login
```

### Super Admin (`superAdminRoutes.js`)
```
GET  /api/superadmin/overview - Dashboard stats
GET  /api/superadmin/licenses - All licenses
GET  /api/superadmin/users - All users (with filters)
POST /api/superadmin/users - Create user
PUT  /api/superadmin/users/:id - Update user
DELETE /api/superadmin/users/:id - Delete user
GET  /api/superadmin/quizzes - All quizzes
GET  /api/superadmin/scores - All scores
```

### Admin (`adminRoutes.js`)
```
GET  /api/admin/dashboard - College dashboard stats
GET  /api/admin/students - College students
POST /api/admin/students - Add student
GET  /api/admin/quizzes - College quizzes
POST /api/admin/quizzes - Create quiz
PUT  /api/admin/quizzes/:id - Update quiz
DELETE /api/admin/quizzes/:id - Delete quiz
```

### College Admin (`collegeAdminRoutes.js`)
```
GET  /api/collegeadmin/dashboard - College admin stats
GET  /api/collegeadmin/students - Manage students
GET  /api/collegeadmin/scores - View/edit scores
PUT  /api/collegeadmin/scores/:id/instruction - Edit instruction score
```

### Scores (`scoreRoutes.js`)
```
GET  /api/scores - All scores (filtered by role)
GET  /api/scores/real-students - Real student scores only
GET  /api/scores/quiz/:quizId - Scores by quiz
GET  /api/scores/student/:studentId - Scores by student
GET  /api/scores/:id - Score details
GET  /api/scores/my-scores - Student's own scores
POST /api/scores/submit - Submit quiz
POST /api/scores/submit-simulation - Submit simulation
PUT  /api/scores/:id - Update score (instructor score/feedback)
PUT  /api/scores/:id/edit - Admin edit score
```

### Score Edit (`scoreEditRoutes.js`)
```
PUT  /api/score-edit/:id/total - Edit total score
PUT  /api/score-edit/:id/instruction/:questionIndex - Edit instruction score
GET  /api/score-edit/:id/history - Score edit history
```

### Quizzes (`quizRoutes.js`)
```
GET  /api/quizzes - All quizzes (filtered by course)
GET  /api/quizzes/:id - Quiz details
POST /api/quizzes - Create quiz
PUT  /api/quizzes/:id - Update quiz
DELETE /api/quizzes/:id - Delete quiz
GET  /api/quizzes/course/:courseId - Quizzes by course
```

### Quiz Progress (`quizProgressRoutes.js`)
```
GET  /api/quiz-progress/:quizId - Get progress for quiz
POST /api/quiz-progress/:quizId - Save progress
PUT  /api/quiz-progress/:quizId - Update progress
DELETE /api/quiz-progress/:quizId - Clear progress
GET  /api/quiz-progress/:quizId/resume - Resume quiz
```

### Simulations (`simulationRoutes.js`)
```
GET  /api/simulations - All simulations
GET  /api/simulations/:id - Simulation details
POST /api/simulations - Create simulation
PUT  /api/simulations/:id - Update simulation
DELETE /api/simulations/:id - Delete simulation
POST /api/simulations/submit - Submit simulation
```

### Licenses (`licenseRoutes.js`)
```
GET  /api/licenses - All licenses
GET  /api/licenses/:id - License details
POST /api/licenses - Create license
PUT  /api/licenses/:id - Update license
DELETE /api/licenses/:id - Delete license
GET  /api/licenses/validate/:college - Validate license
```

---

## 🔧 BACKEND UTILITIES

### Error Handler (`errorHandler.js`)
```javascript
globalErrorHandler(err, req, res, next)
notFoundHandler(req, res, next)
successResponse(res, data, message, statusCode)
errorResponse(res, message, statusCode, details)
```

### Logger (`logger.js`)
```javascript
logger.info(message)
logger.error(message, error)
logger.warn(message)
logger.success(message)
logger.debug(message)
```

### Ranking Score (`rankingScore.js`)
```javascript
calculateRankingScore(studentRanking, correctRanking)
calculateExactMatchBonus(studentRanking, correctRanking)
calculateTotalRankingScore(studentRanking, correctRanking)
isValidRanking(ranking)
```

### License Watcher (`licenseWatcher.js`)
- Monitors license expiry
- Sends real-time Socket.IO notifications
- Auto-deactivates expired licenses

### License Expiry Job (`licenseExpiryJob.js`)
- Cron job for daily license checks
- Updates license status
- Sends expiry warnings

---

## 🎨 FRONTEND ARCHITECTURE

### Tech Stack
```javascript
React 19.1.1
React Router DOM 7.8.2
Vite 7.1.2
Tailwind CSS 4.1.13
Axios 1.11.0
Socket.IO Client 4.8.1
Framer Motion 12.23.24
```

### Context API
```javascript
// QuizContext
- Quiz state management
- Progress tracking
- Answer storage
```

### Components Structure
```
components/
├── student/
│   ├── EnhancedStudentDashboard.jsx
│   ├── RankingQuiz.jsx
│   ├── QuizResults.jsx
│   ├── EnhancedQuiz.jsx
│   └── QuizAttempts.jsx
├── AdminDashboard.jsx
├── CollegeAdminDashboard.jsx
├── SuperAdminStudentManagement.jsx
├── EnhancedQuizBuilder.jsx
├── EnhancedQuizManagement.jsx
├── CourseManagement.jsx
├── LicenseManagement.jsx
├── SimulationManagement.jsx
└── Chatbot/
```

### Pages
```
pages/
├── Home.jsx
├── Login.jsx
├── About.jsx
├── Contact.jsx
├── Simulation.jsx
├── SuperAdminDashboard/
└── Licenses.jsx
```

---

## 📡 REAL-TIME FEATURES (Socket.IO)

### Events Emitted by Backend
```javascript
// Score submission
io.to(`college-${college}`).emit('score-submitted', {
  scoreId, studentName, studentEmail, quizTitle, totalScore, submittedAt
})

// Score editing
io.to(`college-${college}`).emit('score-edited', {
  scoreId, studentName, quizTitle, totalScore, editType
})

// License expiry warning
io.to(`college-${college}`).emit('license-expiry-warning', {
  college, daysRemaining, expiryDate
})

// License expired
io.to(`college-${college}`).emit('license-expired', {
  college, expiryDate
})
```

### Client-Side Listeners
```javascript
socket.on('score-submitted', (data) => { /* Update UI */ })
socket.on('score-edited', (data) => { /* Refresh scores */ })
socket.on('license-expiry-warning', (data) => { /* Show banner */ })
socket.on('license-expired', (data) => { /* Logout */ })
```

### Room Management
```javascript
socket.emit('join-admin-room') // Admin dashboard
socket.emit('join-user-room', userId) // User-specific
socket.emit('join-college-room', college) // College-wide
```

---

## 🗃️ DATA FLOW

### Quiz Submission Flow
```
1. Student opens quiz
2. Frontend creates QuizProgress entry
3. Student answers questions (saved to progress)
4. Student submits quiz
5. Backend calculates scores:
   - Ranking similarity score
   - Individual option points
   - Total earned points
6. Creates Score document
7. Emits Socket.IO event
8. Frontend shows results
9. Admin dashboard updates in real-time
```

### Score Editing Flow
```
1. Admin views student scores
2. Admin clicks edit score
3. Opens AdminScoreEditModal
4. Admin enters new score + reason
5. PUT /api/score-edit/:id/total
6. Backend validates and updates
7. Adds entry to scoreEdits array
8. Emits Socket.IO event
9. Frontend updates live
```

### License Management Flow
```
1. SuperAdmin creates license
2. Sets maxStudents, expiryDate, courses
3. License stored in database
4. License watcher monitors expiry
5. Cron job runs daily checks
6. If expiring soon: emit warning
7. If expired: update status, emit event
8. Frontend shows alerts/banners
```

---

## 🔒 SECURITY FEATURES

### Authentication
- JWT tokens with 30-day expiry
- Secure password hashing (bcrypt)
- Token verification on all protected routes
- Role-based access control

### Authorization
- Route-level protection
- Role-based permissions
- College-based data filtering
- Admin hierarchy (Student < Admin < CollegeAdmin < SuperAdmin)

### Data Validation
- Express-validator middleware
- Mongoose schema validation
- Frontend input validation
- File upload restrictions

### CORS Configuration
```javascript
corsOrigins: ['http://localhost:5173', 'http://localhost:3000']
credentials: true
maxAge: 86400 (24 hours)
```

---

## 📈 ANALYTICS & REPORTING

### Dashboard Statistics
```javascript
// SuperAdmin
- Total licenses
- Total students
- Total admins
- Total quizzes
- Total results
- Average score
- Server uptime

// Admin/CollegeAdmin
- College students
- Active quizzes
- Completed scores
- Average score
- Recent submissions
- Top performers
```

### Score Analytics
- Score distribution
- Question-wise analysis
- Time-based trends
- College comparisons
- Student performance tracking

---

## 🚀 DEPLOYMENT

### Environment Variables
```bash
# Backend (.env)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quizdb
JWT_SECRET=mysecretkey123
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SOCKET_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Scripts
```json
// Backend
"start": "node Server.js"
"dev": "nodemon Server.js"
"seed": "node seed.js"

// Frontend
"dev": "vite"
"build": "vite build"
"preview": "vite preview"
```

### Database Setup
```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/data

# Connect
mongosh
use quizdb

# Verify collections
show collections
```

---

## 📝 KEY FEATURES

### ✅ Implemented
1. **Multi-role authentication** (Student, Admin, CollegeAdmin, SuperAdmin)
2. **Ranking-based quiz system** with partial credit
3. **Course management** with restrictions
4. **License management** with expiry tracking
5. **Real-time updates** via Socket.IO
6. **Quiz progress** save/resume functionality
7. **Score editing** with audit trail
8. **Detailed analytics** and reporting
9. **Simulation integration**
10. **Mobile-responsive UI**
11. **Option impact display**
12. **Instruction scoring**
13. **College-based filtering**
14. **Enhanced quiz builder**
15. **Chatbot support**

### 🔄 Recent Fixes (October 2025)
- ✅ Ranking score calculation (proximity-based partial credit)
- ✅ Option points display (earned vs max)
- ✅ Score database storage (actual points vs percentage)
- ✅ Frontend results display (color-coded feedback)
- ✅ College-based access control
- ✅ License watcher improvements

---

## 📞 SUPPORT & MAINTENANCE

### Common Issues
1. **"0 pts" for all options**: Restart backend, clear cache
2. **Authentication errors**: Check JWT secret, token expiry
3. **MongoDB connection**: Verify MongoDB is running
4. **CORS errors**: Check CORS_ORIGINS in .env
5. **Socket.IO not working**: Check SOCKET_ORIGINS

### Debug Commands
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand({ping: 1})"

# View backend logs
npm run dev (shows console logs)

# Clear browser cache
Ctrl + Shift + R (hard refresh)

# Test API endpoints
curl http://localhost:5000/health
```

---

## 📊 DATABASE STATISTICS

### Collections
```
users - User accounts (students, admins)
quizzes - Quiz templates and questions
scores - Quiz submissions and results
simulations - Simulation records
courses - Course catalog
licenses - College licenses
quizprogresses - In-progress quiz tracking
results - Legacy result records
```

### Indexes
```
users: email (unique)
quizzes: courseCode, createdBy
scores: student, quiz, status
courses: courseCode (unique), department
licenses: email (unique)
quizprogresses: {student, quiz, status}, {student, quiz, submitted}
results: {student, quiz}, submittedAt, score
```

---

## 🎯 FUTURE ENHANCEMENTS

### Planned Features
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Bulk student upload
- [ ] Quiz templates library
- [ ] Video integration
- [ ] Peer review system
- [ ] Gamification (badges, leaderboards)
- [ ] Export reports (PDF, Excel)
- [ ] Email notifications
- [ ] SMS alerts

### Technical Debt
- [ ] Add comprehensive unit tests
- [ ] Implement Redis caching
- [ ] Add API rate limiting
- [ ] Optimize database queries
- [ ] Implement CDN for static assets
- [ ] Add Elasticsearch for full-text search
- [ ] Implement WebSocket fallback
- [ ] Add database backup automation

---

**Last Updated**: October 20, 2025  
**Version**: 2.0.0  
**Status**: ✅ Production Ready

---

*For detailed API documentation, see individual route files in `Backend/routes/`*  
*For component documentation, see `Frontend/src/components/`*
