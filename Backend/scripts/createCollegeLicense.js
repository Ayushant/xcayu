import mongoose from 'mongoose';
import dotenv from 'dotenv';
import License from '../models/licenseModel.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-app');
    console.log('✅ Connected to database\n');

    // Check if license already exists
    const existing = await License.findOne({ email: 'admin@gtu.edu' });
    if (existing) {
      console.log('❌ License already exists with email: admin@gtu.edu');
      console.log(`   College: ${existing.college}`);
      console.log(`   Status: ${existing.status}`);
      console.log(`   Expiry: ${existing.expiryDate}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create test license for college admin
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity

    const license = new License({
      college: 'gtu',
      email: 'admin@gtu.edu',
      password: 'admin123', // Plain text as per current schema
      maxStudents: 100,
      currentStudents: 0,
      expiryDate: expiryDate,
      status: 'Active'
    });

    await license.save();

    console.log('✅ License Created Successfully!');
    console.log('='.repeat(50));
    console.log(`   College: ${license.college}`);
    console.log(`   Email: ${license.email}`);
    console.log(`   Password: ${license.password}`);
    console.log(`   Max Students: ${license.maxStudents}`);
    console.log(`   Status: ${license.status}`);
    console.log(`   Expiry Date: ${license.expiryDate.toDateString()}`);
    console.log('='.repeat(50));

    console.log('\n🔐 COLLEGE ADMIN LOGIN CREDENTIALS:');
    console.log(`   Email: admin@gtu.edu`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin (College Admin)`);

    await mongoose.disconnect();
    console.log('\n✅ Done! License created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating license:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
