import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
// Toast notifications disabled (silent mode)
const toast = { success: () => {}, error: () => {}, loading: () => {}, info: () => {}, warning: () => {}, promise: () => {}, custom: () => {}, dismiss: () => {} };

/**
 * Socket Context
 * 
 * Provides real-time Socket.IO connection across the application
 * Handles license status changes, alerts, and live updates
 */

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [licenseAlerts, setLicenseAlerts] = useState([]);
  const [licenseStatus, setLicenseStatus] = useState({});

  useEffect(() => {
    // Initialize Socket.IO connection
    // Get Socket URL from environment variables with fallback
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('🔌 Socket.IO connected:', socketInstance.id);
      }
      setIsConnected(true);

      // Get user info from localStorage
      const userRole = localStorage.getItem('userRole');
      const userId = localStorage.getItem('userId');
      const userCollege = localStorage.getItem('userCollege');

      // Join appropriate rooms based on role
      if (userRole === 'superadmin') {
        socketInstance.emit('join-admin-room');
      }

      if (userId) {
        socketInstance.emit('join-user-room', userId);
      }

      if (userCollege) {
        socketInstance.emit('join-college-room', userCollege);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // License event listeners
    setupLicenseListeners(socketInstance);

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const setupLicenseListeners = (socketInstance) => {
    // License expired event
    socketInstance.on('license:expired', (data) => {
      console.log('⚠️ License expired:', data);
      
      addLicenseAlert({
        type: 'expired',
        college: data.college,
        message: `License for ${data.college} has expired`,
        timestamp: new Date(),
        data
      });

      toast.error(
        `License for ${data.college} has expired. Simulations are now locked.`,
        { duration: 8000, icon: '🔒' }
      );

      setLicenseStatus(prev => ({
        ...prev,
        [data.college]: { ...data, blocked: true, reason: 'expired' }
      }));
    });

    // License limit reached event
    socketInstance.on('license:limitReached', (data) => {
      console.log('⚠️ License limit reached:', data);
      
      addLicenseAlert({
        type: 'limit',
        college: data.college,
        message: `Student limit reached for ${data.college}`,
        timestamp: new Date(),
        data
      });

      toast.warning(
        `Student limit reached for ${data.college} (${data.currentStudents}/${data.maxStudents})`,
        { duration: 6000, icon: '⚠️' }
      );

      setLicenseStatus(prev => ({
        ...prev,
        [data.college]: { ...data, blocked: false, reason: 'limit' }
      }));
    });

    // License manually disabled event
    socketInstance.on('license:disabled', (data) => {
      console.log('🔴 License disabled:', data);
      
      addLicenseAlert({
        type: 'disabled',
        college: data.college,
        message: `License for ${data.college} has been disabled`,
        timestamp: new Date(),
        data
      });

      toast.error(
        data.message || 'Your license has been disabled by administration.',
        { duration: 8000, icon: '🔴' }
      );

      setLicenseStatus(prev => ({
        ...prev,
        [data.college]: { ...data, blocked: true, reason: 'disabled' }
      }));
    });

    // License reactivated event
    socketInstance.on('license:reactivated', (data) => {
      console.log('🟢 License reactivated:', data);
      
      addLicenseAlert({
        type: 'reactivated',
        college: data.college,
        message: `License for ${data.college} has been reactivated`,
        timestamp: new Date(),
        data
      });

      toast.success(
        data.message || 'Your license has been reactivated. You can now access all features.',
        { duration: 6000, icon: '🟢' }
      );

      setLicenseStatus(prev => ({
        ...prev,
        [data.college]: { ...data, blocked: false, reason: null }
      }));
    });

    // General license status changed
    socketInstance.on('license:statusChanged', (data) => {
      console.log('📊 License status changed:', data);
      
      setLicenseStatus(prev => ({
        ...prev,
        [data.college]: data
      }));
    });

    // Student created event
    socketInstance.on('student-created', (data) => {
      console.log('👤 Student created:', data);
      toast.success(`New student added: ${data.student.name}`);
    });

    // New score submitted
    socketInstance.on('new-score', (data) => {
      console.log('📝 New score submitted:', data);
    });
  };

  const addLicenseAlert = (alert) => {
    setLicenseAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
  };

  const clearLicenseAlerts = () => {
    setLicenseAlerts([]);
  };

  const removeAlert = (index) => {
    setLicenseAlerts(prev => prev.filter((_, i) => i !== index));
  };

  const getLicenseStatusByCollege = (college) => {
    return licenseStatus[college] || null;
  };

  const isLicenseBlocked = (college) => {
    const status = licenseStatus[college];
    return status?.blocked === true;
  };

  const value = {
    socket,
    isConnected,
    licenseAlerts,
    licenseStatus,
    clearLicenseAlerts,
    removeAlert,
    getLicenseStatusByCollege,
    isLicenseBlocked
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;

