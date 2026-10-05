import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { NoteRecord, NoteCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Layers,
  HelpCircle,
  Trash2,
  Clock,
  ArrowUpDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Business',
  'Finance',
  'Economics',
  'History',
  'Geography',
  'Literature',
  'Languages',
  'General',
  'Other'
];

export const NotesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.notes.getAll({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort
      });
      if (res.success) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.notes.delete(deleteId);
      setNotes((prev) => prev.filter((n) => n.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryVariant = (cat?: string | null): any => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Study Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, and review your AI-generated lecture materials
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Note
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across title, topic, subject, or summary..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading your study notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-1">
            No Study Notes Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {search || selectedCategory !== 'All'
              ? 'No notes match your current search or category filters. Try clearing filters.'
              : 'You haven’t created any study notes yet. Get started in seconds with audio, PDF, or text!'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {search || selectedCategory !== 'All' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            ) : null}
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              Generate Notes Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Category & Date */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={getCategoryVariant(note.category)} size="sm">
                    {note.category || 'General'}
                  </Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <Link to={`/notes/${note.id}`} className="block group">
                  <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                </Link>

                {/* Subject & Topic */}
                <p className="text-xs text-indigo-700 font-medium mt-1">
                  {note.subject || 'General'} {note.topic ? `• ${note.topic}` : ''}
                </p>

                {/* Summary preview */}
                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {note.summary}
                </p>
              </div>

              {/* Footer Meta & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px]">
                  <span className="flex items-center gap-1 text-purple-700">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    {note.flashcard_count || (note.flashcards ? note.flashcards.length : 0)} Cards
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    {note.quiz_count || (note.quiz_questions ? note.quiz_questions.length : 0)} Quiz Qs
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteId(note.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/notes/${note.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors text-xs"
                  >
                    Study →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Note Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete this study note? All associated topics, flashcards, and quizzes will be removed. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-sm disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
