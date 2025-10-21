import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * License Alert Banner
 * 
 * Displays real-time license alerts at the top of the dashboard
 * Shows expired licenses, limit warnings, and manual disables
 * 
 * Used by Super Admins and College Admins to monitor license status
 */
const LicenseAlertBanner = () => {
  const { licenseAlerts, removeAlert, clearLicenseAlerts } = useSocket();
  const [isExpanded, setIsExpanded] = useState(false);

  if (licenseAlerts.length === 0) {
    return null;
  }

  const getAlertStyles = (type) => {
    switch (type) {
      case 'expired':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'limit':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'disabled':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'reactivated':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'expired':
        return '🔒';
      case 'limit':
        return '⚠️';
      case 'disabled':
        return '🔴';
      case 'reactivated':
        return '🟢';
      default:
        return '📢';
    }
  };

  const latestAlert = licenseAlerts[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
      {/* Main Alert Banner */}
      <div className={`border-b-2 shadow-lg ${getAlertStyles(latestAlert.type)}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-2xl">{getAlertIcon(latestAlert.type)}</span>
              <div className="flex-1">
                <p className="font-semibold">{latestAlert.message}</p>
                <p className="text-sm opacity-75">
                  {new Date(latestAlert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {licenseAlerts.length > 1 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-3 py-1 rounded-lg bg-white bg-opacity-50 hover:bg-opacity-75 transition"
                >
                  {isExpanded ? '▲' : '▼'} {licenseAlerts.length} Alerts
                </button>
              )}
              <button
                onClick={clearLicenseAlerts}
                className="px-3 py-1 rounded-lg bg-white bg-opacity-50 hover:bg-opacity-75 transition"
              >
                Clear All
              </button>
              <button
                onClick={() => removeAlert(0)}
                className="text-2xl hover:opacity-75 transition"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Alert List */}
      {isExpanded && licenseAlerts.length > 1 && (
        <div className="bg-white border-b shadow-lg max-h-96 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="space-y-2">
              {licenseAlerts.slice(1).map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getAlertStyles(alert.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <span>{getAlertIcon(alert.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs opacity-75">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAlert(index + 1)}
                      className="text-lg hover:opacity-75 transition ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseAlertBanner;

