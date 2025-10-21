# 🚀 Quick Start Guide

Get your Quiz Management System running in 5 minutes!

## Prerequisites

- Node.js v14+ installed
- MongoDB v4.4+ installed and running
- Git (optional, for cloning)

## Step 1: Set Up Environment Variables

### Backend

```bash
cd Backend
cp env.example .env
```

Edit `Backend/.env` and update:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Generate using: `openssl rand -base64 32`

**Minimum required .env:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your-generated-secret-here
CORS_ORIGINS=http://localhost:5173
SOCKET_ORIGINS=http://localhost:5173
```

### Frontend

```bash
cd Frontend
cp env.example .env
```

**Minimum required .env:**
```env
VITE_API_URL=http://localhost:5000
```

## Step 2: Install Dependencies

### Backend

```bash
cd Backend
npm install
```

### Frontend

```bash
cd Frontend
npm install
```

## Step 3: Create Super Admin

```bash
cd Backend
node createSuperAdmin.js
```

Follow the prompts:
- Enter email (or press Enter for default)
- Enter password (minimum 8 characters)
- Enter full name (or press Enter for default)

**Example:**
```
Enter Super Admin email: admin@example.com
Enter Super Admin password: MySecurePass123
Enter Super Admin full name: Admin User
```

## Step 4: Start the Application

### Terminal 1 - Backend

```bash
cd Backend
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server is running on PORT 5000
```

### Terminal 2 - Frontend

```bash
cd Frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 5: Access the Application

Open your browser and go to: **http://localhost:5173**

### Login

Use the credentials you created in Step 3:
- Email: admin@example.com
- Password: MySecurePass123

## 🎉 That's It!

You should now see the Super Admin Dashboard.

## What Can You Do Now?

### As Super Admin:
1. ✅ Create college admin accounts
2. ✅ Manage licenses for colleges
3. ✅ View all students across colleges
4. ✅ Monitor system-wide analytics

### Next Steps:
1. Create a college admin: Dashboard → "Create College Admin"
2. Set up a license for that college
3. Log in as college admin to add students
4. Create quizzes
5. Start assigning quizzes to students

## Common Issues

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (MacOS/Linux)
sudo systemctl start mongod

# Start MongoDB (Windows)
net start MongoDB
```

### "Port 5000 already in use"
Change the PORT in `Backend/.env`:
```env
PORT=5001
```

### "CORS error" in browser
Make sure `CORS_ORIGINS` in `Backend/.env` matches your frontend URL:
```env
CORS_ORIGINS=http://localhost:5173
```

### Frontend can't reach backend
Update `VITE_API_URL` in `Frontend/.env` to match your backend port:
```env
VITE_API_URL=http://localhost:5000
```

## File Structure

```
Quiz/
├── Backend/
│   ├── .env              # Your configuration (create from env.example)
│   ├── env.example       # Environment template
│   ├── Server.js         # Main server file
│   └── createSuperAdmin.js  # Admin creation script
├── Frontend/
│   ├── .env              # Your configuration (create from env.example)
│   ├── env.example       # Environment template
│   └── src/              # React application
└── README.md             # Full documentation
```

## Need More Help?

- 📖 **Full Documentation**: See `README.md`
- 🚀 **Deployment Guide**: See `DEPLOYMENT.md`
- ✅ **Production Checklist**: See `PRODUCTION_CHECKLIST.md`
- 📝 **What Changed**: See `PRODUCTION_READY_SUMMARY.md`

## Test Workflow

### 1. Login as Super Admin
- Go to http://localhost:5173
- Login with your credentials

### 2. Create College Admin
- Click "Create College Admin"
- Fill in details:
  - Email: college1@example.com
  - Password: Password123
  - Full Name: College Admin
  - College: ABC College
  
### 3. Create License
- Go to License Management
- Create a license for "ABC College"
- Set student limit (e.g., 100)
- Set expiry date

### 4. Login as College Admin
- Logout from Super Admin
- Login with: college1@example.com / Password123

### 5. Add Students
- Click "Add Student"
- Fill in student details
- Students will receive their credentials

### 6. Create Quiz
- Go to Quiz Management
- Click "Create Quiz"
- Add questions
- Assign to students

### 7. Test as Student
- Logout from College Admin
- Login with student credentials
- Take the quiz
- View results

## Development vs Production

### Development (Current Setup)
- ✅ Hot reload enabled
- ✅ Detailed error messages
- ✅ Debug logs visible
- ✅ Local MongoDB

### Production (See DEPLOYMENT.md)
- ✅ Optimized builds
- ✅ Secure configurations
- ✅ Production MongoDB
- ✅ HTTPS enabled
- ✅ Monitoring tools

## Scripts Reference

### Backend
```bash
npm start          # Start server
node createSuperAdmin.js  # Create admin
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

## Stopping the Application

Press `Ctrl + C` in both terminal windows to stop the servers.

---

**Ready for Production?** See `DEPLOYMENT.md` for deployment instructions!

**Need Help?** Check `README.md` for comprehensive documentation!

