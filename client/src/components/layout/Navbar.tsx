import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  BookOpen,
  PlusCircle,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Moon,
  Sun,
  Command
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N → Create new note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (user) navigate('/create');
      }
      // Ctrl+K or Cmd+K → Focus search (navigate to notes)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (user) navigate('/notes');
      }
      // Ctrl+D or Cmd+D → Toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [user, navigate, toggleTheme]);

  return (
    <nav className={`sticky top-0 z-40 border-b shadow-xs transition-colors duration-200 ${
      isDark
        ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md'
        : 'bg-white/90 border-slate-200/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className={`font-heading font-bold text-lg tracking-tight flex items-center gap-1.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  AI Notes Generator
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                  }`}>
                    Pro
                  </span>
                </span>
                <span className={`text-[11px] -mt-0.5 hidden sm:block ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  Turn lectures into study notes in seconds
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center ml-8 space-x-1">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/notes"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/notes')
                      ? isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  My Notes
                </Link>

                <Link
                  to="/create"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/create')
                      ? isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                      : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Notes
                </Link>
              </div>
            )}
          </div>

          {/* Right Header Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode (Ctrl+D)`}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-amber-400 hover:bg-slate-800 hover:text-amber-300'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  Generate New Note
                  <kbd className={`hidden lg:inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    'bg-indigo-700/60 text-indigo-200'
                  }`}>
                    <Command className="w-2.5 h-2.5" />N
                  </kbd>
                </Link>

                <div className={`h-6 w-px mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                <Link
                  to="/profile"
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-xs">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left text-xs hidden lg:block">
                    <p className={`font-semibold truncate max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                    <p className={`truncate max-w-[120px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{user.email}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/50'
                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-4 pt-2 pb-4 space-y-2 shadow-lg ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {user ? (
            <>
              <div className={`px-3 py-2 border-b mb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{user.email}</p>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Dashboard
              </Link>
              <Link
                to="/notes"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                My Notes
              </Link>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isDark ? 'text-indigo-400 bg-indigo-950/50' : 'text-indigo-700 bg-indigo-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Create New Note
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UserIcon className="w-4 h-4 text-indigo-600" />
                My Profile
              </Link>
              <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium ${
                    isDark ? 'text-red-400 hover:bg-red-950/50' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isDark ? 'text-slate-300 bg-slate-800' : 'text-slate-700 bg-slate-100'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
