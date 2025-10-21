import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
  console.log('✅ Connected to database\n');

  // Check if GTU admin already exists
  const existing = await User.findOne({ email: 'admin@gtu.edu' });
  if (existing) {
    console.log('❌ Admin already exists with email: admin@gtu.edu');
    console.log(`   Name: ${existing.fullName}`);
    console.log(`   Role: ${existing.role}`);
    console.log(`   College: ${existing.college}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Create GTU admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const gtuAdmin = new User({
    fullName: 'GTU Admin',
    email: 'admin@gtu.edu',
    password: hashedPassword,
    role: 'admin',
    college: 'gtu'
  });

  await gtuAdmin.save();
  
  console.log('✅ GTU Admin Created Successfully!');
  console.log('='.repeat(50));
  console.log(`   Name: ${gtuAdmin.fullName}`);
  console.log(`   Email: ${gtuAdmin.email}`);
  console.log(`   Password: admin123`);
  console.log(`   Role: ${gtuAdmin.role}`);
  console.log(`   College: ${gtuAdmin.college}`);
  console.log('='.repeat(50));
  console.log('\n🔐 LOGIN CREDENTIALS:');
  console.log(`   Email: admin@gtu.edu`);
  console.log(`   Password: admin123`);
  console.log('\nℹ️  This admin will ONLY see students from GTU college!');

  await mongoose.disconnect();
  console.log('\n✅ Done!');
  process.exit(0);
})();

