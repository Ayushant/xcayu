import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use simulationdb as the default database
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simulationdb';
    await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected to: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
