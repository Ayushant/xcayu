import React from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import LicenseManagement from '../components/LicenseManagement';

const Licenses = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">License Management</h1>
        <LicenseManagement />
      </div>
    </div>
  );
};

export default Licenses;
