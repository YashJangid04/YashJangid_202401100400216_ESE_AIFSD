import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ComplaintForm from './components/ComplaintForm';
import ComplaintDetails from './components/ComplaintDetails';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-slate-200">
        <Navbar />
        <main className="w-full px-6 md:px-12 py-12 animate-fade-in">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/new-complaint" 
              element={
                <ProtectedRoute>
                  <ComplaintForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/complaint/:id" 
              element={
                <ProtectedRoute>
                  <ComplaintDetails />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
