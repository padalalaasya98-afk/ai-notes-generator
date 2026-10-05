import { GoogleGenAI } from '@google/genai';
import { normalizeText } from './pdfService';

let aiInstance: GoogleGenAI | null = null;

const TRANSCRIPTION_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-transcribe',
  'gemini-3.7-flash',
  'gemini-3.5-flash'
];

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function transcribeAudio(buffer: Buffer, mimeType: string, filename?: string): Promise<string> {
  const ai = getAiClient();

  let normalizedMime = mimeType.toLowerCase();
  if (normalizedMime === 'audio/x-wav' || normalizedMime === 'audio/wave') {
    normalizedMime = 'audio/wav';
  } else if (normalizedMime === 'audio/x-m4a' || normalizedMime === 'audio/mp4') {
    normalizedMime = 'audio/mp4';
  } else if (normalizedMime === 'audio/mp3') {
    normalizedMime = 'audio/mpeg';
  }

  const prompt = `You are a professional educational lecture transcription engine.
Transcribe this educational audio recording accurately and thoroughly into plain text.
- Preserve all key concepts, technical terminology, names, formulas, and explanations.
- Segment thoughts with natural punctuation and paragraphs for readability.
- Do not add commentary, greetings, or notes about the transcription process.
- Return ONLY the verbatim transcribed educational text.`;

  let lastError: any = null;

  for (const model of TRANSCRIPTION_MODELS) {
    try {
      console.log(`[Audio Transcription] Attempting with model ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            inlineData: {
              mimeType: normalizedMime,
              data: buffer.toString('base64')
            }
          },
          {
            text: prompt
          }
        ]
      });

      const transcript = response.text || '';
      if (transcript.trim()) {
        return normalizeText(transcript);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Audio Transcription] Model ${model} returned:`, err.message || err);
      // Wait 1 second before next model
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.error('[Audio Transcription Error]:', lastError);
  throw new Error(`Audio transcription failed: ${lastError?.message || 'Unable to process audio file.'}`);
}
