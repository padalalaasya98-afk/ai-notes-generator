import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  BookOpen,
  PlusCircle,
  FileText,
  Mic,
  Brain,
  HelpCircle,
  ArrowRight,
  Clock,
  Layers,
  Search,
  UploadCloud,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.notes.getStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/notes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryVariant = (cat?: string): any => {
    const map: Record<string, string> = {
      'Computer Science': 'primary',
      'Engineering': 'purple',
      'Mathematics': 'blue',
      'Physics': 'rose',
      'Chemistry': 'warning',
      'Biology': 'success'
    };
    return map[cat || ''] || 'default';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-10 shadow-xl shadow-indigo-950/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Smart Study Assistant Active</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Scholar'}!
            </h1>
            <p className="text-indigo-200 text-sm sm:text-base max-w-xl">
              Turn your lectures, textbook chapters, or audio recordings into high-impact revision material in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 text-sm font-bold shadow-lg shadow-black/10 hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Create Study Notes
            </Link>
          </div>
        </div>

        {/* Quick Search in Header */}
        <div className="relative z-10 mt-8 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all your topics, subjects, or summaries..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder-indigo-200 text-sm focus:outline-hidden focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur-md"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white text-indigo-900 text-xs font-semibold hover:bg-indigo-50 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Notes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {loading ? '...' : stats?.totalNotes || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Structured study guides</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flashcards</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {loading ? '...' : stats?.totalFlashcards || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active recall cards</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quiz Questions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {loading ? '...' : stats?.totalQuizQuestions || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Practice test queries</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materials</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {loading ? '...' : stats?.totalSources || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Audio, PDF & transcripts</p>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div>
        <h2 className="font-heading text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Quick Creation Methods
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/create?tab=pdf"
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">Upload PDF Slides</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Extract readable text from lecture handouts & slides.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              Upload PDF <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            to="/create?tab=audio"
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">Lecture Audio</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload MP3, WAV, or M4A for automatic Gemini transcription.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
              Transcribe Audio <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            to="/create?tab=text"
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">Paste Lecture Content</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Paste raw lecture transcripts or professor explanations.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Paste Text <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            to="/notes"
            className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">Review Saved Notes</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Test active recall with your generated flashcards & quizzes.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              View All Notes <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Notes Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">Recent Study Notes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your most recent AI-generated study sets</p>
          </div>
          <Link
            to="/notes"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            View all ({stats?.totalNotes || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading notes...
          </div>
        ) : !stats?.recentNotes || stats.recentNotes.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base mb-1">
              No notes generated yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Get started by uploading a lecture recording, PDF textbook, or pasting lecture notes.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Generate Your First Note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.recentNotes.map((note) => (
              <Link
                key={note.id}
                to={`/notes/${note.id}`}
                className="group p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={getCategoryVariant(note.category)} size="sm">
                      {note.category || 'General'}
                    </Badge>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {note.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {note.subject ? `${note.subject} • ` : ''}{note.topic || 'General Lecture'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-purple-700 font-medium">
                      <Layers className="w-3 h-3 text-purple-600" />
                      {note.flashcard_count || 0} Flashcards
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <HelpCircle className="w-3 h-3 text-emerald-600" />
                      {note.quiz_count || 0} Quiz Qs
                    </span>
                  </div>
                  <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    Study →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
