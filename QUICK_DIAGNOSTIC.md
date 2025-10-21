# Quick Diagnostic Guide

## ✅ Files Successfully Created

### Backend (3 files)
- [x] `Backend/models/quizProgressModel.js` - 95 lines
- [x] `Backend/controllers/quizProgressController.js` - 487 lines  
- [x] `Backend/routes/quizProgressRoutes.js` - 36 lines
- [x] `Backend/Server.js` - UPDATED with routes

### Frontend (3 files)
- [x] `Frontend/src/hooks/useQuizProgress.js` - 197 lines
- [x] `Frontend/src/components/student/EnhancedQuiz.jsx` - 508 lines
- [x] `Frontend/src/components/ImpactDisplay.jsx` - 87 lines

## 🔍 What to Check

### Backend Issues

**1. Port Already in Use**
```bash
# Check what's using port 5000
netstat -ano | findstr :5000
```
Kill the process or use different port

**2. Missing MongoDB Connection**
```bash
# Verify .env has MONGO_URI
cat Backend/.env | grep MONGO_URI
```

**3. Missing Node Modules**
```bash
cd Backend
npm install
```

### Frontend Issues

**1. Import Path Problems**
Check that API_URL imports work:
- `Backend/src/config/api.js` exists ✓
- Has `export const API_URL` ✓

**2. Component Import Issues**
In browser console check:
- No "Cannot find module" errors
- No "API_URL is undefined" errors

**3. Clear Cache**
```bash
# Clear node modules
rm -r Frontend/node_modules
npm install

# Clear browser
- DevTools → Application → Clear Site Data
- Or use Ctrl+Shift+Delete
```

## 🧪 Quick Tests

### Test 1: Backend Server Health
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok", ...}
```

### Test 2: Quiz Progress API
```bash
curl -X POST http://localhost:5000/api/quiz-progress/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quizId":"627..."}' 
# Should return 200 with progressId
```

### Test 3: Frontend Console
Open browser DevTools → Console and check:
- No red errors
- `useQuizProgress` hook loads properly
- `API_URL = http://localhost:5000/api`

## 📋 Common Fixes

### "Cannot find module quizProgressModel"
→ Check file exists at `Backend/models/quizProgressModel.js`
→ Check `Server.js` has correct import path

### "API_URL is undefined"  
→ Restart frontend dev server
→ Clear browser cache
→ Check `config/api.js` has `export const API_URL`

### Quiz doesn't resume after refresh
→ Check Browser DevTools → Network → see GET request for `/quiz-progress/:id`
→ Check MongoDB for `quizprogress` collection
→ Check `localStorage` for session data

### Decimal points not showing
→ Check Quiz builder set `points: 2.5` not `points: 2`
→ Verify database has `options.points` field
→ Check EnhancedQuiz displays `option.points.toFixed(1)`

### Impact text not visible after completion
→ Check Quiz has `options.impact` field in database
→ Check ImpactDisplay component imported in QuizResults
→ Check results API returns `impacts` array

## 🔧 Step-by-Step Reset

If nothing works:

```bash
# 1. Stop both servers
Ctrl+C in terminal

# 2. Clear database collections (caution!)
mongo
> use xaction_db
> db.quizprogresses.deleteMany({})
> exit

# 3. Reinstall dependencies
cd Backend && npm install
cd ../Frontend && npm install

# 4. Restart servers
cd Backend && npm start      # Terminal 1
cd ../Frontend && npm run dev # Terminal 2

# 5. Open browser
http://localhost:5173

# 6. Check console for errors
DevTools → Console tab
```

## 📞 Please Provide

When saying "it doesn't work", please share:

1. **Full error message** - Copy/paste from console
2. **Browser console screenshot** - DevTools → Console
3. **Network tab screenshot** - DevTools → Network (filter by quiz-progress)
4. **Which feature fails** - Quiz start? Resume? Results? Submit?
5. **Steps to reproduce** - Exactly what you clicked

**Example:**
"When I click 'Start Quiz' on Question 1, I get error in console: `TypeError: Cannot read property 'data' of undefined` at EnhancedQuiz.jsx:45"

---

Once you provide the specific error, I can fix it immediately! 🚀
