import { z } from 'zod';

// ==========================================
// User Schemas & Types
// ==========================================

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name must be at most 120 characters'),
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100)
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof LoginSchema>;

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Source Material Schemas & Types
// ==========================================

export const SourceTypeSchema = z.enum(['text', 'pdf', 'audio', 'transcript']);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export interface SourceMaterial {
  id: string;
  user_id: string;
  type: SourceType;
  original_filename?: string | null;
  mime_type?: string | null;
  extracted_text?: string | null;
  file_size_bytes?: number | null;
  processing_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// ==========================================
// AI Generation Form & Schema
// ==========================================

export const EducationLevelSchema = z.enum([
  'School',
  'Undergraduate',
  'Postgraduate',
  'Competitive Exam',
  'General Learning'
]);
export type EducationLevel = z.infer<typeof EducationLevelSchema>;

export const NoteLengthSchema = z.enum(['short', 'medium', 'detailed']);
export type NoteLength = z.infer<typeof NoteLengthSchema>;

export const OutputStyleSchema = z.enum([
  'simple',
  'academic',
  'exam-focused',
  'revision-focused'
]);
export type OutputStyle = z.infer<typeof OutputStyleSchema>;

export const CategorySchema = z.enum([
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
]);
export type NoteCategory = z.infer<typeof CategorySchema>;

export const GenerateNotesRequestSchema = z.object({
  sourceType: SourceTypeSchema,
  content: z.string().min(10, 'Content must have at least 10 characters').max(100000, 'Content exceeds maximum length'),
  subject: z.string().max(150).optional().default('General'),
  topic: z.string().max(200).optional().default('Study Notes'),
  course: z.string().max(150).optional(),
  category: CategorySchema.optional().default('General'),
  educationLevel: EducationLevelSchema.optional().default('Undergraduate'),
  noteLength: NoteLengthSchema.optional().default('medium'),
  outputStyle: OutputStyleSchema.optional().default('exam-focused'),
  sourceMaterialId: z.string().uuid().optional()
});

export type GenerateNotesRequest = z.infer<typeof GenerateNotesRequestSchema>;

// ==========================================
// AI Generated Output Schemas (Validated with Zod)
// ==========================================

export const SubtopicSchema = z.object({
  title: z.string().min(1, 'Subtopic title is required'),
  explanation: z.string().min(1, 'Subtopic explanation is required')
});

export const TopicSchema = z.object({
  title: z.string().min(1, 'Topic title is required'),
  subtopics: z.array(SubtopicSchema).min(1, 'At least one subtopic required')
});

export const DefinitionSchema = z.object({
  term: z.string().min(1, 'Term is required'),
  definition: z.string().min(1, 'Definition is required')
});

export const ImportantQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
});

export const FlashcardSchema = z.object({
  question: z.string().min(1, 'Flashcard question is required'),
  answer: z.string().min(1, 'Flashcard answer is required')
});

export const QuizQuestionSchema = z.object({
  question: z.string().min(1, 'Quiz question is required'),
  options: z.array(z.string().min(1)).length(4, 'Quiz question must have exactly 4 options'),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().min(1, 'Explanation is required')
});

export const AINoteResponseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  topics: z.array(TopicSchema).default([]),
  key_points: z.array(z.string().min(1)).default([]),
  definitions: z.array(DefinitionSchema).default([]),
  important_questions: z.array(ImportantQuestionSchema).default([]),
  flashcards: z.array(FlashcardSchema).default([]),
  quiz_questions: z.array(QuizQuestionSchema).default([])
});

export type Subtopic = z.infer<typeof SubtopicSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Definition = z.infer<typeof DefinitionSchema>;
export type ImportantQuestion = z.infer<typeof ImportantQuestionSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type AINoteResponse = z.infer<typeof AINoteResponseSchema>;

// ==========================================
// Note Record Schema & Types
// ==========================================

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
}

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  subject: z.string().max(150).optional(),
  topic: z.string().max(200).optional(),
  category: CategorySchema.optional(),
  summary: z.string().optional(),
  detailed_notes: z.array(TopicSchema).optional(),
  key_points: z.array(z.string()).optional(),
  definitions: z.array(DefinitionSchema).optional(),
  important_questions: z.array(ImportantQuestionSchema).optional(),
  flashcards: z.array(FlashcardSchema).optional(),
  quiz_questions: z.array(QuizQuestionSchema).optional()
});

export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
