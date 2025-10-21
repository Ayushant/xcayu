#!/usr/bin/env node

/**
 * 🗄️ DATABASE INITIALIZATION SCRIPT
 * This script will:
 * 1. Connect to MongoDB
 * 2. Create all required collections
 * 3. Create a super admin user
 * 4. Verify the setup
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import readline from "readline";
import User from "./models/userModel.js";
import License from "./models/licenseModel.js";
import Course from "./models/courseModel.js";
import Quiz from "./models/quizModel.js";
import Simulation from "./models/simulationModel.js";
import Result from "./models/resultModel.js";
import Score from "./models/scoreModel.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('═══════════════════════════════════════════════════════');
console.log('🗄️  XACTION DATABASE INITIALIZATION');
console.log('═══════════════════════════════════════════════════════\n');

const initializeDatabase = async () => {
  try {
    // Step 1: Check environment variables
    console.log('📋 Step 1: Checking configuration...');
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file!');
      console.log('\n💡 Please add MONGO_URI to your Backend/.env file');
      console.log('   Example for local: MONGO_URI=mongodb://127.0.0.1:27017/quizdb');
      console.log('   Example for Atlas: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/quizdb');
      process.exit(1);
    }
    console.log('✅ Configuration found');
    console.log(`   MongoDB URI: ${process.env.MONGO_URI.substring(0, 30)}...`);

    // Step 2: Connect to MongoDB
    console.log('\n📋 Step 2: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`   Database: ${mongoose.connection.name}`);

    // Step 3: Verify all models/collections
    console.log('\n📋 Step 3: Verifying database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = [
      { name: 'users', model: User },
      { name: 'licenses', model: License },
      { name: 'courses', model: Course },
      { name: 'quizzes', model: Quiz },
      { name: 'simulations', model: Simulation },
      { name: 'results', model: Result },
      { name: 'scores', model: Score }
    ];

    for (const { name, model } of requiredCollections) {
      if (collectionNames.includes(name)) {
        const count = await model.countDocuments();
        console.log(`   ✅ ${name.padEnd(15)} - ${count} documents`);
      } else {
        console.log(`   ℹ️  ${name.padEnd(15)} - will be created on first use`);
      }
    }

    // Step 4: Check for existing super admin
    console.log('\n📋 Step 4: Checking for super admin...');
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists!');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.fullName}`);
      
      const update = await question('\n❓ Do you want to update/reset this super admin? (yes/no): ');
      
      if (update.toLowerCase() !== 'yes') {
        console.log('\n✅ Keeping existing super admin');
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 Database is ready!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n📝 Login credentials:');
        console.log(`   Email: ${existingSuperAdmin.email}`);
        console.log('   Password: (your existing password)');
        console.log('\n🚀 Start the backend: npm start');
        console.log('🌐 Login at: http://localhost:3000/admin-login');
        rl.close();
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    // Step 5: Create super admin
    console.log('\n📋 Step 5: Creating super admin user...');
    console.log('');
    
    const email = await question('👤 Enter super admin email [superadmin@example.com]: ') 
      || 'superadmin@example.com';
    
    let password = await question('🔑 Enter super admin password (min 8 characters): ');
    
    while (password.length < 8) {
      console.log('❌ Password must be at least 8 characters!');
      password = await question('🔑 Enter super admin password (min 8 characters): ');
    }
    
    const fullName = await question('📛 Enter super admin full name [Super Administrator]: ')
      || 'Super Administrator';

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingSuperAdmin) {
      // Update existing
      existingSuperAdmin.email = email;
      existingSuperAdmin.password = hashedPassword;
      existingSuperAdmin.fullName = fullName;
      existingSuperAdmin.isActive = true;
      await existingSuperAdmin.save();
      console.log('\n✅ Super admin updated successfully!');
    } else {
      // Create new
      const superAdmin = new User({
        email,
        password: hashedPassword,
        role: 'superadmin',
        fullName,
        isActive: true
      });
      await superAdmin.save();
      console.log('\n✅ Super admin created successfully!');
    }

    // Step 6: Verify setup
    console.log('\n📋 Step 6: Verifying setup...');
    const allUsers = await User.find();
    const superAdmins = await User.find({ role: 'superadmin' });
    
    console.log(`   Total users: ${allUsers.length}`);
    console.log(`   Super admins: ${superAdmins.length}`);
    console.log(`   Other users: ${allUsers.length - superAdmins.length}`);

    // Final summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 DATABASE INITIALIZATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Collections: ${collections.length}`);
    console.log(`   Super Admin Email: ${email}`);
    console.log(`   Super Admin Name: ${fullName}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start backend: npm start');
    console.log('   2. Open browser: http://localhost:3000/admin-login');
    console.log(`   3. Login with email: ${email}`);
    console.log('   4. Use the password you just created');
    
    console.log('\n⚠️  IMPORTANT: Store your credentials securely!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.name === 'MongoServerSelectionError' || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUTION: MongoDB is not running!');
      console.log('   Option 1: Install MongoDB locally');
      console.log('   - Download: https://www.mongodb.com/try/download/community');
      console.log('   - Start service: net start MongoDB');
      console.log('');
      console.log('   Option 2: Use MongoDB Atlas (Free Cloud Database)');
      console.log('   - See: QUICK_MONGODB_ATLAS_SETUP.md');
      console.log('   - Update MONGO_URI in .env with your Atlas connection string');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 SOLUTION: Authentication failed!');
      console.log('   - Check username and password in MONGO_URI');
      console.log('   - For Atlas: verify database user credentials');
    } else {
      console.log('\nFull error:', error);
    }
    
    console.log('\n📖 For detailed setup instructions:');
    console.log('   - Local MongoDB: SETUP_MONGODB.md');
    console.log('   - Cloud MongoDB: QUICK_MONGODB_ATLAS_SETUP.md');
  } finally {
    rl.close();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
};

// Run initialization
initializeDatabase();
