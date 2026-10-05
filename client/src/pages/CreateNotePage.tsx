import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  NoteCategory,
  EducationLevel,
  NoteLength,
  OutputStyle,
  SourceType
} from '../types';
import {
  Sparkles,
  FileText,
  Mic,
  AlignLeft,
  FileCode,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Info,
  Clock,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const CATEGORIES: NoteCategory[] = [
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

const EDUCATION_LEVELS: EducationLevel[] = [
  'School',
  'Undergraduate',
  'Postgraduate',
  'Competitive Exam',
  'General Learning'
];

const NOTE_LENGTHS: { value: NoteLength; label: string; desc: string }[] = [
  { value: 'short', label: 'Short', desc: 'High-speed executive recap' },
  { value: 'medium', label: 'Medium', desc: 'Balanced depth & revision notes' },
  { value: 'detailed', label: 'Detailed', desc: 'Comprehensive lecture walkthrough' }
];

const OUTPUT_STYLES: { value: OutputStyle; label: string; desc: string }[] = [
  { value: 'exam-focused', label: 'Exam-focused', desc: 'Prioritizes likely test questions' },
  { value: 'simple', label: 'Simple', desc: 'Plain English, beginner friendly' },
  { value: 'academic', label: 'Academic', desc: 'Technical & formal terminology' },
  { value: 'revision-focused', label: 'Revision-focused', desc: 'Quick formulas & high-yield bullets' }
];

const SAMPLE_LECTURE = `Operating Systems: Process Synchronization and Deadlocks

In multiprogramming systems, multiple concurrent processes share system resources such as CPU, memory, and I/O devices. When processes execute concurrently and share mutable state or data, race conditions can occur. A race condition is a situation where the output of execution depends on the sequence or timing of uncontrollable events.

To prevent race conditions, critical sections must satisfy three primary requirements:
1. Mutual Exclusion: If process Pi is executing in its critical section, then no other processes can be executing in their critical sections.
2. Progress: If no process is executing in its critical section and some processes wish to enter, only those processes that are not executing in their remainder sections can participate in deciding which will enter next.
3. Bounded Waiting: There must be a bound on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted.

Common synchronization mechanisms include Mutex Locks, Counting Semaphores, and Monitors. Dijkstra introduced semaphores with two atomic operations: wait() (or P) and signal() (or V).

Deadlocks:
A deadlock is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.
Four Coffman conditions must hold simultaneously for a deadlock to arise:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources held by others.
3. No Preemption: Resources cannot be preempted; a resource can only be released voluntarily by the process holding it.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next.

Deadlock handling strategies include Deadlock Prevention (invalidating at least one of the four conditions), Deadlock Avoidance (e.g., Dijkstra's Banker's Algorithm ensuring the system never enters an unsafe state), and Deadlock Detection and Recovery.`;

export const CreateNotePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tab selection
  const [activeTab, setActiveTab] = useState<SourceType>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pdf' || tab === 'audio' || tab === 'transcript') return tab;
    return 'text';
  });

  // Content inputs
  const [textContent, setTextContent] = useState('');
  const [transcriptContent, setTranscriptContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileExtracting, setFileExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<string | null>(null);
  const [sourceMaterialId, setSourceMaterialId] = useState<string | null>(null);

  // Advisory / Metadata fields
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Operating Systems: Process Synchronization');
  const [course, setCourse] = useState('CS 301');
  const [category, setCategory] = useState<NoteCategory>('Computer Science');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('Undergraduate');
  const [noteLength, setNoteLength] = useState<NoteLength>('medium');
  const [outputStyle, setOutputStyle] = useState<OutputStyle>('exam-focused');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pdf' || tab === 'audio' || tab === 'transcript') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load sample content helper
  const handleLoadSample = () => {
    if (activeTab === 'text') {
      setTextContent(SAMPLE_LECTURE);
    } else if (activeTab === 'transcript') {
      setTranscriptContent(SAMPLE_LECTURE);
    }
    setSubject('Computer Science');
    setTopic('Process Synchronization & Deadlocks');
    setCategory('Computer Science');
    setEducationLevel('Undergraduate');
  };

  // Handle PDF or Audio upload immediately
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setExtractedPreview(null);
    setSourceMaterialId(null);
    setFileExtracting(true);

    try {
      if (activeTab === 'pdf') {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          throw new Error('Please select a valid .pdf document');
        }
        if (file.size > 20 * 1024 * 1024) {
          throw new Error('PDF file size exceeds 20MB limit');
        }

        const res = await api.sources.uploadPdf(file);
        if (res.success && res.source) {
          setSourceMaterialId(res.source.id);
          setExtractedPreview(res.source.extracted_text || '');
          if (!topic || topic === 'Operating Systems: Process Synchronization') {
            setTopic(file.name.replace(/\.pdf$/i, ''));
          }
        }
      } else if (activeTab === 'audio') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['mp3', 'wav', 'm4a', 'webm', 'ogg', 'aac'].includes(ext || '')) {
          throw new Error('Supported audio formats: MP3, WAV, M4A, WEBM, OGG, AAC');
        }
        if (file.size > 50 * 1024 * 1024) {
          throw new Error('Audio file size exceeds 50MB limit');
        }

        setGenerationStep('Uploading and transcribing audio with Gemini...');
        const res = await api.sources.uploadAudio(file);
        if (res.success && res.source) {
          setSourceMaterialId(res.source.id);
          setExtractedPreview(res.source.extracted_text || '');
          if (!topic || topic === 'Operating Systems: Process Synchronization') {
            setTopic(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'File processing failed');
      setSelectedFile(null);
    } finally {
      setFileExtracting(false);
      setGenerationStep('');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let contentToProcess = '';
    let currentSourceMaterialId = sourceMaterialId;

    if (activeTab === 'text') {
      contentToProcess = textContent.trim();
    } else if (activeTab === 'transcript') {
      contentToProcess = transcriptContent.trim();
    } else if (activeTab === 'pdf' || activeTab === 'audio') {
      contentToProcess = extractedPreview || '';
    }

    if (!contentToProcess || contentToProcess.length < 15) {
      setError('Please provide educational lecture content (at least 15 characters).');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Structuring concepts and extracting definitions...');

    try {
      // If text/transcript hasn't been saved to source_materials yet, save it
      if ((activeTab === 'text' || activeTab === 'transcript') && !currentSourceMaterialId) {
        setGenerationStep('Saving source material...');
        const srcRes = await api.sources.createText(activeTab, contentToProcess, `${topic || 'lecture'}.txt`);
        if (srcRes.success && srcRes.source) {
          currentSourceMaterialId = srcRes.source.id;
        }
      }

      setGenerationStep('Gemini is generating detailed notes, flashcards & quizzes...');

      const noteRes = await api.notes.generate({
        sourceType: activeTab,
        content: contentToProcess,
        subject: subject.trim() || 'General',
        topic: topic.trim() || 'Study Notes',
        course: course.trim(),
        category,
        educationLevel,
        noteLength,
        outputStyle,
        sourceMaterialId: currentSourceMaterialId
      });

      if (noteRes.success && noteRes.note) {
        navigate(`/notes/${noteRes.note.id}`);
      } else {
        throw new Error('Failed to generate note from server response');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate study notes. Please check the content and try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Note Creation Suite
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Generate Complete Study Material
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose your learning source, configure your study goals, and let Gemini build your custom revision kit.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Load Sample Lecture
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-900">Action Required</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleGenerate} className="space-y-8">
        {/* Step 1: Input Method Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Select Content Input Method
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
              Text Input
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pdf'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDF Document
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audio'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Mic className="w-4 h-4" />
              Audio Lecture
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'transcript'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Transcript
            </button>
          </div>

          {/* Tab 1: Text */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <label className="font-semibold text-slate-700">Paste or Type Lecture Notes</label>
                <span>{textContent.length} characters</span>
              </div>
              <textarea
                rows={8}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste lecture notes, textbook chapters, or classroom discussions here..."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono leading-relaxed"
              />
            </div>
          )}

          {/* Tab 2: PDF Upload */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <label className="block font-semibold text-xs text-slate-700">
                Upload Educational PDF Slides or Textbook Chapters (Max 20MB)
              </label>

              <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Drop your PDF here, or browse files'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze`
                      : 'Supports lecture slides, research papers, and textbook chapters'}
                  </p>
                </div>
              </div>

              {fileExtracting && (
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700 text-xs flex items-center gap-2 font-medium">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  Extracting and normalizing PDF text...
                </div>
              )}

              {extractedPreview && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Extracted Text Preview ({extractedPreview.length} characters)
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-h-36 overflow-y-auto font-mono whitespace-pre-wrap">
                    {extractedPreview}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Audio Upload */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <label className="block font-semibold text-xs text-slate-700">
                Upload Lecture Recording (MP3, WAV, M4A, WEBM - Max 50MB)
              </label>

              <div className="relative border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-purple-50/20 transition-all">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Mic className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Drop your lecture audio here, or browse files'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Audio detected`
                      : 'MP3, WAV, M4A, WEBM lecture recordings supported'}
                  </p>
                </div>
              </div>

              {fileExtracting && (
                <div className="p-3 bg-purple-50 rounded-xl text-purple-700 text-xs flex items-center gap-2 font-medium">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Transcribing lecture audio with Gemini AI... This may take a moment.
                </div>
              )}

              {extractedPreview && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Transcribed Audio Lecture ({extractedPreview.length} characters)
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-h-36 overflow-y-auto font-mono whitespace-pre-wrap">
                    {extractedPreview}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Transcript */}
          {activeTab === 'transcript' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <label className="font-semibold text-slate-700">Paste Full Lecture Transcript</label>
                <span>{transcriptContent.length} characters</span>
              </div>
              <textarea
                rows={8}
                value={transcriptContent}
                onChange={(e) => setTranscriptContent(e.target.value)}
                placeholder="Paste speech-to-text transcript or YouTube/Zoom lecture transcript..."
                className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Step 2: Advisory Configuration & Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Target Domain & Advisory Configuration
            </h2>
            <span className="text-xs text-slate-400">Tailors AI depth and vocabulary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topic / Lecture Title
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Process Synchronization"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course / Semester (Optional)
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CS 301 - Semester 5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Length Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Note Length
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {NOTE_LENGTHS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setNoteLength(opt.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    noteLength === opt.value
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{opt.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Output Style Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Output Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {OUTPUT_STYLES.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setOutputStyle(opt.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    outputStyle === opt.value
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{opt.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advisory Notice */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Student Notice:</strong> AI-generated study notes, flashcards, and quizzes should always be reviewed against your official syllabus for accuracy.
            </span>
          </div>
        </div>

        {/* Action Button & Loading Progress */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <button
            type="submit"
            disabled={isGenerating || fileExtracting}
            className="w-full sm:w-auto min-w-[320px] py-4 px-8 rounded-2xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Study Notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Notes & Study Kit</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {isGenerating && (
            <div className="text-center space-y-2 animate-in fade-in">
              <p className="text-xs font-semibold text-indigo-700 animate-pulse">
                {generationStep}
              </p>
              <p className="text-[11px] text-slate-400">
                Synthesizing comprehensive topics, definitions, examination questions, and flashcards...
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
