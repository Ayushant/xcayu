import License from '../models/licenseModel.js';
import User from '../models/userModel.js';

/**
 * License Watcher Utility
 * 
 * Purpose: Monitor license status changes and emit real-time events
 * Integrates with Socket.IO to notify all affected users immediately
 * 
 * Events Emitted:
 * - license:expired - When license expires
 * - license:limitReached - When student limit is reached
 * - license:manualDisable - When Super Admin disables a license
 * - license:reactivated - When license is reactivated
 */

class LicenseWatcher {
  constructor(io) {
    this.io = io;
    this.licenseCache = new Map(); // Cache previous license states
  }

  /**
   * Initialize the watcher with Socket.IO instance
   */
  initialize() {
    console.log('📡 License Watcher initialized');
    
    // Start monitoring every minute
    this.startMonitoring();
  }

  /**
   * Start continuous monitoring of license status
   */
  startMonitoring() {
    // Check immediately
    this.checkAllLicenses();
    
    // Then check every minute
    setInterval(() => {
      this.checkAllLicenses();
    }, 60000); // 60 seconds

    console.log('👀 License monitoring started (checks every 60 seconds)');
  }

  /**
   * Check all licenses for status changes
   */
  async checkAllLicenses() {
    try {
      const licenses = await License.find();
      const now = new Date();

      for (const license of licenses) {
        const previousState = this.licenseCache.get(license._id.toString());
        
        // Get current student count
        const currentStudentCount = await User.countDocuments({
          role: 'student',
          college: license.college
        });

        // Update license with current count
        await License.findByIdAndUpdate(license._id, {
          currentStudents: currentStudentCount
        });

        // Determine current status
        const isExpired = license.expiryDate < now;
        const isLimitReached = currentStudentCount >= license.maxStudents;
        const isDisabled = license.status === 'Suspended' || license.status === 'Expired';

        let newStatus = 'Active';
        let reason = null;

        if (isDisabled && license.status !== 'Active') {
          newStatus = license.status;
          reason = 'manual_disable';
        } else if (isExpired) {
          newStatus = 'Expired';
          reason = 'expired';
        } else if (isLimitReached) {
          newStatus = 'Active'; // Keep active but flag limit
          reason = 'limit_reached';
        }

        // Update status if changed
        if (license.status !== newStatus && newStatus === 'Expired') {
          await License.findByIdAndUpdate(license._id, {
            status: newStatus
          });
        }

        // Check for state changes
        const currentState = {
          status: newStatus,
          isLimitReached,
          reason
        };

        // Emit events if state changed
        if (!previousState || this.hasStateChanged(previousState, currentState)) {
          await this.emitLicenseStatusChange(license, currentState, previousState);
        }

        // Update cache
        this.licenseCache.set(license._id.toString(), currentState);
      }
    } catch (error) {
      console.error('Error in license monitoring:', error);
    }
  }

  /**
   * Check if license state has changed
   */
  hasStateChanged(previousState, currentState) {
    return (
      previousState.status !== currentState.status ||
      previousState.isLimitReached !== currentState.isLimitReached ||
      previousState.reason !== currentState.reason
    );
  }

  /**
   * Emit Socket.IO events for license status changes
   */
  async emitLicenseStatusChange(license, currentState, previousState) {
    const eventData = {
      college: license.college,
      licenseId: license._id,
      status: currentState.status,
      reason: currentState.reason,
      currentStudents: license.currentStudents,
      maxStudents: license.maxStudents,
      expiryDate: license.expiryDate,
      timestamp: new Date()
    };

    // Log the change
    console.log(`⚠️  License Status Change:`, {
      college: license.college,
      from: previousState?.status || 'unknown',
      to: currentState.status,
      reason: currentState.reason
    });

    // Emit to admin room (Super Admins)
    this.io.to('admin-room').emit('license:statusChanged', eventData);

    // Emit specific events based on reason
    if (currentState.reason === 'expired') {
      this.io.to('admin-room').emit('license:expired', eventData);
      
      // Notify all students from this college
      await this.notifyCollegeUsers(license.college, 'license:expired', {
        message: 'Your college license has expired. Simulations and quizzes are temporarily unavailable.',
        ...eventData
      });
    }

    if (currentState.reason === 'limit_reached') {
      this.io.to('admin-room').emit('license:limitReached', eventData);
      
      // Notify college admins
      await this.notifyCollegeAdmins(license.college, 'license:limitReached', {
        message: 'Student limit reached. No new students can be added.',
        ...eventData
      });
    }

    if (currentState.reason === 'manual_disable') {
      this.io.to('admin-room').emit('license:manualDisable', eventData);
      
      // Notify all college users
      await this.notifyCollegeUsers(license.college, 'license:disabled', {
        message: 'Your college license has been disabled. Please contact administration.',
        ...eventData
      });
    }

    // Check if license was reactivated
    if (previousState?.status !== 'Active' && currentState.status === 'Active' && !currentState.isLimitReached) {
      this.io.to('admin-room').emit('license:reactivated', eventData);
      
      await this.notifyCollegeUsers(license.college, 'license:reactivated', {
        message: 'Your college license is now active. You can access simulations and quizzes.',
        ...eventData
      });
    }
  }

