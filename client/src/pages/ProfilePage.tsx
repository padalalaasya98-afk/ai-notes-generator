import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  User as UserIcon,
  Mail,
  Calendar,
  LogOut,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.notes.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
          Student Profile & Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account credentials and view your learning statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg shadow-indigo-500/20">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
            <span className="flex items-center justify-between">
              <span>Account Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active Student
              </span>
            </span>
            <span className="flex items-center justify-between">
              <span>Security:</span>
              <span className="font-semibold text-slate-700">Encrypted JWT Session</span>
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Learning Statistics Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Learning Milestones
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <BookOpen className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <p className="text-xl font-extrabold text-indigo-900">{stats?.totalNotes || 0}</p>
                <p className="text-[11px] text-indigo-700 font-medium mt-0.5">Notes Created</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <Layers className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xl font-extrabold text-purple-900">{stats?.totalFlashcards || 0}</p>
                <p className="text-[11px] text-purple-700 font-medium mt-0.5">Active Flashcards</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <HelpCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xl font-extrabold text-emerald-900">{stats?.totalQuizQuestions || 0}</p>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Quiz Questions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="font-heading text-base font-bold text-slate-900">
              Data Privacy & Isolation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your lecture materials and generated study notes are private to your user account. Every database query enforces row-level authenticated user ownership verification on the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
