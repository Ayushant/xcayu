import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';

dotenv.config();

const DEFAULT_EMAIL = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
const DEFAULT_PASSWORD = process.argv[2] || process.env.SUPERADMIN_PASSWORD || 'admin123';
const DEFAULT_FULLNAME = process.env.SUPERADMIN_FULLNAME || 'Super Administrator';

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MONGO_URI is not set in Backend/.env. Please configure it and try again.');
  process.exit(1);
}

const createOrUpdateSuperAdmin = async (email, password, fullName) => {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email, role: 'superadmin' });
    const hashed = await bcrypt.hash(password, 10);

    if (existing) {
      existing.password = hashed;
      existing.fullName = fullName;
      existing.isActive = true;
      await existing.save();
      console.log(`🔄 Updated existing superadmin: ${email}`);
    } else {
      const user = new User({
        email,
        password: hashed,
        role: 'superadmin',
        fullName,
        isActive: true
      });
      await user.save();
      console.log(`✅ Created superadmin: ${email}`);
    }

    const count = await User.countDocuments({ role: 'superadmin' });
    console.log(`Total superadmins in DB: ${count}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating/updating superadmin:', err.message);
    process.exit(1);
  }
};

createOrUpdateSuperAdmin(DEFAULT_EMAIL, DEFAULT_PASSWORD, DEFAULT_FULLNAME);
