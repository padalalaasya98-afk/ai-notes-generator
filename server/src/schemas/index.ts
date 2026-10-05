import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name must be at most 120 characters'),
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100)
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const SourceTypeSchema = z.enum(['text', 'pdf', 'audio', 'transcript']);

export const EducationLevelSchema = z.enum([
  'School',
  'Undergraduate',
  'Postgraduate',
  'Competitive Exam',
  'General Learning'
]);

export const NoteLengthSchema = z.enum(['short', 'medium', 'detailed']);

export const OutputStyleSchema = z.enum([
  'simple',
  'academic',
  'exam-focused',
  'revision-focused'
]);

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

export const CreateTextSourceSchema = z.object({
  type: z.enum(['text', 'transcript']),
  content: z.string().min(10, 'Content must be at least 10 characters').max(150000, 'Content is too long'),
  filename: z.string().max(255).optional()
});

export const GenerateNotesRequestSchema = z.object({
  sourceType: SourceTypeSchema.default('text'),
  content: z.string().min(10, 'Content must have at least 10 characters').max(150000, 'Content exceeds maximum length'),
  subject: z.string().max(150).optional().default('General'),
  topic: z.string().max(200).optional().default('Study Notes'),
  course: z.string().max(150).optional().default(''),
  category: CategorySchema.optional().default('General'),
  educationLevel: EducationLevelSchema.optional().default('Undergraduate'),
  noteLength: NoteLengthSchema.optional().default('medium'),
  outputStyle: OutputStyleSchema.optional().default('exam-focused'),
  sourceMaterialId: z.string().uuid().optional().nullable()
});

// AI Generated Output Validation Schemas
export const SubtopicSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1)
});

export const TopicSchema = z.object({
  title: z.string().min(1),
  subtopics: z.array(SubtopicSchema).default([])
});

export const DefinitionSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1)
});

export const ImportantQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1)
});

export const FlashcardSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1)
});

export const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).length(4),
  correct_answer: z.string().min(1),
  explanation: z.string().min(1)
});

export const AINoteResponseSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  topics: z.array(TopicSchema).default([]),
  key_points: z.array(z.string()).default([]),
  definitions: z.array(DefinitionSchema).default([]),
  important_questions: z.array(ImportantQuestionSchema).default([]),
  flashcards: z.array(FlashcardSchema).default([]),
  quiz_questions: z.array(QuizQuestionSchema).default([])
});

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
