import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const handleLogout = () => {
    localStorage.removeItem("user"); // clear session
    localStorage.removeItem("token"); // clear auth token
    localStorage.removeItem("userRole"); // clear user role
    setIsMobileMenuOpen(false); // close mobile menu
    navigate("/simulation"); // redirect to simulation
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo">xaction.in</div>

        {/* Desktop Navigation */}
        <ul className="navbar-desktop">
          <li><Link to="/" className="navbar-link">Home</Link></li>
          <li><Link to="/about" className="navbar-link">About</Link></li>
          <li><Link to="/simulation" className="navbar-link">Simulation</Link></li>
          <li><Link to="/contact" className="navbar-link">Contact</Link></li>

          {user && (
            <li>
              <button
                onClick={handleLogout}
                className="navbar-logout-btn"
              >
                Logout
              </button>
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="navbar-mobile-list">
          <li>
            <Link to="/" className="navbar-mobile-link" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="navbar-mobile-link" onClick={closeMobileMenu}>
              About
            </Link>
          </li>
          <li>
            <Link to="/simulation" className="navbar-mobile-link" onClick={closeMobileMenu}>
              Simulation
            </Link>
          </li>
          <li>
            <Link to="/contact" className="navbar-mobile-link" onClick={closeMobileMenu}>
              Contact
            </Link>
          </li>

          {user && (
            <li>
              <button
                onClick={handleLogout}
                className="navbar-logout-btn-mobile"
              >
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="navbar-overlay" 
          onClick={closeMobileMenu}
        ></div>
      )}

      <style jsx>{`
        /* Container */
        .navbar-container {
          background: white;
          color: #111827;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          position: relative;
          z-index: 50;
        }

        .navbar-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Logo */
        .navbar-logo {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Desktop Navigation */
        .navbar-desktop {
          display: none;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 1.5rem;
          align-items: center;
        }

        .navbar-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          padding: 0.5rem 0;
          position: relative;
        }

        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          transition: width 0.3s ease;
        }

        .navbar-link:hover {
          color: #2563eb;
        }

        .navbar-link:hover::after {
          width: 100%;
        }

        .navbar-logout-btn {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: none;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 44px;
        }

        .navbar-logout-btn:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .navbar-logout-btn:active {
          transform: translateY(0);
        }

        /* Mobile Menu Button */
        .navbar-mobile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          min-width: 44px;
          min-height: 44px;
          z-index: 60;
        }

        .hamburger {
          width: 24px;
          height: 20px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger span {
          display: block;
          width: 100%;
          height: 3px;
          background: #374151;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        /* Mobile Menu */
        .navbar-mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 280px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 55;
          overflow-y: auto;
          padding-top: 80px;
        }

        .navbar-mobile-menu.open {
          right: 0;
        }

        .navbar-mobile-list {
          list-style: none;
          margin: 0;
          padding: 1.5rem;
        }

        .navbar-mobile-link {
          display: block;
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          padding: 1rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          min-height: 44px;
        }

        .navbar-mobile-link:hover {
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }

        .navbar-logout-btn-mobile {
          width: 100%;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: white;
          padding: 1rem;
          border-radius: 8px;
          border: none;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1rem;
          min-height: 44px;
        }

        .navbar-logout-btn-mobile:hover {
          background: linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        /* Overlay */
        .navbar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 54;
        }

        /* Mobile: 320px - 767px */
        @media (max-width: 767px) {
          .navbar-content {
            padding: 1rem;
          }

          .navbar-logo {
            font-size: 1.125rem;
          }

          .navbar-desktop {
            display: none;
          }

          .navbar-mobile-btn {
            display: flex;
          }
        }

        /* Tablet: 768px - 1023px */
        @media (min-width: 768px) and (max-width: 1023px) {
          .navbar-content {
            padding: 1rem 2rem;
            max-width: 720px;
          }

          .navbar-logo {
            font-size: 1.375rem;
          }

          .navbar-desktop {
            display: flex;
            gap: 1.25rem;
          }

          .navbar-mobile-btn {
            display: none;
          }

          .navbar-link {
            font-size: 0.875rem;
          }
        }

        /* Laptop: 1024px - 1439px */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .navbar-content {
            max-width: 960px;
            padding: 1rem 2rem;
          }

          .navbar-logo {
            font-size: 1.5rem;
          }

          .navbar-desktop {
            display: flex;
            gap: 1.5rem;
          }

          .navbar-mobile-btn {
            display: none;
          }

          .navbar-link {
            font-size: 0.9375rem;
          }
        }

        /* Desktop: 1440px - 1919px */
        @media (min-width: 1440px) and (max-width: 1919px) {
          .navbar-content {
            max-width: 1320px;
            padding: 1.25rem 2rem;
          }

          .navbar-logo {
            font-size: 1.5rem;
          }

          .navbar-desktop {
            display: flex;
            gap: 2rem;
          }

          .navbar-mobile-btn {
            display: none;
          }

          .navbar-link {
            font-size: 1rem;
          }
        }

        /* Large Desktop/Full HD: 1920px - 2559px */
        @media (min-width: 1920px) and (max-width: 2559px) {
          .navbar-content {
            max-width: 1600px;
            padding: 1.5rem 3rem;
          }

          .navbar-logo {
            font-size: 1.75rem;
          }

          .navbar-desktop {
            display: flex;
            gap: 2.5rem;
          }

          .navbar-mobile-btn {
            display: none;
          }

          .navbar-link {
            font-size: 1.125rem;
          }

          .navbar-logout-btn {
            font-size: 1rem;
            padding: 0.625rem 1.25rem;
          }
        }

        /* Ultra-wide/2K: 2560px - 3839px */
        @media (min-width: 2560px) and (max-width: 3839px) {
          .navbar-content {
            max-width: 2000px;
            padding: 2rem 4rem;
          }

          .navbar-logo {
            font-size: 2rem;
          }

          .navbar-desktop {
            display: flex;
            gap: 3rem;
          }

          .navbar-mobile-btn {
            display: none;
          }

          .navbar-link {
            font-size: 1.25rem;
          }

          .navbar-logout-btn {
            font-size: 1.125rem;
            padding: 0.75rem 1.5rem;
            min-height: 52px;
          }
        }

        /* 4K/Projector: 3840px+ */
        @media (min-width: 3840px) {
          .navbar-content {
            max-width: 3200px;
            padding: 3rem 6rem;
          }

          .navbar-logo {
            font-size: 2.5rem;
          }

          .navbar-desktop {
            display: flex;
            gap: 4rem;
          }

          .navbar-mobile-btn {
            display: none;
          }

          .navbar-link {
            font-size: 1.5rem;
          }

          .navbar-logout-btn {
            font-size: 1.25rem;
            padding: 1rem 2rem;
            min-height: 56px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
