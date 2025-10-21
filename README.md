# Quiz Management System

A comprehensive MERN stack application for managing quizzes, students, and assessments across multiple colleges.

## Features

- 🎓 **Multi-Role System**: Super Admin, College Admin, and Student roles
- 📝 **Quiz Management**: Create and manage multiple-choice and ranking quizzes
- 🔐 **License Management**: College-based licensing system with student limits
- 📊 **Analytics & Reports**: Detailed performance analytics and reporting
- 🎮 **Interactive Simulations**: Mars simulation and other educational simulations
- 🔄 **Real-time Updates**: Socket.IO powered real-time notifications
- 📈 **Score Tracking**: Comprehensive score management and editing capabilities

## Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- React Router DOM
- Recharts for data visualization
- Socket.IO Client
- Axios for API requests

**Backend:**
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO for real-time features
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Quiz
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
SOCKET_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend directory (if needed):

```env
VITE_API_URL=http://localhost:5000
```

## Running the Application

### Development Mode

**Start Backend:**
```bash
cd Backend
npm start
```

**Start Frontend:**
```bash
cd Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Mode

**Backend:**
```bash
cd Backend
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd Frontend
npm run build
# Serve the dist folder with your preferred web server
```

## Initial Setup

### Create Super Admin

Run the super admin creation script:

```bash
cd Backend
node createSuperAdmin.js
```

This will create a super admin account that you can use to:
- Create college admin accounts
- Manage licenses
- Oversee the entire system

## User Roles

### Super Admin
- Manage all colleges and licenses
- Create college admin accounts
- View system-wide analytics
- Manage all students across colleges

### College Admin
- Manage students within their college
- Create and manage quizzes
- View student performance
- Control quiz access for students

### Student
- Take assigned quizzes
- View personal scores and progress
- Access simulations (if licensed)
- See rankings and leaderboards

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Super Admin
- `GET /api/superadmin/dashboard` - Dashboard data
- `POST /api/superadmin/create-college-admin` - Create college admin
- `GET /api/superadmin/students` - Get all students
- And more...

### Admin
- `GET /api/admin/students` - Get college students
- `POST /api/admin/add-student` - Add new student
- `POST /api/admin/start-quiz` - Start quiz for students
- And more...

### Scores
- `GET /api/scores` - Get all scores
- `POST /api/scores/submit` - Submit quiz
- `GET /api/scores/my-scores` - Get student's own scores
- And more...

For complete API documentation, refer to the route files in `Backend/routes/`.

## Security Features

- ✅ Bcrypt password hashing
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration
- ✅ Environment variable protection

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Update `MONGO_URI` with production database
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `CORS_ORIGINS` with your production domain
- [ ] Update `SOCKET_ORIGINS` with your production domain
- [ ] Enable HTTPS
- [ ] Set up MongoDB authentication
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular database backups
- [ ] Rate limiting on API endpoints (recommended)

## Folder Structure

```
Quiz/
├── Backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── data/            # Static data (simulation content)
│   └── Server.js        # Main server file
├── Frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── utils/       # Utility functions
│   │   └── main.jsx     # Entry point
│   └── index.html
└── README.md
```

## Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running
- Check MONGO_URI in .env file
- Verify network connectivity

### CORS Errors
- Update CORS_ORIGINS in backend .env
- Ensure frontend URL is included in allowed origins

### Socket.IO Connection Issues
- Verify SOCKET_ORIGINS configuration
- Check firewall settings
- Ensure WebSocket support is enabled

## License

[Your License Here]

## Support

For support, email [your-email] or open an issue in the repository.

## Contributors

[List your contributors here]

