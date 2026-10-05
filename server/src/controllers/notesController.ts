import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { GenerateNotesRequestSchema, UpdateNoteSchema } from '../schemas';
import { generateStudyNotes } from '../ai/gemini';

export async function generateNotes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parseResult = GenerateNotesRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid note generation parameters.'
      });
      return;
    }

    const {
      sourceType,
      content,
      subject,
      topic,
      course,
      category,
      educationLevel,
      noteLength,
      outputStyle,
      sourceMaterialId
    } = parseResult.data;

    const userId = req.user!.id;

    console.log(`[AI Generation] User ${userId} requested notes generation for Subject: "${subject}", Topic: "${topic}" (${content.length} chars)`);

    // Call Gemini with structured prompts and system instructions
    const aiOutput = await generateStudyNotes({
      subject,
      topic,
      educationLevel,
      noteLength,
      outputStyle,
      content
    });

    // Save generated note to PostgreSQL with parameterized query and user isolation
    const insertResult = await query(
      `INSERT INTO notes (
        user_id, source_material_id, title, subject, topic, category,
        education_level, note_length, output_style, summary,
        detailed_notes, key_points, definitions, important_questions,
        flashcards, quiz_questions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        userId,
        sourceMaterialId || null,
        aiOutput.title || `${subject || 'Lecture'} - ${topic || 'Notes'}`,
        subject || null,
        topic || null,
        category || 'General',
        educationLevel || 'Undergraduate',
        noteLength || 'medium',
        outputStyle || 'exam-focused',
        aiOutput.summary,
        aiOutput.topics,
        aiOutput.key_points,
        aiOutput.definitions,
        aiOutput.important_questions,
        aiOutput.flashcards,
        aiOutput.quiz_questions
      ]
    );

    const createdNote = insertResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Study notes generated successfully.',
      note: createdNote
    });
  } catch (error: any) {
    console.error('[Generate Notes Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate study notes from the provided material.'
    });
  }
}

export async function getNotes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { search, category, sort } = req.query as { search?: string; category?: string; sort?: string };

    let sql = `
      SELECT id, user_id, source_material_id, title, subject, topic, category,
             education_level, note_length, output_style, summary,
             jsonb_array_length(detailed_notes) as topic_count,
             jsonb_array_length(flashcards) as flashcard_count,
             jsonb_array_length(quiz_questions) as quiz_count,
             created_at, updated_at
      FROM notes
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (category && category !== 'All' && category.trim() !== '') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (search && search.trim() !== '') {
      sql += ` AND (
        title ILIKE $${paramIndex} OR
        topic ILIKE $${paramIndex} OR
        subject ILIKE $${paramIndex} OR
        summary ILIKE $${paramIndex}
      )`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Sorting
    if (sort === 'oldest') {
      sql += ' ORDER BY created_at ASC';
    } else if (sort === 'title_asc') {
      sql += ' ORDER BY title ASC';
    } else if (sort === 'title_desc') {
      sql += ' ORDER BY title DESC';
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      notes: result.rows
    });
  } catch (error: any) {
    console.error('[Get Notes Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notes.'
    });
  }
}

export async function getNoteById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;

    // Strict row level ownership check
    const result = await query(
      `SELECT n.*, s.original_filename, s.type as source_type
       FROM notes n
       LEFT JOIN source_materials s ON n.source_material_id = s.id
       WHERE n.id = $1 AND n.user_id = $2`,
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Note not found or access denied.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      note: result.rows[0]
    });
  } catch (error: any) {
    console.error('[Get Note Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note details.'
    });
  }
}

export async function updateNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;

    const parseResult = UpdateNoteSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid note update data.'
      });
      return;
    }

    // Verify ownership first
    const check = await query('SELECT id FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
    if (check.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Note not found or access denied.'
      });
      return;
    }

    const updates = parseResult.data;
    const setClauses: string[] = ['updated_at = NOW()'];
    const params: any[] = [noteId, userId];
    let paramIndex = 3;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`);
      params.push(updates.title);
    }
    if (updates.subject !== undefined) {
      setClauses.push(`subject = $${paramIndex++}`);
      params.push(updates.subject);
    }
    if (updates.topic !== undefined) {
      setClauses.push(`topic = $${paramIndex++}`);
      params.push(updates.topic);
    }
    if (updates.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      params.push(updates.category);
    }
    if (updates.summary !== undefined) {
      setClauses.push(`summary = $${paramIndex++}`);
      params.push(updates.summary);
    }
    if (updates.detailed_notes !== undefined) {
      setClauses.push(`detailed_notes = $${paramIndex++}`);
      params.push(updates.detailed_notes);
    }
    if (updates.key_points !== undefined) {
      setClauses.push(`key_points = $${paramIndex++}`);
      params.push(updates.key_points);
    }
    if (updates.definitions !== undefined) {
      setClauses.push(`definitions = $${paramIndex++}`);
      params.push(updates.definitions);
    }
    if (updates.important_questions !== undefined) {
      setClauses.push(`important_questions = $${paramIndex++}`);
      params.push(updates.important_questions);
    }
    if (updates.flashcards !== undefined) {
      setClauses.push(`flashcards = $${paramIndex++}`);
      params.push(updates.flashcards);
    }
    if (updates.quiz_questions !== undefined) {
      setClauses.push(`quiz_questions = $${paramIndex++}`);
      params.push(updates.quiz_questions);
    }

    const sql = `
      UPDATE notes
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      note: result.rows[0]
    });
  } catch (error: any) {
    console.error('[Update Note Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update note.'
    });
  }
}

export async function deleteNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;

    // Strict row-level ownership check
    const result = await query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Note not found or access denied.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully.'
    });
  } catch (error: any) {
    console.error('[Delete Note Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete note.'
    });
  }
}

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    // Run aggregations for dashboard metrics
    const countRes = await query(
      `SELECT
        COUNT(*) as total_notes,
        COALESCE(SUM(jsonb_array_length(flashcards)), 0) as total_flashcards,
        COALESCE(SUM(jsonb_array_length(quiz_questions)), 0) as total_quiz_questions
       FROM notes
       WHERE user_id = $1`,
      [userId]
    );

    const sourceRes = await query(
      'SELECT COUNT(*) as total_sources FROM source_materials WHERE user_id = $1',
      [userId]
    );

    const categoriesRes = await query(
      `SELECT category, COUNT(*) as count
       FROM notes
       WHERE user_id = $1
       GROUP BY category
       ORDER BY count DESC
       LIMIT 5`,
      [userId]
    );

    const recentNotesRes = await query(
      `SELECT id, title, subject, topic, category, created_at,
              jsonb_array_length(flashcards) as flashcard_count,
              jsonb_array_length(quiz_questions) as quiz_count
       FROM notes
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 4`,
      [userId]
    );

    const stats = countRes.rows[0];

    res.status(200).json({
      success: true,
      stats: {
        totalNotes: parseInt(stats.total_notes, 10) || 0,
        totalFlashcards: parseInt(stats.total_flashcards, 10) || 0,
        totalQuizQuestions: parseInt(stats.total_quiz_questions, 10) || 0,
        totalSources: parseInt(sourceRes.rows[0]?.total_sources, 10) || 0,
        topCategories: categoriesRes.rows,
        recentNotes: recentNotesRes.rows
      }
    });
  } catch (error: any) {
    console.error('[Dashboard Stats Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard metrics.'
    });
  }
}
