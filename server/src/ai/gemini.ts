import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, buildNotesPrompt, NotesPromptParams } from './prompts';
import { AINoteResponseSchema } from '../schemas';
import { z } from 'zod';

export type AINoteResponse = z.infer<typeof AINoteResponseSchema>;

let aiClient: GoogleGenAI | null = null;

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  }
  return cleaned.trim();
}

async function callGeminiWithFallback(prompt: string, isCorrection = false): Promise<string> {
  const ai = getAiClient();
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI] Generating content with ${modelName} (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        if (text.trim()) {
          return text;
        }
      } catch (err: any) {
        lastError = err;
        const isTransient = err.status === 503 || err.status === 429 || err.message?.includes('high demand');
        console.warn(`[AI] Attempt ${attempt} on ${modelName} failed (${err.status || err.message}).`);
        if (isTransient) {
          // Wait 1.5s before next attempt
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          break; // Try next model immediately
        }
      }
    }
  }

  throw lastError || new Error('All AI model candidate endpoints failed to respond.');
}

export async function generateStudyNotes(params: NotesPromptParams): Promise<AINoteResponse> {
  const prompt = buildNotesPrompt(params);

  try {
    const rawText = await callGeminiWithFallback(prompt);
    const cleanedText = cleanJsonString(rawText);

    let parsed: any;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseErr: any) {
      console.warn('[AI] Initial JSON parse failed. Retrying with correction prompt...');
      return await retryWithCorrection(prompt, cleanedText);
    }

    // Validate with Zod
    const validationResult = AINoteResponseSchema.safeParse(parsed);
    if (!validationResult.success) {
      console.warn('[AI] Initial Zod validation failed:', validationResult.error.format());
      return await retryWithCorrection(prompt, JSON.stringify(parsed));
    }

    return validationResult.data;
  } catch (error: any) {
    console.error('[AI Generation Error]:', error);
    throw new Error(`Failed to generate study notes: ${error.message || 'Unknown AI error'}`);
  }
}

async function retryWithCorrection(originalPrompt: string, faultyOutput: string): Promise<AINoteResponse> {
  const correctionPrompt = `${originalPrompt}

PREVIOUS ATTEMPT PRODUCED INVALID FORMAT OR JSON:
${faultyOutput.substring(0, 1000)}

CORRECTION INSTRUCTION:
Return ONLY perfectly formatted valid JSON matching the exact required schema.
Ensure all required keys exist: "title", "summary", "topics", "key_points", "definitions", "important_questions", "flashcards", "quiz_questions".
Ensure each quiz item has exactly 4 options in an array and "correct_answer" matches one option.`;

  const rawText = await callGeminiWithFallback(correctionPrompt, true);
  const cleaned = cleanJsonString(rawText);
  const parsed = JSON.parse(cleaned);

  const validationResult = AINoteResponseSchema.safeParse(parsed);
  if (!validationResult.success) {
    console.error('[AI] Correction retry also failed validation:', validationResult.error.format());
    throw new Error('AI output could not be formatted into the required educational study schema.');
  }

  return validationResult.data;
}
