import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailReports: true,
    autoBackup: false,
    darkMode: false,
    language: 'english'
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="max-w-3xl">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold mr-6">
              SA
            </div>
            <div>
              <h4 className="font-medium">Super Administrator</h4>
              <p className="text-gray-500 text-sm">admin@marsinc.com</p>
              <button className="mt-2 text-orange-500 text-sm hover:text-orange-600">
                Change Profile Picture
              </button>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          
          <div className="space-y-6">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications about quiz completions</p>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.notifications ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Email Reports */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Reports</h4>
                <p className="text-sm text-gray-500">Receive daily summary reports</p>
              </div>
              <button
                onClick={() => handleToggle('emailReports')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.emailReports ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.emailReports ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Auto Backup */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automatic Backup</h4>
                <p className="text-sm text-gray-500">Backup quiz data every 24 hours</p>
              </div>
              <button
                onClick={() => handleToggle('autoBackup')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.autoBackup ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.autoBackup ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Language</h4>
                <p className="text-sm text-gray-500">Select your preferred language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="form-select rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
          
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-between">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-gray-500">Update your password</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-between">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
