import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { CreateTextSourceSchema } from '../schemas';
import { extractTextFromPdf } from '../services/pdfService';
import { transcribeAudio } from '../services/transcriptionService';

export async function createTextSource(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parseResult = CreateTextSourceSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid text content.'
      });
      return;
    }

    const { type, content, filename } = parseResult.data;
    const userId = req.user!.id;

    const result = await query(
      `INSERT INTO source_materials (user_id, type, original_filename, extracted_text, file_size_bytes, processing_status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       RETURNING id, type, original_filename, file_size_bytes, processing_status, created_at`,
      [userId, type, filename || `${type}-input.txt`, content, Buffer.byteLength(content, 'utf8')]
    );

    res.status(201).json({
      success: true,
      source: {
        ...result.rows[0],
        extracted_text: content
      }
    });
  } catch (error: any) {
    console.error('[Create Text Source Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process and store text content.'
    });
  }
}

export async function uploadPdfSource(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Please upload a PDF file.'
      });
      return;
    }

    const userId = req.user!.id;
    const file = req.file;

    // Extract text from PDF buffer
    const { text, pages } = await extractTextFromPdf(file.buffer);

    if (!text || text.trim().length < 10) {
      res.status(400).json({
        success: false,
        error: 'Could not find any readable text in this PDF. It may be an image-only scan or encrypted.'
      });
      return;
    }

    // Save to database
    const result = await query(
      `INSERT INTO source_materials (user_id, type, original_filename, mime_type, extracted_text, file_size_bytes, processing_status)
       VALUES ($1, 'pdf', $2, $3, $4, $5, 'completed')
       RETURNING id, type, original_filename, mime_type, file_size_bytes, processing_status, created_at`,
      [userId, file.originalname, file.mimetype, text, file.size]
    );

    res.status(201).json({
      success: true,
      source: {
        ...result.rows[0],
        extracted_text: text,
        pages
      }
    });
  } catch (error: any) {
    console.error('[Upload PDF Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process PDF document.'
    });
  }
}

export async function uploadAudioSource(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Please upload an audio file.'
      });
      return;
    }

    const userId = req.user!.id;
    const file = req.file;

    console.log(`[Audio Upload] Received ${file.originalname} (${(file.size / (1024 * 1024)).toFixed(2)} MB, ${file.mimetype}). Transcribing with Gemini...`);

    // Transcribe audio using Gemini multimodal capabilities
    const transcript = await transcribeAudio(file.buffer, file.mimetype, file.originalname);

    // Save to database
    const result = await query(
      `INSERT INTO source_materials (user_id, type, original_filename, mime_type, extracted_text, file_size_bytes, processing_status)
       VALUES ($1, 'audio', $2, $3, $4, $5, 'completed')
       RETURNING id, type, original_filename, mime_type, file_size_bytes, processing_status, created_at`,
      [userId, file.originalname, file.mimetype, transcript, file.size]
    );

    res.status(201).json({
      success: true,
      source: {
        ...result.rows[0],
        extracted_text: transcript
      }
    });
  } catch (error: any) {
    console.error('[Upload Audio Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe audio file.'
    });
  }
}

export async function getSources(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const result = await query(
      `SELECT id, type, original_filename, mime_type, file_size_bytes, processing_status, created_at,
              substring(extracted_text, 1, 300) as preview_text
       FROM source_materials
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      sources: result.rows
    });
  } catch (error: any) {
    console.error('[Get Sources Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve source materials.'
    });
  }
}

export async function deleteSource(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const sourceId = req.params.id;

    const result = await query(
      'DELETE FROM source_materials WHERE id = $1 AND user_id = $2 RETURNING id',
      [sourceId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Source material not found or not owned by you.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Source material removed successfully.'
    });
  } catch (error: any) {
    console.error('[Delete Source Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete source material.'
    });
  }
}
