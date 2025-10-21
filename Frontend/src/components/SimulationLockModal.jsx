import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Simulation Lock Modal
 * 
 * Displays when a student's license becomes invalid during active session
 * Shows specific reason for lock (expired, disabled, limit reached)
 * Prevents further quiz/simulation attempts until license is restored
 * 
 * Triggered by real-time Socket.IO events
 */
const SimulationLockModal = ({ userCollege }) => {
  const { getLicenseStatusByCollege, isLicenseBlocked } = useSocket();
  const [isVisible, setIsVisible] = useState(false);
  const [lockReason, setLockReason] = useState(null);

  useEffect(() => {
    if (!userCollege) return;

    const status = getLicenseStatusByCollege(userCollege);
    const blocked = isLicenseBlocked(userCollege);

    if (blocked && status) {
      setLockReason(status);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [userCollege, getLicenseStatusByCollege, isLicenseBlocked]);

  if (!isVisible || !lockReason) {
    return null;
  }

  const getReasonDetails = () => {
    switch (lockReason.reason) {
      case 'expired':
        return {
          icon: '🔒',
          title: 'License Expired',
          message: `Your college license expired on ${new Date(lockReason.expiryDate).toLocaleDateString()}.`,
          details: 'All simulations and quizzes are temporarily unavailable. Please contact your college administrator to renew the license.',
          color: 'red'
        };
      case 'disabled':
        return {
          icon: '🔴',
          title: 'License Disabled',
          message: 'Your college license has been disabled by administration.',
          details: 'Access to simulations and quizzes is currently restricted. Please contact your college administrator for more information.',
          color: 'orange'
        };
      case 'limit':
        return {
          icon: '⚠️',
          title: 'Student Limit Reached',
          message: `Your college has reached the maximum student limit (${lockReason.maxStudents}).`,
          details: 'New simulation access may be restricted. Contact your college administrator to increase the student limit.',
          color: 'yellow'
        };
      default:
        return {
          icon: '⚠️',
          title: 'Access Restricted',
          message: 'Your license is currently unavailable.',
          details: 'Please contact your college administrator.',
          color: 'gray'
        };
    }
  };

  const details = getReasonDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform animate-scaleIn">
        {/* Header */}
        <div className={`bg-${details.color}-500 text-white p-6 rounded-t-xl text-center`}>
          <div className="text-6xl mb-3">{details.icon}</div>
          <h2 className="text-2xl font-bold">{details.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {details.message}
            </p>
            <p className="text-gray-600">
              {details.details}
            </p>
          </div>

          {/* License Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">College:</span>
              <span className="font-semibold">{lockReason.college}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold text-${details.color}-600`}>
                {lockReason.status}
              </span>
            </div>
            {lockReason.expiryDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expiry Date:</span>
                <span className="font-semibold">
                  {new Date(lockReason.expiryDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {lockReason.currentStudents && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Students:</span>
                <span className="font-semibold">
                  {lockReason.currentStudents} / {lockReason.maxStudents}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
            >
              Dismiss (Temporarily)
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>For immediate assistance, contact your college administrator</p>
            <p className="mt-1">or email support@yourdomain.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationLockModal;

// Add these animations to your global CSS or Tailwind config
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out;
}

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}
*/

