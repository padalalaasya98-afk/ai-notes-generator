import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  BookOpen,
  FileText,
  Mic,
  Brain,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Layers,
  HelpCircle,
  Award,
  Zap,
  Clock,
  Printer
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className={isDark ? 'min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/30' : 'min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30'}>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow backdrop decorative elements */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] blur-3xl pointer-events-none rounded-full ${
          isDark
            ? 'bg-gradient-to-tr from-indigo-600/15 via-purple-500/10 to-pink-500/5'
            : 'bg-gradient-to-tr from-indigo-400/20 via-purple-300/20 to-pink-300/10'
        }`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill tag */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-xs animate-fade-in ${
              isDark
                ? 'bg-indigo-950 border border-indigo-800 text-indigo-400'
                : 'bg-indigo-50 border border-indigo-200/80 text-indigo-700'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`} />
              <span>Next-Gen Study Assistant Powered by Gemini 3.8</span>
            </div>

            {/* Main Headline */}
            <h1 className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 animate-slide-up ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Turn Any Lecture Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-700">
                Complete Study Notes
              </span>{' '}
              in Seconds
            </h1>

            {/* Subheading */}
            <p className={`text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto font-normal animate-slide-up ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`} style={{ animationDelay: '0.1s' }}>
              Stop struggling with messy lecture recordings and 100-page slide decks.
              Convert audio, PDFs, and text into organized summaries, interactive flashcards, practice quizzes, and exam questions instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to={user ? "/create" : "/register"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                {user ? "Generate Notes Now" : "Start Generating Free"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to={user ? "/notes" : "/login"}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold border shadow-xs transition-all ${
                  isDark
                    ? 'text-slate-300 bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
                    : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <BookOpen className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} />
                {user ? "Explore My Notes" : "Sign In to Your Notes"}
              </Link>
            </div>

            {/* Micro value props */}
            <div className={`mt-8 flex flex-wrap items-center justify-center gap-6 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Audio, PDF, Text & Transcripts
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Auto Flashcards & Quizzes
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Zero Setup Required
              </span>
            </div>
          </div>

          {/* Interactive Feature Mockup Preview */}
          <div className={`mt-14 max-w-5xl mx-auto rounded-2xl p-2 shadow-2xl backdrop-blur-sm ${
            isDark
              ? 'bg-white/5 ring-1 ring-white/10'
              : 'bg-slate-900/5 ring-1 ring-slate-900/10'
          }`}>
            <div className={`rounded-xl border overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } shadow-sm`}>
              {/* Fake Browser Top Bar */}
              <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
                isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-100/80 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className={`text-[11px] font-mono px-3 py-1 rounded-md border shadow-2xs ${
                  isDark
                    ? 'text-slate-500 bg-slate-900 border-slate-700'
                    : 'text-slate-500 bg-white border-slate-200/60'
                }`}>
                  app.ainotesgenerator.com/notes/distributed-systems-consensus
                </div>
                <div className={`text-xs font-medium hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>AI Study Suite</div>
              </div>

              {/* Mock App Content Preview */}
              <div className={`p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 ${
                isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'
              }`}>
                {/* Left 2 Cols: Notes Preview */}
                <div className="lg:col-span-2 space-y-4">
                  <div className={`p-5 rounded-xl border shadow-xs ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                        isDark ? 'bg-indigo-950 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        Computer Science
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md ${
                        isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Undergraduate • Exam Focused
                      </span>
                    </div>
                    <h3 className={`font-heading text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Distributed Systems: Paxos & Raft Consensus Algorithms
                    </h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Consensus algorithms ensure fault-tolerant state machine replication across unreliable distributed nodes.
                      Raft breaks down consensus into three decomposed subproblems: Leader Election, Log Replication, and Safety guarantees.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border shadow-xs ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      <h4 className={`text-xs font-bold flex items-center gap-1.5 mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Key Definition
                      </h4>
                      <p className="text-xs font-semibold text-indigo-500">Split-Brain Scenario</p>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        Network partition causing two nodes to believe they are simultaneous leaders, avoided via quorum majorities.
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl border shadow-xs ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      <h4 className={`text-xs font-bold flex items-center gap-1.5 mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Exam Question
                      </h4>
                      <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Why must a Raft quorum be (N/2)+1?</p>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        Any two majorities must overlap in at least one server containing the most up-to-date log term.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Col: Interactive Study Card Mock */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5 rounded-xl shadow-md">
                    <div className="flex items-center justify-between text-[11px] text-indigo-200 font-semibold mb-3">
                      <span>FLASHCARD 1 OF 8</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">Active Recall</span>
                    </div>
                    <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold mb-1">Question</p>
                    <p className="text-sm font-bold text-white mb-4">
                      What are the three core states a node can occupy in the Raft protocol?
                    </p>
                    <div className="pt-3 border-t border-white/20 text-xs text-indigo-100 flex items-center justify-between">
                      <span>Tap to Flip Answer</span>
                      <span className="text-white font-semibold">Leader / Follower / Candidate →</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border shadow-xs ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Award className="w-4 h-4 text-emerald-600" /> Practice Quiz Ready
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        4 Questions
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Auto-scored multiple choice test to evaluate your retention before exams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-16 sm:py-24 border-y ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isDark ? 'text-indigo-400 bg-indigo-950 border-indigo-800' : 'text-indigo-600 bg-indigo-50 border-indigo-200/60'
            }`}>
              Effortless Workflow
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-3 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              From Raw Lecture to Exam Readiness in 4 Simple Steps
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Say goodbye to hours of frantic rewriting. Let intelligent AI do the heavy lifting while you focus on understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 stagger-children">
            {[
              { num: 1, color: 'indigo', title: 'Provide Content', desc: 'Upload lecture audio (MP3/WAV/M4A), drop a PDF slide deck, paste a transcript, or type raw notes.' },
              { num: 2, color: 'purple', title: 'Configure Focus', desc: 'Choose your education level, domain category, note depth, and output style (Simple, Academic, or Exam-focused).' },
              { num: 3, color: 'pink', title: 'AI Analysis', desc: 'Gemini extracts core ideas, organizes subtopics, defines technical terms, and drafts high-yield questions.' },
              { num: 4, color: 'emerald', title: 'Study & Master', desc: 'Flip interactive flashcards, take self-graded quizzes, test yourself on exam questions, and print or export.' },
            ].map((step) => (
              <div key={step.num} className={`relative flex flex-col items-center text-center p-6 rounded-2xl border transition-all group ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-700'
                  : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300'
              }`}>
                <div className={`w-12 h-12 rounded-xl bg-${step.color}-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-${step.color}-500/20 group-hover:scale-110 transition-transform`}>
                  {step.num}
                </div>
                <h3 className={`font-heading font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isDark ? 'text-indigo-400 bg-indigo-950 border-indigo-800' : 'text-indigo-600 bg-indigo-50 border-indigo-200/60'
            }`}>
              Comprehensive Study Kit
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-3 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Everything You Need to Ace Your Exams
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Every generation produces a complete, multi-dimensional learning pack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {[
              { icon: Mic, color: 'indigo', title: 'Audio Transcription', desc: 'Upload MP3, WAV, M4A, or WEBM recordings from your lecture hall. Gemini transcribes every word accurately before analyzing.' },
              { icon: FileText, color: 'purple', title: 'Smart PDF Reading', desc: 'Upload presentation slides, scientific papers, or textbook chapters. Extracts clean, normalized text in seconds.' },
              { icon: Layers, color: 'pink', title: 'Interactive Flashcards', desc: 'Review key definitions and core mechanisms using responsive 3D flip flashcards optimized for active recall.' },
              { icon: Award, color: 'emerald', title: 'Self-Testing Quizzes', desc: 'Multiple choice questions with 4 options and detailed explanations showing why the correct answer is right.' },
              { icon: HelpCircle, color: 'amber', title: 'Exam-Ready Questions', desc: 'High-yield questions that university professors and examiners love to ask, paired with comprehensive model answers.' },
              { icon: Printer, color: 'sky', title: 'Export & Print Friendly', desc: 'Copy formatted Markdown to Notion/Obsidian or open the clean print preview to generate crisp physical paper notes or PDFs.' },
            ].map((feature) => (
              <div key={feature.title} className={`p-6 rounded-2xl border shadow-xs hover:shadow-md transition-shadow card-glow ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  isDark ? `bg-${feature.color}-950 text-${feature.color}-400` : `bg-${feature.color}-50 text-${feature.color}-600`
                }`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className={`font-heading font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Domains Section */}
      <section className={`py-16 ${isDark ? 'bg-slate-800' : 'bg-slate-900'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Built for Every Field of Study
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-8">
            Whether preparing for a medical licensing exam, engineering midterms, or business case studies:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {[
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
              'General Learning'
            ].map((cat) => (
              <span
                key={cat}
                className="px-3.5 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium hover:border-indigo-500 transition-colors"
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="mt-12">
            <Link
              to={user ? "/create" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-lg active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Generate Your First Note Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 border-t text-center text-xs ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-500'
          : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>AI Notes Generator</span>
            <span>— Turn any lecture into complete study material in seconds.</span>
          </div>
          <p>© 2026 AI Notes Generator. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};
