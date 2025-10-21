# 🔧 IMMEDIATE FIX: Set Quiz to 50 Marks

## 🎯 PROBLEM
Quiz is showing "10/10" but you set it to 50 marks as Super Admin.

## ✅ SOLUTION (Choose One Method)

---

## METHOD 1: Via MongoDB Shell (FASTEST) ⚡

### Step 1: Open MongoDB Shell
```bash
mongosh "your-mongodb-connection-string"
# OR if local:
mongosh
```

### Step 2: Switch to Database
```javascript
use quizdb
```

### Step 3: Find Your Quiz
```javascript
// List all quizzes to find yours
db.quizzes.find({}, { title: 1, maxMarks: 1 }).pretty()

// Example output:
// {
//   _id: ObjectId("..."),
//   title: "Your Quiz Name",
//   maxMarks: undefined  ← PROBLEM!
// }
```

### Step 4: Update Quiz to 50 Marks
```javascript
// Replace "Your Quiz Name" with your actual quiz title
db.quizzes.updateOne(
  { title: "Your Quiz Name" },
  { $set: { maxMarks: 50 } }
)

// Should see: { acknowledged: true, modifiedCount: 1 }
```

### Step 5: Verify Update
```javascript
db.quizzes.findOne(
  { title: "Your Quiz Name" },
  { title: 1, maxMarks: 1 }
)

// Should show: maxMarks: 50 ✅
```

### Step 6: Delete Old Scores
```javascript
// Get quiz ID from previous step
const quizId = ObjectId("YOUR_QUIZ_ID_HERE")

// Delete old scores
db.scores.deleteMany({ quiz: quizId })

// Should see: { acknowledged: true, deletedCount: X }
```

### Step 7: Restart Backend & Test
```powershell
cd Backend
npm start
```

Student takes quiz → Should see "X.X / 50" ✅

---

## METHOD 2: Via Node.js Script

### Step 1: Run the Fix Script
```powershell
cd Backend\scripts
node quickFix50Marks.js
```

This will:
- Find latest quiz
- Update maxMarks to 50
- Delete old scores
- Show confirmation

### Step 2: Restart Backend
```powershell
cd ..
npm start
```

---

## METHOD 3: Via Quiz Builder UI (SAFEST)

### Step 1: Login as Super Admin
Open browser → Login as Super Admin

### Step 2: Edit Quiz
```
1. Go to Quiz Management
2. Find your quiz
3. Click Edit button
4. Find "Total Marks" field
5. Change to 50
6. Click Save
```

### Step 3: Delete Old Scores
```
1. Go to Admin Dashboard
2. Find scores for this quiz
3. Delete them
4. (Or students can just retake)
```

### Step 4: Test
Student takes quiz → Should see "X.X / 50" ✅

---

## 🔍 VERIFICATION

After fixing, check backend logs when student takes quiz:

```bash
📋 QUIZ LOADED: {
  title: 'Your Quiz',
  maxMarks: 50  ← Should be 50!
}

🎯 SUPER ADMIN SETTINGS: {
  'quiz.maxMarks': 50  ← Should be 50!
  'quizMaxMarks (using)': 50  ← Should be 50!
  'Is Default?': 'NO - Using Super Admin setting ✅'
}

📊 SCORE CALCULATION: {
  quizMaxMarks: 50  ← Should be 50!
  displayScore: 'X.XX'  ← Calculated with 50!
  formula: '(X / Y) * 50 = X.XX'  ← Uses 50!
}
```

---

## 🎯 QUICK COPY-PASTE MONGODB COMMANDS

```javascript
// 1. Connect and switch to database
use quizdb

// 2. List recent quizzes
db.quizzes.find().sort({ createdAt: -1 }).limit(5).forEach(q => {
  print(`Title: ${q.title}`);
  print(`ID: ${q._id}`);
  print(`maxMarks: ${q.maxMarks || 'undefined'}`);
  print('---');
})

// 3. Update specific quiz (replace with your quiz title or ID)
db.quizzes.updateOne(
  { title: "YOUR_QUIZ_TITLE_HERE" },
  { $set: { maxMarks: 50 } }
)

// OR by ID:
db.quizzes.updateOne(
  { _id: ObjectId("YOUR_QUIZ_ID_HERE") },
  { $set: { maxMarks: 50 } }
)

// 4. Verify
db.quizzes.findOne({ title: "YOUR_QUIZ_TITLE_HERE" }, { maxMarks: 1 })

// 5. Delete old scores for this quiz
const quizId = ObjectId("YOUR_QUIZ_ID_HERE")
db.scores.deleteMany({ quiz: quizId })

// 6. Done! Restart backend and test
```

---

## 🚀 FASTEST PATH (Copy-Paste This)

```bash
# Terminal 1: Open MongoDB
mongosh

# Then run these commands one by one:
use quizdb
db.quizzes.find().sort({ createdAt: -1 }).limit(1).pretty()
# ↑ Copy the _id from output

# Replace QUIZ_ID with the _id you just copied:
db.quizzes.updateOne(
  { _id: ObjectId("QUIZ_ID") },
  { $set: { maxMarks: 50 } }
)

# Verify it worked:
db.quizzes.findOne({ _id: ObjectId("QUIZ_ID") }, { maxMarks: 1 })
# Should show: maxMarks: 50

# Delete old scores:
db.scores.deleteMany({ quiz: ObjectId("QUIZ_ID") })

# Exit MongoDB
exit

# Terminal 2: Restart Backend
cd Backend
npm start

# Test: Student takes quiz → Should show "X.X / 50" ✅
```

---

## 📊 EXPECTED RESULTS

### Perfect Score (100%):
```
Results Page: 50.0 / 50 ✅
Dashboard: 50.0 out of 50 ✅
```

### 80% Score:
```
Results Page: 40.0 / 50 ✅
Dashboard: 40.0 out of 50 ✅
```

### 60% Score:
```
Results Page: 30.0 / 50 ✅
Dashboard: 30.0 out of 50 ✅
```

---

## ⚠️ COMMON ISSUES

### "Still showing 10/10"
- Backend not restarted → Restart npm start
- Browser cache → Press Ctrl+Shift+R
- Old score → Delete from database

### "MongoDB connection error"
- Check MONGODB_URI in .env
- Verify MongoDB is running
- Check connection string

### "Quiz not found"
- Check quiz title spelling
- Use quiz _id instead
- List all quizzes to find it

---

## 📞 NEED HELP?

If still not working after fix:
1. Check backend logs for errors
2. Verify quiz.maxMarks in database
3. Delete all scores for that quiz
4. Clear browser cache
5. Restart backend
6. Student retakes quiz

---

**Status**: ✅ Fix Ready  
**Time**: ~2 minutes  
**Method**: MongoDB shell (fastest)  

---

*Choose METHOD 1 for instant fix!* ⚡
