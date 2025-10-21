# 🚀 Quick MongoDB Atlas Setup (5 Minutes)

## Why Use MongoDB Atlas?
- ✅ No local installation needed
- ✅ Free forever tier (512 MB storage)
- ✅ Works from anywhere
- ✅ Automatic backups

## Step-by-Step Setup

### 1. Create Account (1 minute)
1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with Google or Email
3. Verify your email

### 2. Create Free Cluster (2 minutes)
1. Click **"Build a Database"**
2. Choose **FREE** (M0 Sandbox)
3. Select **Provider**: AWS or Google Cloud
4. Select **Region**: Closest to your location
5. Cluster Name: Leave as default or name it `Xaction`
6. Click **"Create Cluster"** (takes 1-3 minutes)

### 3. Setup Database Access (1 minute)
1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `xactionadmin`
5. Password: Click **"Autogenerate Secure Password"** (copy it!)
6. User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### 4. Setup Network Access (30 seconds)
1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Click **"Confirm"**

### 5. Get Connection String (30 seconds)
1. Click **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string - it looks like:
   ```
   mongodb+srv://xactionadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update Your Backend .env File
1. Open: `Backend\.env`
2. Replace the MONGO_URI line with your connection string:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://xactionadmin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/quizdb?retryWrites=true&w=majority
   JWT_SECRET=mysecretkey123
   NODE_ENV=development
   ```
   
   **IMPORTANT:** 
   - Replace `<password>` with the password you copied
   - Add `/quizdb` before the `?` to specify the database name

### 7. Create Super Admin
```powershell
cd Backend
node createSuperAdmin.js
```

When prompted:
- Email: `superadmin@example.com`
- Password: `admin123` (min 8 characters)
- Full Name: `Super Administrator`

### 8. Start Backend
```powershell
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

## Example Connection String
```
mongodb+srv://xactionadmin:MyP@ssw0rd123@cluster0.abc123.mongodb.net/quizdb?retryWrites=true&w=majority
```

## Troubleshooting

### Error: "bad auth: Authentication failed"
- Double-check your username and password in the connection string
- Make sure you replaced `<password>` with actual password
- No special characters that need URL encoding? Use MongoDB Compass to test

### Error: "IP not whitelisted"
- Go to Network Access
- Make sure 0.0.0.0/0 is added (allows all IPs)
- Wait 1-2 minutes for changes to apply

### Error: "Could not connect to any servers"
- Check your internet connection
- Verify the cluster is running (should show "Active")
- Try again in 1-2 minutes

## Next Steps
Once MongoDB Atlas is connected and super admin is created:
1. Login at: `http://localhost:3000/admin-login`
2. Email: `superadmin@example.com`
3. Password: Whatever you set during creation

🎉 Done!