  /**
   * Notify all users from a specific college
   */
  async notifyCollegeUsers(college, event, data) {
    try {
      const users = await User.find({ college, role: { $in: ['student', 'admin', 'collegeAdmin'] } });
      
      users.forEach(user => {
        this.io.to(`user-${user._id}`).emit(event, data);
      });

      console.log(`📤 Notified ${users.length} users from ${college} about ${event}`);
    } catch (error) {
      console.error('Error notifying college users:', error);
    }
  }

  /**
   * Notify college admins specifically
   */
  async notifyCollegeAdmins(college, event, data) {
    try {
      const admins = await User.find({ college, role: { $in: ['admin', 'collegeAdmin'] } });
      
      admins.forEach(admin => {
        this.io.to(`user-${admin._id}`).emit(event, data);
      });

      console.log(`📤 Notified ${admins.length} admins from ${college} about ${event}`);
    } catch (error) {
      console.error('Error notifying college admins:', error);
    }
  }

  /**
   * Manually trigger license check (called when Super Admin updates a license)
   */
  async checkLicense(licenseId) {
    try {
      const license = await License.findById(licenseId);
      if (!license) return;

      const currentStudentCount = await User.countDocuments({
        role: 'student',
        college: license.college
      });

      const now = new Date();
      const isExpired = license.expiryDate < now;
      const isLimitReached = currentStudentCount >= license.maxStudents;

      const currentState = {
        status: license.status,
        isLimitReached,
        reason: isExpired ? 'expired' : isLimitReached ? 'limit_reached' : null
      };

      const previousState = this.licenseCache.get(license._id.toString());
      
      await this.emitLicenseStatusChange(license, currentState, previousState);
      this.licenseCache.set(license._id.toString(), currentState);

      return currentState;
    } catch (error) {
      console.error('Error checking license:', error);
      throw error;
    }
  }

  /**
   * Handle manual license disable by Super Admin
   */
  async handleManualDisable(licenseId, disabledBy) {
    try {
      const license = await License.findByIdAndUpdate(
        licenseId,
        { status: 'Suspended' },
        { new: true }
      );

      if (!license) {
        throw new Error('License not found');
      }

      const eventData = {
        college: license.college,
        licenseId: license._id,
        status: 'Suspended',
        reason: 'manual_disable',
        disabledBy,
        timestamp: new Date()
      };

      // Emit to admin room
      this.io.to('admin-room').emit('license:manualDisable', eventData);

      // Notify all college users
      await this.notifyCollegeUsers(license.college, 'license:disabled', {
        message: 'Your college license has been disabled by administration.',
        ...eventData
      });

      // Update cache
      this.licenseCache.set(license._id.toString(), {
        status: 'Suspended',
        isLimitReached: false,
        reason: 'manual_disable'
      });

      console.log(`🔴 License manually disabled: ${license.college} by ${disabledBy}`);

      return license;
    } catch (error) {
      console.error('Error handling manual disable:', error);
      throw error;
    }
  }

  /**
   * Handle manual license reactivation
   */
  async handleManualReactivate(licenseId, reactivatedBy) {
    try {
      const license = await License.findByIdAndUpdate(
        licenseId,
        { status: 'Active' },
        { new: true }
      );

      if (!license) {
        throw new Error('License not found');
      }

      const eventData = {
        college: license.college,
        licenseId: license._id,
        status: 'Active',
        reason: 'manual_reactivate',
        reactivatedBy,
        timestamp: new Date()
      };

      // Emit to admin room
      this.io.to('admin-room').emit('license:reactivated', eventData);

      // Notify all college users
      await this.notifyCollegeUsers(license.college, 'license:reactivated', {
        message: 'Your college license has been reactivated. You can now access all features.',
        ...eventData
      });

      // Update cache
      this.licenseCache.set(license._id.toString(), {
        status: 'Active',
        isLimitReached: false,
        reason: null
      });

      console.log(`🟢 License manually reactivated: ${license.college} by ${reactivatedBy}`);

      return license;
    } catch (error) {
      console.error('Error handling manual reactivate:', error);
      throw error;
    }
  }

  /**
   * Get current license status (for API endpoint)
   */
  async getLicenseStatus(college) {
    try {
      const license = await License.findOne({ college });
      if (!license) {
        return { status: 'not_found', message: 'No license found for this college' };
      }

      const currentStudentCount = await User.countDocuments({
        role: 'student',
        college
      });

      const now = new Date();
      const isExpired = license.expiryDate < now;
      const isLimitReached = currentStudentCount >= license.maxStudents;
      const isDisabled = license.status === 'Suspended';

      return {
        status: license.status,
        college: license.college,
        isExpired,
        isLimitReached,
        isDisabled,
        currentStudents: currentStudentCount,
        maxStudents: license.maxStudents,
        expiryDate: license.expiryDate,
        daysUntilExpiry: Math.ceil((license.expiryDate - now) / (1000 * 60 * 60 * 24)),
        canAccessSimulations: !isExpired && !isDisabled && license.status === 'Active'
      };
    } catch (error) {
      console.error('Error getting license status:', error);
      throw error;
    }
  }
}

// Export singleton instance
let licenseWatcherInstance = null;

export const initializeLicenseWatcher = (io) => {
  if (!licenseWatcherInstance) {
    licenseWatcherInstance = new LicenseWatcher(io);
    licenseWatcherInstance.initialize();
  }
  return licenseWatcherInstance;
};

export const getLicenseWatcher = () => {
  if (!licenseWatcherInstance) {
    throw new Error('License watcher not initialized. Call initializeLicenseWatcher first.');
  }
  return licenseWatcherInstance;
};

export default LicenseWatcher;

