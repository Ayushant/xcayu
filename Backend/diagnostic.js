#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC TOOL - Check System Status
 * Run this to see what's missing or broken
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 XACTION SYSTEM DIAGNOSTIC');
console.log('='.repeat(50));

// Check 1: .env file
console.log('\n📋 Step 1: Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const mongoUri = envContent.match(/MONGO_URI=(.+)/)?.[1];
  if (mongoUri) {
    console.log(`   MongoDB URI: ${mongoUri.substring(0, 30)}...`);
    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      console.log('   ℹ️  Using LOCAL MongoDB');
    } else if (mongoUri.includes('mongodb+srv')) {
      console.log('   ℹ️  Using MongoDB Atlas (Cloud)');
    }
  } else {
    console.log('❌ MONGO_URI not found in .env');
  }
} else {
  console.log('❌ .env file NOT found');
}

// Check 2: MongoDB connection
console.log('\n📋 Step 2: Testing MongoDB connection...');
try {
  // Dynamic import
  const mongoose = await import('mongoose');
  const dotenv = await import('dotenv');
  
  dotenv.default.config();
  
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('❌ MONGO_URI not set in environment');
  } else {
    console.log('   Attempting connection...');
    
    try {
      await mongoose.default.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ MongoDB connection successful!');
      
      // Check for users
      const User = mongoose.default.model('User', new mongoose.default.Schema({
        email: String,
        role: String,
        fullName: String
      }));
      
      const userCount = await User.countDocuments();
      console.log(`   Total users: ${userCount}`);
      
      const superadmins = await User.countDocuments({ role: 'superadmin' });
      console.log(`   Super admins: ${superadmins}`);
      
      if (superadmins === 0) {
        console.log('⚠️  NO SUPER ADMIN FOUND!');
        console.log('   👉 Run: node createSuperAdmin.js');
      } else {
        const admin = await User.findOne({ role: 'superadmin' });
        console.log(`   Super Admin email: ${admin.email}`);
      }
      
      await mongoose.default.connection.close();
    } catch (connError) {
      console.log('❌ MongoDB connection FAILED');
      console.log(`   Error: ${connError.message}`);
      
      if (connError.message.includes('ECONNREFUSED')) {
        console.log('\n   💡 SOLUTION:');
        console.log('   MongoDB is not running on your computer.');
        console.log('   Choose ONE option:');
        console.log('   A) Install MongoDB locally (see SETUP_MONGODB.md)');
        console.log('   B) Use MongoDB Atlas cloud (see QUICK_MONGODB_ATLAS_SETUP.md)');
      } else if (connError.message.includes('authentication failed')) {
        console.log('\n   💡 SOLUTION:');
        console.log('   Wrong username/password in MONGO_URI');
        console.log('   Check your MongoDB Atlas credentials');
      }
    }
  }
} catch (error) {
  console.log('❌ Error loading dependencies:', error.message);
}

// Check 3: Node modules
console.log('\n📋 Step 3: Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules exists');
} else {
  console.log('❌ node_modules NOT found');
  console.log('   👉 Run: npm install');
}

// Check 4: Required packages
console.log('\n📋 Step 4: Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ package.json exists');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const required = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'dotenv'];
  required.forEach(dep => {
    if (pkg.dependencies[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} missing`);
    }
  });
} else {
  console.log('❌ package.json NOT found');
}

console.log('\n' + '='.repeat(50));
console.log('📊 DIAGNOSTIC COMPLETE');
console.log('='.repeat(50));
console.log('\n📝 SUMMARY:');
console.log('1. If MongoDB connection failed → Setup MongoDB (see guides above)');
console.log('2. If no super admin found → Run: node createSuperAdmin.js');
console.log('3. If dependencies missing → Run: npm install');
console.log('\n🎯 NEXT STEP: Fix the issues above, then restart backend');
