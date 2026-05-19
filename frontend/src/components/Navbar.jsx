import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, LogOut, Plus, ShieldCheck, Home } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center text-slate-900 font-bold text-xl tracking-tight group">
              <div className="bg-slate-900 p-2 rounded-lg mr-3 group-hover:bg-slate-800 transition">
                <Layers className="h-5 w-5 text-white" />
              </div>
              Smart CMS
            </Link>

            {token && (
              <div className="hidden md:flex space-x-1">
                <Link to="/" className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
                  <Home className="h-4 w-4 mr-2" />
                  My Complaints
                </Link>
                <Link to="/admin" className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Admin Panel
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {token ? (
              <div className="flex items-center space-x-6">
                <span className="text-sm font-medium text-slate-500 hidden sm:block">
                  Hello, {user.name?.split(' ')[0]}
                </span>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-slate-400 hover:text-slate-900 transition text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition">Log in</Link>
                <Link to="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
