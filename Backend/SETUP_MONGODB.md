# MongoDB Setup Guide for Windows

## The Problem
You're getting "User not found or not superadmin" because **MongoDB is not installed** on your system.

## Quick Solution - Install MongoDB

### Option 1: MongoDB Community Server (Recommended)

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows
   - Click: Download

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - **IMPORTANT:** Check "Install MongoDB as a Service"
   - **IMPORTANT:** Check "Install MongoDB Compass" (GUI tool)

3. **Verify Installation**
   ```powershell
   mongosh --version
   ```

4. **Start MongoDB Service** (if not auto-started)
   ```powershell
   net start MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

If you prefer a cloud database:

1. **Sign Up**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account

2. **Create Cluster**
   - Choose FREE tier (M0)
   - Select region closest to you
   - Click "Create Cluster"

3. **Setup Access**
   - Database Access → Add New Database User
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

5. **Update Backend .env**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quizdb?retryWrites=true&w=majority
   ```

## After MongoDB is Running

Once MongoDB is installed and running, create the super admin:

```powershell
cd Backend
node createSuperAdmin.js
```

**Enter these details when prompted:**
- Email: `superadmin@example.com`
- Password: `admin123` (or your preferred password, min 8 characters)
- Full Name: `Super Administrator`

## Quick Test

After setup, test the database connection:

```powershell
cd Backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://127.0.0.1:27017/quizdb').then(() => console.log('✅ Connected')).catch(err => console.log('❌ Error:', err.message));"
```

## What's Happening

Your `.env` file has:
```
MONGO_URI=mongodb://127.0.0.1:27017/quizdb
```

This expects MongoDB to be running locally on port 27017, but it's not installed yet.
