# Database Initialization (Backend)

This document explains how to initialize the MongoDB database for the backend, create a super admin user, and verify the setup.

Prerequisites
- Node.js installed
- MongoDB running locally or Atlas connection string set in `Backend/.env`

Configure `.env`
Make sure `Backend/.env` contains a valid `MONGO_URI`. Example for local MongoDB:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/quizdb
JWT_SECRET=mysecretkey123
NODE_ENV=development
```

Or a MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://xactionadmin:MyP@ss@cluster0.mongodb.net/quizdb?retryWrites=true&w=majority
```

Run the initializer

Open PowerShell in the `Backend` folder and run:

```powershell
# Use the CLI arg to pass password
node initDatabase.js 123456

# Or use environment variable
$env:SUPERADMIN_PASSWORD = '123456'; node initDatabase.js
```

Notes
- The script will create or update a user with role `superadmin` and set `isActive: true`.
- Defaults: email `superadmin@example.com`, fullName `Super Administrator`.

Verification
- After success, start the backend and try logging in at `/superadmin/login` or via the frontend admin login.

Troubleshooting
- If `MONGO_URI` is missing: add it to `Backend/.env`.
- If connection refused: ensure MongoDB service is running or use Atlas.
- If dependencies missing: run `npm install` in `Backend`.
