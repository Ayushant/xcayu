# Deployment Guide - Quiz Application

## Issues Fixed in This Update

### 1. ✅ Render Deployment - "nodemon: not found" Error
**Problem:** Render was trying to run `npm run dev` which uses `nodemon` (a development dependency not available in production)

**Solution:** 
- Use `npm start` instead of `npm run dev` for production
- Created `render.yaml` for automatic configuration
- Backend configured to use `node Server.js` for production

### 2. ✅ College Admin Access Control
**Problem:** College admins could potentially access data from other colleges

**Solution:**
- Enhanced backend security with multi-layer filtering
- Added college field population in score creation
- Created migration script for existing data
- Comprehensive audit logging

---

## Part 1: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Update Render Settings**
   - Go to your Render dashboard
   - Select your backend service
   - Go to **Settings** → **Build & Deploy**
   - Ensure these settings:
     - **Build Command:** `cd Backend && npm install`
     - **Start Command:** `cd Backend && npm start`
   - Or simply connect your repository and Render will auto-detect `render.yaml`

2. **Set Environment Variables** (in Render dashboard)
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=10000
   ```

3. **Deploy**
   - Commit and push your code
   - Render will automatically deploy using the new configuration

### Option B: Manual Configuration

If you don't want to use `render.yaml`:

1. **Go to Render Dashboard** → Your Backend Service → **Settings**

2. **Update Start Command:**
   ```bash
   npm start
   ```
   ❌ NOT `npm run dev` (this uses nodemon which isn't available in production)

3. **Update Build Command:**
   ```bash
   npm install
   ```

4. **Set Environment Variables** (same as Option A)

5. **Save and Deploy**

### Verify Deployment

After deployment, check:
```bash
# Visit your backend URL
https://your-backend.onrender.com/

# Check health endpoint (if you have one)
https://your-backend.onrender.com/health

# Check logs in Render dashboard
# Should see: "Server running on port 10000" (or your PORT)
```

---

## Part 2: Run College Data Migration

### Before Migration

1. **Backup your database** (IMPORTANT!)
   ```bash
   # Using MongoDB Atlas - use the built-in backup feature
   # OR export manually:
   mongodump --uri="your_mongodb_uri" --out=./backup
   ```

2. **Verify current state:**
   ```bash
   # Count scores without college field (in MongoDB shell)
   db.scores.countDocuments({ $or: [
     { college: { $exists: false } },
     { college: "" },
     { college: null }
   ]})
   ```

### Run Migration

#### For Local/Development:

```bash
# Navigate to backend directory
cd Backend

# Run migration script
npm run migrate:colleges

# OR directly:
node scripts/migrateScoreColleges.js
```

#### For Production (Render):

**Option 1: Via Render Shell**
```bash
# In Render dashboard → Your service → Shell
cd /opt/render/project/src/Backend
node scripts/migrateScoreColleges.js
```

**Option 2: Temporary deploy script**
```bash
# Create a one-time migration job in render.yaml
# (Advanced - only if you need automated migration)
```

**Option 3: Via SSH (if enabled)**
```bash
ssh your-render-instance
cd Backend
npm run migrate:colleges
```

### Verify Migration

After running the migration:

```bash
# Check migration output for:
✅ Successfully updated: X scores
⚠️  Skipped: Y scores
❌ Errors: Z scores

# Verify in MongoDB
db.scores.countDocuments({ college: { $ne: "" } })
# Should match your total number of scores
```

---

## Part 3: Test College Admin Access

### 1. Test College Admin Login

```bash
# Try logging in as a college admin
POST /api/college-admin/login
{
  "email": "college@example.com",
  "password": "college_password"
}
```

Expected Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "college": "MIT",
    "role": "collegeAdmin"
  }
}
```

### 2. Test Data Isolation

**Scenario A: Access Own College Data (Should Work)**
```bash
GET /api/college-admin/students
Headers: { Authorization: "Bearer <token>" }

Expected: ✅ Returns only students from your college
```

**Scenario B: Access Another College's Data (Should Fail)**
```bash
# Try to access a score from another college
GET /api/college-admin/score-details/<score_id_from_another_college>
Headers: { Authorization: "Bearer <token>" }

Expected: ❌ 403 Forbidden
{
  "message": "Unauthorized access",
  "details": "You can only view scores from students in your college"
}
```

### 3. Check Server Logs

Look for security audit logs:
```
✅ College Admin (MIT): Retrieved 45 scores
✅ College Admin (MIT): Retrieved score details for John Doe
🚫 Unauthorized access attempt: College MIT tried to access score for student from Stanford
```

