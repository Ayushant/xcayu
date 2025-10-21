import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler.js';
import { scheduleLicenseExpiryJob } from './utils/licenseExpiryJob.js';
import { initializeLicenseWatcher } from './utils/licenseWatcher.js';
import { logger } from './utils/logger.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', missingEnvVars.join(', '));
  logger.error('Please check your .env file');
  process.exit(1);
}

// Routes
import superAdminRoutes from "./routes/superAdminRoutes.js";
import licenseRoutes from "./routes/licenseRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import collegeAdminRoutes from "./routes/collegeAdminRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import scoreEditRoutes from "./routes/scoreEditRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import quizProgressRoutes from "./routes/quizProgressRoutes.js";

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with environment-based origins
const socketOrigins = process.env.SOCKET_ORIGINS 
  ? process.env.SOCKET_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(httpServer, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.debug('Client connected:', socket.id);

  socket.on('disconnect', () => {
    logger.debug('Client disconnected:', socket.id);
  });

  // Join room for real-time updates
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    logger.debug('Admin joined room:', socket.id);
  });

  // Join user-specific room for targeted notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.debug(`User ${userId} joined personal room:`, socket.id);
  });

  // Join college room for college-wide notifications
  socket.on('join-college-room', (college) => {
    socket.join(`college-${college}`);
    logger.debug(`Joined college room: ${college}`, socket.id);
  });
});

// Export io for use in controllers
export { io };

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.get("/", (req, res) => {
  res.status(200).json({
    message: "✅ Quiz Backend API is running successfully!",
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1,
    socketIO: io ? "active" : "inactive",
  });
});










// CORS configuration with environment-based origins
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  maxAge: 86400 // CORS preflight cache for 24 hours
};

app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongoConnection: mongoose.connection.readyState === 1,
    socketIO: io ? 'active' : 'inactive'
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/collegeadmin", collegeAdminRoutes);
app.use("/api/college-admin", collegeAdminRoutes); // Support both hyphenated and non-hyphenated versions
app.use("/api/scores", scoreRoutes);
app.use("/api/score-edit", scoreEditRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-progress", quizProgressRoutes);
app.use("/api/simulations", simulationRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// MongoDB connection setup
mongoose.connection.on('connected', () => logger.success('MongoDB connected'));
mongoose.connection.on('error', err => logger.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// MongoDB connection with retry
const connectWithRetry = async () => {
  try {
    logger.info("Attempting to connect to MongoDB...");
    
    if (!process.env.MONGO_URI) {
      logger.error("MONGO_URI is not defined in environment variables");
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
      heartbeatFrequencyMS: 10000, // Check connection every 10s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      family: 4 // Force IPv4
    });

    // Note: For production, admin users should be created manually via scripts
    // Automatic seeding is disabled in production for security

    // Start server
    const server = httpServer.listen(PORT, () => {
      logger.success(`Server is running on PORT ${PORT}`);
      logger.info(`URL: http://localhost:${PORT}`);
      logger.info('Socket.IO: Active');
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Start license expiry job
      scheduleLicenseExpiryJob();
      
      // Initialize license watcher for real-time monitoring
      logger.info('Initializing License Watcher...');
      initializeLicenseWatcher(io);
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error('Server error:', err);
      }
    });

  } catch (err) {
    logger.error("MongoDB connection error:", err);
    
    // Check for specific MongoDB errors
    if (err.name === 'MongoServerSelectionError') {
      logger.error("Could not connect to MongoDB server. Please check if MongoDB is running.");
    } else if (err.name === 'MongoNetworkError') {
      logger.error("Network error connecting to MongoDB. Please check your network connection.");
    }
    
    logger.info("Retrying in 5 seconds...");
    setTimeout(connectWithRetry, 5000);
  }
};

// Initial connection attempt
logger.info('Starting Quiz Application Server...');
logger.info('Initializing database connection...');
connectWithRetry();
