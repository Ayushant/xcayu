/**
 * Production-ready logger utility
 * Uses console in development, can be extended with Winston or similar for production
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
  info(message, ...args) {
    if (isDevelopment) {
      console.log(`ℹ️  [INFO] ${message}`, ...args);
    }
  }

  success(message, ...args) {
    if (isDevelopment) {
      console.log(`✅ [SUCCESS] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    console.warn(`⚠️  [WARN] ${message}`, ...args);
  }

  error(message, error) {
    console.error(`❌ [ERROR] ${message}`, error?.message || error);
    if (isDevelopment && error?.stack) {
      console.error(error.stack);
    }
  }

  debug(message, ...args) {
    if (isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();

