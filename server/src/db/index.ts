import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

interface DatabaseClient {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  exec?(sql: string): Promise<void>;
}

let dbInstance: DatabaseClient | null = null;
let isPostgres = false;
let saveDebounceTimer: NodeJS.Timeout | null = null;

const DATA_DIR = path.resolve(__dirname, '../../data');
const DUMP_FILE = path.join(DATA_DIR, 'db_state.json');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'pdf', 'audio', 'transcript')),
    original_filename TEXT,
    mime_type TEXT,
    extracted_text TEXT,
    file_size_bytes BIGINT,
    processing_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_material_id UUID REFERENCES source_materials(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    subject VARCHAR(150),
    topic VARCHAR(200),
    category VARCHAR(100),
    education_level VARCHAR(100),
    note_length VARCHAR(30),
    output_style VARCHAR(50),
    summary TEXT,
    detailed_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
    important_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    flashcards JSONB NOT NULL DEFAULT '[]'::jsonb,
    quiz_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_materials_user_id ON source_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
`;

export async function initDb(): Promise<DatabaseClient> {
  if (dbInstance) return dbInstance;

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim() !== '') {
    console.log('[DB] Connecting to PostgreSQL server via DATABASE_URL...');
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });

    const client = await pool.connect();
    try {
      await client.query(SCHEMA_SQL);
      console.log('[DB] PostgreSQL schema initialized successfully.');
    } finally {
      client.release();
    }

    isPostgres = true;
    dbInstance = {
      async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        const res = await pool.query(text, params);
        return {
          rows: res.rows,
          rowCount: res.rowCount ?? res.rows.length
        };
      }
    };
  } else {
    console.log('[DB] Initializing PostgreSQL engine (PGlite) with file-backed persistence...');
    const pglite = new PGlite();
    await pglite.exec(SCHEMA_SQL);

    // Restore saved state if file exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DUMP_FILE)) {
      try {
        const dump = JSON.parse(fs.readFileSync(DUMP_FILE, 'utf8'));
        if (dump.users && Array.isArray(dump.users)) {
          for (const u of dump.users) {
            await pglite.query(
              `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
              [u.id, u.name, u.email, u.password_hash, u.created_at, u.updated_at]
            );
          }
        }
        if (dump.source_materials && Array.isArray(dump.source_materials)) {
          for (const s of dump.source_materials) {
            await pglite.query(
              `INSERT INTO source_materials (id, user_id, type, original_filename, mime_type, extracted_text, file_size_bytes, processing_status, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
              [s.id, s.user_id, s.type, s.original_filename, s.mime_type, s.extracted_text, s.file_size_bytes, s.processing_status, s.created_at]
            );
          }
        }
        if (dump.notes && Array.isArray(dump.notes)) {
          for (const n of dump.notes) {
            await pglite.query(
              `INSERT INTO notes (
                id, user_id, source_material_id, title, subject, topic, category,
                education_level, note_length, output_style, summary,
                detailed_notes, key_points, definitions, important_questions,
                flashcards, quiz_questions, created_at, updated_at
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
               ON CONFLICT (id) DO NOTHING`,
              [
                n.id, n.user_id, n.source_material_id, n.title, n.subject, n.topic, n.category,
                n.education_level, n.note_length, n.output_style, n.summary,
                JSON.stringify(n.detailed_notes || []),
                JSON.stringify(n.key_points || []),
                JSON.stringify(n.definitions || []),
                JSON.stringify(n.important_questions || []),
                JSON.stringify(n.flashcards || []),
                JSON.stringify(n.quiz_questions || []),
                n.created_at, n.updated_at
              ]
            );
          }
        }
        console.log(`[DB] Restored database state from ${DUMP_FILE}`);
      } catch (err) {
        console.warn('[DB] Could not restore previous state snapshot:', err);
      }
    }

    const scheduleSave = () => {
      if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
      saveDebounceTimer = setTimeout(async () => {
        try {
          const users = (await pglite.query('SELECT * FROM users')).rows;
          const sources = (await pglite.query('SELECT * FROM source_materials')).rows;
          const notes = (await pglite.query('SELECT * FROM notes')).rows;
          fs.writeFileSync(DUMP_FILE, JSON.stringify({ users, source_materials: sources, notes }, null, 2));
        } catch (e) {
          console.error('[DB Save Error]:', e);
        }
      }, 500);
    };

    dbInstance = {
      async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        const cleanParams = params ? params.map(p => {
          if (p !== null && typeof p === 'object' && !(p instanceof Date)) {
            return JSON.stringify(p);
          }
          return p;
        }) : [];

        const res = await pglite.query<T>(text, cleanParams);

        // If mutating, trigger debounced save
        const trimmed = text.trim().toUpperCase();
        if (trimmed.startsWith('INSERT') || trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE')) {
          scheduleSave();
        }

        return {
          rows: (res.rows || []).map((row: any) => {
            if (row && typeof row === 'object') {
              for (const key of ['detailed_notes', 'key_points', 'definitions', 'important_questions', 'flashcards', 'quiz_questions']) {
                if (typeof row[key] === 'string') {
                  try {
                    row[key] = JSON.parse(row[key]);
                  } catch (e) {
                    // keep
                  }
                }
              }
            }
            return row;
          }),
          rowCount: res.rows ? res.rows.length : 0
        };
      },
      async exec(sql: string) {
        await pglite.exec(sql);
      }
    };

    console.log('[DB] PostgreSQL engine initialized successfully with persistence.');
  }

  return dbInstance;
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  if (!dbInstance) {
    await initDb();
  }
  return dbInstance!.query<T>(text, params);
}

export { isPostgres };
