import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { NoteRecord, Topic, Definition, ImportantQuestion, Flashcard, QuizQuestion } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Layers,
  HelpCircle,
  Award,
  Copy,
  Printer,
  Edit3,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Clock,
  Check,
  FileText
} from 'lucide-react';

export const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<NoteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  type TabType = 'summary' | 'topics' | 'definitions' | 'questions' | 'flashcards' | 'quiz' | 'all';
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<number, boolean>>({});

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Copy feedback state
  const [copied, setCopied] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Search filter inside definitions
  const [termFilter, setTermFilter] = useState('');

  // Expandable questions state
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadNote() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.notes.getById(id);
        if (res.success && res.note) {
          setNote(res.note);
          setEditTitle(res.note.title);
          setEditSubject(res.note.subject || '');
          setEditTopic(res.note.topic || '');
          setEditSummary(res.note.summary);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load note');
      } finally {
        setLoading(false);
      }
    }
    loadNote();
  }, [id]);

  // Copy formatted Markdown to clipboard
  const handleCopyMarkdown = () => {
    if (!note) return;

    let md = `# ${note.title}\n\n`;
    if (note.subject || note.topic) {
      md += `**Subject:** ${note.subject || 'General'} | **Topic:** ${note.topic || ''}\n\n`;
    }
    md += `## Summary\n${note.summary}\n\n`;

    if (note.key_points && note.key_points.length > 0) {
      md += `## Key Takeaways\n`;
      note.key_points.forEach((p) => (md += `- ${p}\n`));
      md += `\n`;
    }

    if (note.detailed_notes && note.detailed_notes.length > 0) {
      md += `## Detailed Notes\n`;
      note.detailed_notes.forEach((topic) => {
        md += `### ${topic.title}\n`;
        topic.subtopics?.forEach((sub) => {
          md += `#### ${sub.title}\n${sub.explanation}\n\n`;
        });
      });
    }

    if (note.definitions && note.definitions.length > 0) {
      md += `## Key Definitions\n`;
      note.definitions.forEach((d) => {
        md += `- **${d.term}:** ${d.definition}\n`;
      });
      md += `\n`;
    }

    if (note.important_questions && note.important_questions.length > 0) {
      md += `## Important Exam Questions\n`;
      note.important_questions.forEach((q, i) => {
        md += `### Q${i + 1}: ${q.question}\n**Answer:** ${q.answer}\n\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Flashcard controls
  const handleNextCard = () => {
    if (!note?.flashcards) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % note.flashcards.length);
  };

  const handlePrevCard = () => {
    if (!note?.flashcards) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + note.flashcards.length) % note.flashcards.length);
  };

  const handleShuffleCards = () => {
    if (!note?.flashcards) return;
    const shuffled = [...note.flashcards].sort(() => Math.random() - 0.5);
    setNote({ ...note, flashcards: shuffled });
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const toggleMastered = (idx: number) => {
    setMasteredCards((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Quiz controls
  const handleSelectOption = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: option
    }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);

    if (!note?.quiz_questions) return;
    let score = 0;
    note.quiz_questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_answer) {
        score++;
      }
    });

    const percent = (score / note.quiz_questions.length) * 100;
    if (percent >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const getQuizScore = () => {
    if (!note?.quiz_questions) return { score: 0, total: 0, percent: 0 };
    let score = 0;
    note.quiz_questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_answer) {
        score++;
      }
    });
    return {
      score,
      total: note.quiz_questions.length,
      percent: Math.round((score / note.quiz_questions.length) * 100)
    };
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!note) return;
    setSavingEdit(true);
    try {
      const res = await api.notes.update(note.id, {
        title: editTitle.trim(),
        subject: editSubject.trim(),
        topic: editTopic.trim(),
        summary: editSummary.trim()
      });
      if (res.success && res.note) {
        setNote(res.note);
        setEditModalOpen(false);
      }
    } catch (err: any) {
      alert('Failed to update note: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async () => {
    if (!note) return;
    setDeleting(true);
    try {
      await api.notes.delete(note.id);
      navigate('/notes');
    } catch (err: any) {
      alert('Failed to delete note: ' + err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading structured study notes...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-red-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-xl font-bold text-slate-900">Note Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This note does not exist or you do not have permission to view it.'}</p>
        <Link
          to="/notes"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to My Notes
        </Link>
      </div>
    );
  }

  const filteredDefinitions = (note.definitions || []).filter(
    (d) =>
      d.term.toLowerCase().includes(termFilter.toLowerCase()) ||
      d.definition.toLowerCase().includes(termFilter.toLowerCase())
  );

  const currentFlashcard = note.flashcards?.[currentCardIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Action Toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/notes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notes
        </Link>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            title="Copy as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Notes'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>

          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Note Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="primary" size="sm">
            {note.category || 'General'}
          </Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-600">
            {note.education_level || 'Undergraduate'}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-600 capitalize">
            {note.output_style || 'Exam-focused'}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(note.created_at).toLocaleDateString()}
          </span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {note.title}
        </h1>

        <p className="text-xs sm:text-sm text-indigo-700 font-semibold mt-1.5">
          {note.subject ? `${note.subject} — ` : ''}{note.topic || 'General Lecture'}
        </p>

        {note.original_filename && (
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Source: {note.original_filename} ({note.source_type || 'file'})
          </p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="no-print flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'summary'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Summary & Key Points
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'topics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Topics & Explanations ({note.detailed_notes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('definitions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'definitions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          Key Definitions ({note.definitions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Exam Questions ({note.important_questions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'flashcards'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Interactive Flashcards ({note.flashcards?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'quiz'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Practice Quiz ({note.quiz_questions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          Full Study Guide View
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUMMARY & KEY POINTS */}
      {/* ========================================================================= */}
      {(activeTab === 'summary' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="font-heading text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Executive Summary
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {note.summary}
            </p>
          </div>

          {note.key_points && note.key_points.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Key Takeaways & High-Yield Points
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {note.key_points.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TOPICS & SUBTOPICS */}
      {/* ========================================================================= */}
      {(activeTab === 'topics' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Structured Topics & Concepts
            </h2>
          </div>

          <div className="space-y-6">
            {note.detailed_notes?.map((topic, topicIdx) => (
              <div
                key={topicIdx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {topicIdx + 1}
                  </span>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                    {topic.title}
                  </h3>
                </div>

                <div className="space-y-4 pl-0 sm:pl-10">
                  {topic.subtopics?.map((sub, subIdx) => (
                    <div
                      key={subIdx}
                      className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-1.5"
                    >
                      <h4 className="font-heading text-sm font-bold text-indigo-900">
                        {sub.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {sub.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KEY DEFINITIONS */}
      {/* ========================================================================= */}
      {(activeTab === 'definitions' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Core Definitions & Terminology
            </h2>

            {activeTab === 'definitions' && (
              <div className="max-w-xs w-full">
                <input
                  type="text"
                  value={termFilter}
                  onChange={(e) => setTermFilter(e.target.value)}
                  placeholder="Filter key terms..."
                  className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDefinitions.map((d, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="font-heading font-bold text-sm sm:text-base text-indigo-950">
                    {d.term}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {d.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: IMPORTANT EXAM QUESTIONS */}
      {/* ========================================================================= */}
      {(activeTab === 'questions' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              High-Yield Examination Questions & Model Answers
            </h2>
          </div>

          <div className="space-y-4">
            {note.important_questions?.map((q, idx) => {
              const isRevealed = revealedAnswers[idx] ?? true;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                        {q.question}
                      </h3>
                    </div>

                    <button
                      onClick={() =>
                        setRevealedAnswers((prev) => ({
                          ...prev,
                          [idx]: !isRevealed
                        }))
                      }
                      className="no-print p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 shrink-0"
                      title={isRevealed ? 'Hide Answer' : 'Show Answer'}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="pl-3 sm:pl-9 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                        Model Answer:
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: INTERACTIVE 3D FLIP FLASHCARDS */}
      {/* ========================================================================= */}
      {(activeTab === 'flashcards' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Active Recall Flashcards
            </h2>
            <div className="text-xs text-slate-500 font-medium">
              Mastered:{' '}
              <span className="font-bold text-emerald-600">
                {Object.values(masteredCards).filter(Boolean).length} / {note.flashcards?.length || 0}
              </span>
            </div>
          </div>

          {note.flashcards && note.flashcards.length > 0 && currentFlashcard ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="perspective-1000 w-full h-80 sm:h-96 cursor-pointer select-none"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-3xl shadow-xl ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front: Question */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white rounded-3xl p-8 flex flex-col justify-between border border-indigo-500/20 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                        Card {currentCardIndex + 1} of {note.flashcards.length}
                      </span>
                      <span className="text-xs text-indigo-200 font-medium flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Tap to Flip
                      </span>
                    </div>

                    <div className="my-auto text-center space-y-3">
                      <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold">
                        Question / Concept
                      </p>
                      <h3 className="font-heading text-lg sm:text-2xl font-bold leading-relaxed">
                        {currentFlashcard.question}
                      </h3>
                    </div>

                    <div className="text-center text-xs text-indigo-200">
                      Click anywhere on card to reveal answer
                    </div>
                  </div>

                  {/* Back: Answer */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white text-slate-900 rounded-3xl p-8 flex flex-col justify-between border border-slate-200 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                        Answer
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Tap to Flip Back
                      </span>
                    </div>

                    <div className="my-auto text-center space-y-3 overflow-y-auto max-h-52">
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                        {currentFlashcard.answer}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMastered(currentCardIndex);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                          masteredCards[currentCardIndex]
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {masteredCards[currentCardIndex] ? 'Mastered!' : 'Mark as Mastered'}
                      </button>

                      <span className="text-slate-400">Card {currentCardIndex + 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flashcard Navigation Controls */}
              <div className="no-print flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handlePrevCard}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  type="button"
                  onClick={handleShuffleCards}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  title="Shuffle Flashcards"
                >
                  <Shuffle className="w-4 h-4" /> Shuffle
                </button>

                <button
                  type="button"
                  onClick={handleNextCard}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No flashcards available for this note.</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: INTERACTIVE PRACTICE QUIZ */}
      {/* ========================================================================= */}
      {(activeTab === 'quiz' || activeTab === 'all') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Self-Testing Practice Quiz
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                4-option multiple choice test to evaluate your retention
              </p>
            </div>

            {quizSubmitted && (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Score: {getQuizScore().score} / {getQuizScore().total} ({getQuizScore().percent}%)
                </div>
                <button
                  onClick={handleResetQuiz}
                  className="no-print px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Retake
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {note.quiz_questions?.map((q, qIdx) => {
              const selected = selectedAnswers[qIdx];
              const isCorrect = selected === q.correct_answer;

              return (
                <div
                  key={qIdx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                      {q.question}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-9">
                    {q.options?.map((opt, optIdx) => {
                      let optionClass = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50';

                      if (quizSubmitted) {
                        if (opt === q.correct_answer) {
                          optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                        } else if (selected === opt && opt !== q.correct_answer) {
                          optionClass = 'border-red-400 bg-red-50 text-red-950';
                        } else {
                          optionClass = 'border-slate-200 opacity-60';
                        }
                      } else if (selected === opt) {
                        optionClass = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => handleSelectOption(qIdx, opt)}
                          className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-2.5 ${optionClass}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {quizSubmitted && (
                    <div
                      className={`ml-0 sm:ml-9 p-3.5 rounded-xl text-xs leading-relaxed animate-in fade-in ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-red-50 text-red-900 border border-red-200'
                      }`}
                    >
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Correct Answer!
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            Incorrect. Correct: {q.correct_answer}
                          </>
                        )}
                      </p>
                      <p className="text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && note.quiz_questions && note.quiz_questions.length > 0 && (
            <div className="no-print pt-4 text-center">
              <button
                type="button"
                onClick={handleQuizSubmit}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-8 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
              >
                Submit & Grade Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Note Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Study Note"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
            <textarea
              rows={5}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingEdit}
              onClick={handleSaveEdit}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Note?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete this note and all its study flashcards & quizzes?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteNote}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
