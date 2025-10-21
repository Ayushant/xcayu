import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DashboardNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('DashboardNavbar logout clicked');
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    console.log('Redirecting to /simulation');
    navigate("/simulation");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold tracking-wide">Super Admin Panel</div>
      <ul className="flex space-x-6 text-sm font-medium items-center">
        <li><Link to="/superadmin/dashboard" className="hover:text-cyan-400">Overview</Link></li>
        <li><Link to="/superadmin/licenses" className="hover:text-cyan-400">Licenses</Link></li>
        <li><Link to="/superadmin/quizzes" className="hover:text-cyan-400">Quizzes</Link></li>
        <li><Link to="/superadmin/reports" className="hover:text-cyan-400">Reports</Link></li>
        <li><Link to="/superadmin/settings" className="hover:text-cyan-400">Settings</Link></li>
        <li>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default DashboardNavbar;
