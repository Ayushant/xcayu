import './App.css';
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import { useEffect } from 'react';

import Home from "./pages/Home";
import About from './pages/About';
import Contact from './pages/Contact';
import Simulation from './pages/Simulation';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx/SuperAdminDashboard';
import Licenses from './pages/Licenses';
import EnhancedQuizBuilder from './components/EnhancedQuizBuilder';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import EnhancedStudentDashboard from './components/student/EnhancedStudentDashboard';
import CollegeAdminDashboard from './components/CollegeAdminDashboard';

function App() {
  useEffect(() => {
    // Additional runtime suppression (reinforcement)
    const noop = () => {};
    
    // Suppress all popups
    window.alert = noop;
    window.confirm = () => true;
    window.prompt = () => null;
    
    // Suppress all console methods
    Object.keys(console).forEach(key => {
      if (typeof console[key] === 'function') {
        console[key] = noop;
      }
    });
  }, []);
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    return { isAuthenticated: !!token, role: userRole };
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = checkAuth();
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <QuizProvider>
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/simulation" element={<><Navbar /><Simulation /></>} />
        <Route path="/login" element={<Login />} />

        {/* Protected Student Routes */}
        <Route path="/be/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Routes>
              <Route path="dashboard" element={<EnhancedStudentDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Alternative Student Route (without /be prefix) */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Routes>
              <Route path="dashboard" element={<EnhancedStudentDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/be/admin/*" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="management" element={<AdminDashboard activeTab="management" />} />
              <Route path="scores" element={<AdminDashboard activeTab="scores" />} />
              <Route path="quiz-management" element={<EnhancedQuizBuilder />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Alternative Admin Route (without /be prefix) */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="management" element={<AdminDashboard activeTab="management" />} />
              <Route path="scores" element={<AdminDashboard activeTab="scores" />} />
              <Route path="quiz-management" element={<EnhancedQuizBuilder />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Protected College Admin Routes */}
        <Route path="/college-admin/*" element={
          <ProtectedRoute allowedRoles={['collegeAdmin']}>
            <Routes>
              <Route path="/dashboard" element={<CollegeAdminDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* Protected Super Admin Routes */}
        <Route path="/superadmin/*" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Routes>
              <Route path="/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/licenses" element={<Licenses />} />
              <Route path="/quizzes" element={<EnhancedQuizBuilder />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
    </QuizProvider>
  );
}

export default App;