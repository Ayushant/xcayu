import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNav = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/be/admin/dashboard' },
    { name: 'Management', path: '/be/admin/management' }
  ];

  return (
    <nav className="border-b border-gray-200">
      <div className="flex space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
              location.pathname === item.path
                ? 'border-b-2 border-orange-500 text-gray-900'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};


export default AdminNav;
