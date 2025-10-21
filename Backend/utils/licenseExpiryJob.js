import License from '../models/licenseModel.js';

/**
 * License expiry management utility
 * This should be run as a cron job (e.g., daily at midnight)
 */

// Check and update expired licenses
export const checkAndUpdateExpiredLicenses = async () => {
  try {
    console.log('🔍 Checking for expired licenses...');
    
    const now = new Date();
    
    // Find all licenses that have expired but are still marked as Active
    const expiredLicenses = await License.find({
      expiryDate: { $lt: now },
      status: 'Active'
    });

    if (expiredLicenses.length === 0) {
      console.log('✅ No expired licenses found');
      return {
        success: true,
        expiredCount: 0
      };
    }

    console.log(`⚠️  Found ${expiredLicenses.length} expired licenses`);

    // Update all expired licenses to 'Expired' status
    const updateResult = await License.updateMany(
      {
        expiryDate: { $lt: now },
        status: 'Active'
      },
      {
        $set: { status: 'Expired' }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} licenses to Expired status`);

    // Log details of expired licenses
    expiredLicenses.forEach(license => {
      console.log(`   - ${license.college} (expired on ${license.expiryDate.toLocaleDateString()})`);
    });

    return {
      success: true,
      expiredCount: updateResult.modifiedCount,
      expiredLicenses: expiredLicenses.map(l => ({
        college: l.college,
        email: l.email,
        expiryDate: l.expiryDate
      }))
    };

  } catch (error) {
    console.error('❌ Error checking expired licenses:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get licenses expiring soon (within specified days)
export const getLicensesExpiringSoon = async (daysThreshold = 30) => {
  try {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const expiringLicenses = await License.find({
      expiryDate: {
        $gte: now,
        $lte: thresholdDate
      },
      status: 'Active'
    }).sort({ expiryDate: 1 });

    return {
      success: true,
      count: expiringLicenses.length,
      licenses: expiringLicenses
    };

  } catch (error) {
    console.error('Error fetching licenses expiring soon:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send notifications for expiring licenses (placeholder - integrate with email service)
export const notifyExpiringLicenses = async (daysThreshold = 7) => {
  try {
    const result = await getLicensesExpiringSoon(daysThreshold);
    
    if (!result.success || result.count === 0) {
      console.log('No licenses expiring soon');
      return result;
    }

    console.log(`📧 Sending notifications for ${result.count} licenses expiring within ${daysThreshold} days`);

    // TODO: Integrate with email service (e.g., nodemailer, SendGrid)
    // For now, just log the licenses
    result.licenses.forEach(license => {
      const daysLeft = Math.ceil((license.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   - ${license.college}: ${daysLeft} days left (${license.email})`);
    });

    return {
      success: true,
      notificationsSent: result.count
    };

  } catch (error) {
    console.error('Error sending expiry notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Main cron job function
export const runLicenseExpiryJob = async () => {
  console.log('\n⏰ Running License Expiry Job...');
  console.log(`   Time: ${new Date().toLocaleString()}\n`);

  // Check and update expired licenses
  const expiredResult = await checkAndUpdateExpiredLicenses();

  // Check for licenses expiring soon (within 7 days)
  const expiringResult = await getLicensesExpiringSoon(7);
  
  if (expiringResult.success && expiringResult.count > 0) {
    console.log(`\n⚠️  Warning: ${expiringResult.count} licenses expiring within 7 days`);
    await notifyExpiringLicenses(7);
  }

  console.log('\n✅ License Expiry Job completed\n');

  return {
    expired: expiredResult,
    expiringSoon: expiringResult
  };
};

// Schedule the job to run daily at midnight
export const scheduleLicenseExpiryJob = () => {
  // Run immediately on startup
  runLicenseExpiryJob();

  // Run every 24 hours (86400000 milliseconds)
  setInterval(runLicenseExpiryJob, 24 * 60 * 60 * 1000);

  console.log('📅 License expiry job scheduled (runs daily at midnight)');
};

export default {
  checkAndUpdateExpiredLicenses,
  getLicensesExpiringSoon,
  notifyExpiringLicenses,
  runLicenseExpiryJob,
  scheduleLicenseExpiryJob
};

