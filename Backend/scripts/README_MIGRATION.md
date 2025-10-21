# Score College Migration Script

## Overview
This migration script populates the `college` field in all existing score records by retrieving the college information from the associated student's User record.

## Why is this needed?
Previously, scores were created without the `college` field, making it difficult to filter scores by college. This created a potential security issue where college admins might see scores from other colleges.

## Prerequisites
- Node.js installed
- MongoDB connection configured in `.env`
- Backup of your database (recommended)

## How to Run

### 1. Navigate to the Backend directory
```bash
cd Backend
```

### 2. Ensure environment variables are set
Make sure your `.env` file has the MongoDB connection string:
```
MONGODB_URI=mongodb://your-mongodb-connection-string
```

### 3. Run the migration script
```bash
node scripts/migrateScoreColleges.js
```

### 4. Review the output
The script will show:
- Number of scores found without college field
- Progress of updates
- Summary report with success/error counts
- Verification of remaining scores without college

## Expected Output

```
🔄 Starting college field migration for scores...

✅ Connected to MongoDB

📊 Found 150 scores without college field

✅ Updated score 673abc123... - Student: John Doe, College: MIT
✅ Updated score 673def456... - Student: Jane Smith, College: Stanford
...

============================================================
📈 MIGRATION SUMMARY
============================================================
✅ Successfully updated: 148 scores
⚠️  Skipped: 2 scores (no student/college)
❌ Errors: 0 scores
============================================================

📊 Remaining scores without college: 0

🎉 Migration completed successfully! All scores have college field populated.
```

## What if scores are skipped?

Scores may be skipped if:
1. **No associated student:** The score's student reference is missing or invalid
2. **Student has no college:** The student exists but doesn't have a college assigned

**Action Required:**
- Review skipped scores manually
- Either delete orphaned scores or assign proper student/college data
- Re-run the migration script after fixing the data

## Verification

After running the migration, verify the results:

### 1. Check in MongoDB
```javascript
// Count scores with college field
db.scores.countDocuments({ college: { $ne: "" } })

// Count scores without college field
db.scores.countDocuments({ $or: [
  { college: { $exists: false } },
  { college: "" },
  { college: null }
]})
```

### 2. Test College Admin Access
1. Login as a college admin
2. Verify you only see students and scores from your college
3. Try to access a score ID from another college (should return 403)

## Troubleshooting

### Error: Cannot connect to MongoDB
**Solution:** Check your `MONGODB_URI` in `.env` file

### Error: Student not found
**Solution:** The score references a deleted student. Consider cleaning up orphaned scores:
```javascript
// In MongoDB shell
db.scores.find({ student: { $exists: false } })
```

### Some scores still without college
**Solution:** These scores may have invalid student references. Review them manually:
```bash
node scripts/migrateScoreColleges.js
# Check the skipped scores in the output
```

## Safety Features

The script includes:
- ✅ Dry-run capability (modify script to add `console.log` only mode)
- ✅ Detailed logging of each operation
- ✅ Error handling for individual score updates
- ✅ Summary report for easy review
- ✅ No data deletion - only adds missing college field

## Production Deployment

For production, it's recommended to:
1. **Backup database first**
2. **Run in maintenance window** (low traffic time)
3. **Test on staging environment** before production
4. **Monitor logs** during execution
5. **Verify results** after completion

## Need Help?

If you encounter issues:
1. Check the migration output for specific error messages
2. Review the MongoDB logs
3. Verify your `.env` configuration
4. Check that all User records have valid college fields

---

**Last Updated:** October 11, 2025

