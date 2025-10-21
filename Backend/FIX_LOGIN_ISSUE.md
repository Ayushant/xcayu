# 🚀 FIX: "User not found or not superadmin" Error

## The Problem
You cannot login to the Admin Panel because:
1. **MongoDB is not installed/running** OR
2. **Super admin user doesn't exist in database**

## ✅ COMPLETE SOLUTION (Choose ONE option)

---

### 🎯 OPTION 1: Quick Setup with MongoDB Atlas (RECOMMENDED - 5 minutes)

**No installation needed! Free cloud database.**

#### Step 1: Create Free MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Click "Build a Database" → Choose **FREE** (M0)
4. Select region closest to you → Click "Create Cluster"

#### Step 2: Setup Database User
1. Click "Database Access" (left menu)
2. Click "Add New Database User"
3. Username: `xactionadmin`
4. Click "Autogenerate Secure Password" → **COPY IT!**
5. User Privileges: "Atlas admin"
6. Click "Add User"

#### Step 3: Allow Network Access
1. Click "Network Access" (left menu)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" → Confirm

#### Step 4: Get Connection String
1. Click "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://xactionadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### Step 5: Update Your .env File
Open `Backend\.env` and update:
```env
PORT=5000
MONGO_URI=mongodb+srv://xactionadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/quizdb?retryWrites=true&w=majority
JWT_SECRET=mysecretkey123
NODE_ENV=development
```

**IMPORTANT:** 
- Replace `<password>` with the password you copied
- Add `/quizdb` before the `?` to specify database name

#### Step 6: Initialize Database
```powershell
cd Backend
node initializeDatabase.js
```

Follow the prompts:
- Email: `superadmin@example.com`
- Password: `admin123` (or your choice, min 8 chars)
- Full Name: `Super Administrator`

#### Step 7: Start Backend
```powershell
npm start
```

✅ **Done! Login at:** http://localhost:3000/admin-login

---

### 🖥️ OPTION 2: Local MongoDB Installation

#### Step 1: Download & Install MongoDB
1. Download: https://www.mongodb.com/try/download/community
2. Choose: Windows → Download MSI
3. Run installer:
   - Choose "Complete"
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Install MongoDB Compass"
4. Click Install

#### Step 2: Start MongoDB Service
```powershell
net start MongoDB
```

#### Step 3: Verify MongoDB is Running
```powershell
mongosh --eval "db.adminCommand('ping')"
```

Should show: `{ ok: 1 }`

#### Step 4: Your .env Should Have
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quizdb
JWT_SECRET=mysecretkey123
NODE_ENV=development
```

#### Step 5: Initialize Database
```powershell
cd Backend
node initializeDatabase.js
```

Follow prompts to create super admin.

#### Step 6: Start Backend
```powershell
npm start
```

---

## 🔍 Troubleshooting

### Error: "MongoServerSelectionError"
**Problem:** MongoDB is not running

**Solution:**
- **Local MongoDB:** Run `net start MongoDB`
- **Atlas:** Check internet connection, verify cluster is "Active"

### Error: "Authentication failed"
**Problem:** Wrong credentials in MONGO_URI

**Solution:**
- Double-check username and password
- For Atlas: verify in Database Access section
- Make sure special characters in password are URL-encoded

### Error: "IP not whitelisted"
**Problem:** Atlas network access not configured

**Solution:**
- Go to Network Access in Atlas
- Add 0.0.0.0/0 (allow all IPs)
- Wait 1-2 minutes for changes to apply

### Backend won't start
**Problem:** Missing dependencies

**Solution:**
```powershell
cd Backend
npm install
```

---

## 📝 Default Login Credentials

After running `initializeDatabase.js`, use:

- **Email:** `superadmin@example.com` (or what you entered)
- **Password:** Whatever you set during initialization
- **Login URL:** http://localhost:3000/admin-login

---

## 🎯 Quick Commands Reference

```powershell
# Initialize database (first time only)
cd Backend
node initializeDatabase.js

# Start backend server
npm start

# Check if MongoDB is running (local only)
net start MongoDB

# Reset super admin password
node initializeDatabase.js
# Choose "yes" when asked to update existing admin
```

---

## ✅ How to Verify Everything Works

1. **Check MongoDB Connection:**
   ```powershell
   cd Backend
   node -p "require('mongoose').connect('your-mongo-uri').then(() => 'Connected!').catch(e => e.message)"
   ```

2. **Check Backend is Running:**
   - Open: http://localhost:5000
   - Should see: "✅ Quiz Backend API is running successfully!"

3. **Check Super Admin Exists:**
   - Run: `node initializeDatabase.js`
   - Should show existing super admin email

4. **Try Login:**
   - Open: http://localhost:3000/admin-login
   - Enter credentials
   - Should redirect to admin dashboard

---

## 🆘 Still Having Issues?

Run the diagnostic script:
```powershell
cd Backend
node diagnostic.js
```

This will check:
- ✅ .env file
- ✅ MongoDB connection
- ✅ Super admin exists
- ✅ Dependencies installed

---

## 📚 Additional Resources

- `QUICK_MONGODB_ATLAS_SETUP.md` - Detailed Atlas setup
- `SETUP_MONGODB.md` - Local MongoDB installation
- `diagnostic.js` - System diagnostic tool
- `initializeDatabase.js` - Database initialization

---

**Questions?** Check the files above or run `node diagnostic.js` for automated troubleshooting.
