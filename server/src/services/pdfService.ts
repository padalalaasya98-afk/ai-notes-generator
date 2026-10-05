import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(buffer: Buffer): Promise<{ text: string; pages: number }> {
  try {
    const data = await pdfParse(buffer);
    const cleanedText = normalizeText(data.text);
    return {
      text: cleanedText,
      pages: data.numpages || 1
    };
  } catch (error: any) {
    console.error('[PDF Extraction Error]:', error);
    throw new Error('Failed to extract text from PDF document. Please ensure the PDF contains readable text.');
  }
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    // Replace multiple newlines with at most two
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    // Replace multiple horizontal spaces with a single space
    .replace(/[ \t]+/g, ' ')
    // Remove control characters except newlines/tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}