---

## Part 4: Frontend Deployment

### If deploying Frontend separately:

1. **Build the frontend:**
   ```bash
   cd Frontend
   npm install
   npm run build
   ```

2. **Deploy to Render** (Static Site):
   - Build Command: `cd Frontend && npm install && npm run build`
   - Publish Directory: `./Frontend/dist`

3. **Update API endpoint** in frontend:
   ```javascript
   // Frontend/src/config/api.js or similar
   const API_URL = process.env.VITE_API_URL || 'https://your-backend.onrender.com';
   ```

---

## Part 5: Post-Deployment Checklist

### Backend
- [ ] Server starts successfully with `npm start` (not `npm run dev`)
- [ ] MongoDB connection successful
- [ ] Environment variables properly set
- [ ] `/api/college-admin/*` routes working
- [ ] JWT authentication working
- [ ] Socket.io connections working (if applicable)

### Database
- [ ] All scores have college field populated
- [ ] Migration script ran successfully
- [ ] No orphaned scores (scores without students)

### Security
- [ ] College admins can only see their own college's data
- [ ] Unauthorized access attempts return 403
- [ ] Audit logs show proper access patterns
- [ ] JWT tokens expire correctly

### Frontend
- [ ] College admin dashboard loads
- [ ] Can view students from own college
- [ ] Can view and edit scores from own college
- [ ] Cannot access data from other colleges
- [ ] Real-time updates working (Socket.io)

---

## Troubleshooting

### Issue: "nodemon: not found" on Render
**Solution:**
```bash
# Change start command from:
npm run dev
# To:
npm start
```

### Issue: College admin sees data from all colleges
**Solution:**
1. Check if migration script ran successfully
2. Verify backend code is updated
3. Clear cache and restart server
4. Check server logs for security warnings

### Issue: Migration script fails
**Solution:**
1. Check MongoDB connection string
2. Verify `.env` file is properly configured
3. Check if students have college field populated
4. Review error messages in migration output

### Issue: 403 errors for legitimate college admin access
**Solution:**
1. Verify college admin user has correct college field
2. Check if students belong to the same college
3. Review server logs for specific error messages
4. Verify JWT token is valid and includes college information

---

## Monitoring

### What to monitor:

1. **Security Events:**
   - Unauthorized access attempts (🚫 logs)
   - Cross-college access attempts
   - Failed authentication attempts

2. **Performance:**
   - Response times for `/college-admin/*` endpoints
   - Database query performance
   - Memory usage

3. **Data Integrity:**
   - Scores always have college field
   - Students properly assigned to colleges
   - No orphaned records

### Recommended Monitoring Tools:
- Render logs (built-in)
- MongoDB Atlas monitoring
- Sentry (error tracking)
- LogRocket (session replay)

---

## Rollback Plan

If issues occur after deployment:

### 1. Rollback Code
```bash
# In your repository
git revert HEAD
git push

# Or in Render dashboard
# Go to Deploys → Select previous deploy → "Rollback to this version"
```

### 2. Restore Database (if needed)
```bash
# If you backed up with mongodump
mongorestore --uri="your_mongodb_uri" ./backup

# Or use MongoDB Atlas backup restoration
```

### 3. Clear Application Cache
```bash
# In Render dashboard
Settings → Clear build cache → Rebuild
```

---

## Support

If you encounter issues:
1. Check this guide first
2. Review server logs in Render dashboard
3. Check MongoDB Atlas logs
4. Review the `COLLEGE_ADMIN_ACCESS_CONTROL_FIX.md` for detailed technical information

---

## Summary of Changes

### Files Modified:
- ✅ `Backend/controllers/scoreController.js` - Added college field population
- ✅ `Backend/controllers/collegeAdminController.js` - Enhanced security
- ✅ `Backend/package.json` - Added migration script
- ✅ `render.yaml` - Created for auto-configuration

### Files Created:
- ✅ `Backend/scripts/migrateScoreColleges.js` - Migration script
- ✅ `Backend/scripts/README_MIGRATION.md` - Migration guide
- ✅ `COLLEGE_ADMIN_ACCESS_CONTROL_FIX.md` - Technical documentation
- ✅ `DEPLOYMENT_GUIDE.md` - This file

### No Breaking Changes:
- ✅ Frontend components unchanged
- ✅ API endpoints unchanged
- ✅ Database schema unchanged (only added field population)
- ✅ Backward compatible with existing data

---

**Ready for Production Deployment** ✅

**Last Updated:** October 11, 2025  
**Version:** 2.0.0

