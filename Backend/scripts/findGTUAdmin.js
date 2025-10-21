import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app');
  
  const gtuAdmin = await User.findOne({ college: 'gtu', role: { $ne: 'student' } });
  console.log('\n🔍 GTU Admin User:');
  if (gtuAdmin) {
    console.log(`   Name: ${gtuAdmin.fullName}`);
    console.log(`   Email: ${gtuAdmin.email}`);
    console.log(`   Role: ${gtuAdmin.role}`);
    console.log(`   College: ${gtuAdmin.college}`);
  } else {
    console.log('   ❌ NOT FOUND - No admin user for GTU college!');
    console.log('   This is why filtering doesn\'t work!');
  }
  
  await mongoose.disconnect();
  process.exit(0);
})();

