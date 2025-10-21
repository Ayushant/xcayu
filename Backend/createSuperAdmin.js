import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";
import readline from "readline";

dotenv.config();

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createSuperAdmin = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Get admin email
    const email = await question("Enter Super Admin email (default: superadmin@example.com): ") 
      || "superadmin@example.com";
    
    // Get admin password
    const password = await question("Enter Super Admin password (minimum 8 characters): ");
    
    if (password.length < 8) {
      console.error("❌ Password must be at least 8 characters long!");
      process.exit(1);
    }

    const fullName = await question("Enter Super Admin full name (default: Super Administrator): ")
      || "Super Administrator";

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      email: email, 
      role: "superadmin" 
    });

    if (existingSuperAdmin) {
      const update = await question("⚠️  Super admin with this email already exists. Update password? (yes/no): ");
      
      if (update.toLowerCase() === 'yes') {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingSuperAdmin.password = hashedPassword;
        existingSuperAdmin.fullName = fullName;
        existingSuperAdmin.isActive = true;
        await existingSuperAdmin.save();
        
        console.log("✅ Super admin updated successfully!");
        console.log("📧 Email:", email);
      } else {
        console.log("❌ Super admin creation cancelled");
      }
    } else {
      console.log("👤 Creating new super admin user...");
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create super admin user
      const superAdmin = new User({
        email: email,
        password: hashedPassword,
        role: "superadmin",
        fullName: fullName,
        isActive: true
      });

      await superAdmin.save();
      console.log("✅ Super admin created successfully!");
      console.log("📧 Email:", email);
    }

    console.log("\n🎉 Setup complete! You can now login with the credentials you provided.");
    console.log("⚠️  IMPORTANT: Store these credentials securely!");

  } catch (error) {
    console.error("❌ Error creating super admin:", error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

createSuperAdmin();
