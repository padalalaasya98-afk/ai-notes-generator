export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  created_at?: string;
}

export type SourceType = 'text' | 'pdf' | 'audio' | 'transcript';

export type EducationLevel =
  | 'School'
  | 'Undergraduate'
  | 'Postgraduate'
  | 'Competitive Exam'
  | 'General Learning';

export type NoteLength = 'short' | 'medium' | 'detailed';

export type OutputStyle = 'simple' | 'academic' | 'exam-focused' | 'revision-focused';

export type NoteCategory =
  | 'Computer Science'
  | 'Engineering'
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Business'
  | 'Finance'
  | 'Economics'
  | 'History'
  | 'Geography'
  | 'Literature'
  | 'Languages'
  | 'General'
  | 'Other';

export interface Subtopic {
  title: string;
  explanation: string;
}

export interface Topic {
  title: string;
  subtopics: Subtopic[];
}

export interface Definition {
  term: string;
  definition: string;
}

export interface ImportantQuestion {
  question: string;
  answer: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface NoteRecord {
  id: string;
  user_id: string;
  source_material_id?: string | null;
  title: string;
  subject?: string | null;
  topic?: string | null;
  category?: string | null;
  education_level?: string | null;
  note_length?: string | null;
  output_style?: string | null;
  summary: string;
  detailed_notes: Topic[];
  key_points: string[];
  definitions: Definition[];
  important_questions: ImportantQuestion[];
  flashcards: Flashcard[];
  quiz_questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
  original_filename?: string | null;
  source_type?: string | null;
  topic_count?: number;
  flashcard_count?: number;
  quiz_count?: number;
}

export interface DashboardStats {
  totalNotes: number;
  totalFlashcards: number;
  totalQuizQuestions: number;
  totalSources: number;
  topCategories: { category: string; count: number }[];
  recentNotes: {
    id: string;
    title: string;
    subject?: string;
    topic?: string;
    category?: string;
    created_at: string;
    flashcard_count?: number;
    quiz_count?: number;
  }[];
}

export interface SourceRecord {
  id: string;
  type: SourceType;
  original_filename?: string;
  mime_type?: string;
  file_size_bytes?: number;
  processing_status: string;
  created_at: string;
  preview_text?: string;
  extracted_text?: string;
}
