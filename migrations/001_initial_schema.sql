-- AI Notes Generator Database Schema
-- Production PostgreSQL DDL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
