export const SYSTEM_PROMPT = `You are an expert educational note-generation assistant.

Your job is to transform raw educational content into accurate, organized, easy-to-understand study material.

The input may come from:
- A lecture transcript
- Audio transcription
- PDF text
- Student-provided text

Do not invent facts that are not supported by the provided content.

Preserve important technical terminology.

Identify the main subject and concepts.

Organize information into logical topics and subtopics.

Prefer concise explanations over unnecessary repetition.

For definitions, provide clear and student-friendly explanations.

For important questions, prioritize concepts that appear central to the source material.

For flashcards, create useful question-answer pairs.

For quizzes, create meaningful questions based on the source material.

If the source contains ambiguity or insufficient information, do not confidently invent an answer.

The final output must be valid structured JSON matching the required schema.

The content should be suitable for students and useful for revision and examination preparation.

Do not include markdown outside fields where markdown is explicitly permitted.

Do not include commentary about being an AI.

Do not include unsupported claims.

Return only the requested structured output.`;

export interface NotesPromptParams {
  subject?: string;
  topic?: string;
  educationLevel?: string;
  noteLength?: string;
  outputStyle?: string;
  content: string;
}

export function buildNotesPrompt(params: NotesPromptParams): string {
  return `Generate structured study notes from the following educational material.

Subject:
${params.subject || 'General'}

Topic:
${params.topic || 'Study Notes'}

Education Level:
${params.educationLevel || 'Undergraduate'}

Requested Note Length:
${params.noteLength || 'medium'}

Output Style:
${params.outputStyle || 'exam-focused'}

Source Material:
${params.content}

Instructions for JSON response:
Return a single JSON object with the following schema:
{
  "title": "A clear, descriptive title for these notes",
  "summary": "A concise summary of the material covering main ideas",
  "topics": [
    {
      "title": "Topic name",
      "subtopics": [
        {
          "title": "Subtopic heading",
          "explanation": "Clear explanation of this subtopic"
        }
      ]
    }
  ],
  "key_points": [
    "Key takeaway point 1",
    "Key takeaway point 2"
  ],
  "definitions": [
    {
      "term": "Term name",
      "definition": "Clear student-friendly explanation"
    }
  ],
  "important_questions": [
    {
      "question": "Likely examination question",
      "answer": "Comprehensive answer based on content"
    }
  ],
  "flashcards": [
    {
      "question": "Flashcard question or prompt",
      "answer": "Accurate answer for fast recall"
    }
  ],
  "quiz_questions": [
    {
      "question": "Multiple choice question testing understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why this answer is correct"
    }
  ]
}

Make sure:
- 'quiz_questions' has exactly 4 options per question, and 'correct_answer' matches one of the options word for word.
- Generate at least 3-6 topics with subtopics.
- Generate at least 4-8 key points.
- Generate at least 3-6 definitions of key terms.
- Generate at least 3-5 important exam questions.
- Generate at least 4-8 flashcards.
- Generate at least 3-5 quiz questions.
- Return ONLY valid JSON.`;
}
