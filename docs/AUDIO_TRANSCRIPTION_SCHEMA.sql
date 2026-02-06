-- ==========================================
-- Audio Transcription Database Schema
-- ==========================================
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

-- ==========================================
-- 1. AUDIO TRANSCRIPTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS audio_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Audio metadata
  audio_file_name TEXT NOT NULL,
  audio_file_size BIGINT,
  audio_file_type TEXT, -- mp3, wav, m4a, etc.
  audio_duration_seconds INTEGER,
  
  -- Processing settings
  language TEXT DEFAULT 'auto', -- auto, en, hi, etc.
  speaker_count TEXT DEFAULT 'auto', -- auto, single, multi
  processing_status TEXT DEFAULT 'pending', -- pending, transcribing, processing, completed, failed
  
  -- Transcript data
  raw_transcript TEXT,
  clean_transcript TEXT,
  structured_transcript JSONB, -- JSON with headings, paragraphs, bullets
  
  -- Extracted insights
  ideas JSONB DEFAULT '[]', -- Array of content ideas
  hooks JSONB DEFAULT '[]', -- Array of hooks (first 3-5 seconds)
  quotes JSONB DEFAULT '[]', -- Array of quotable lines
  talking_points JSONB DEFAULT '[]', -- Array of key talking points
  action_items JSONB DEFAULT '[]', -- Array of action items
  
  -- Generated outputs
  outputs JSONB DEFAULT '{}', -- { youtube_script: "...", blog_article: "...", etc. }
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Additional metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audio_transcripts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transcripts
CREATE POLICY "Users can view own transcripts"
  ON audio_transcripts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transcripts
CREATE POLICY "Users can insert own transcripts"
  ON audio_transcripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transcripts
CREATE POLICY "Users can update own transcripts"
  ON audio_transcripts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transcripts
CREATE POLICY "Users can delete own transcripts"
  ON audio_transcripts FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 2. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_audio_transcripts_user_id ON audio_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_transcripts_created_at ON audio_transcripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_transcripts_status ON audio_transcripts(processing_status);

-- ==========================================
-- 3. FUNCTION: Update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_audio_transcripts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_audio_transcripts_updated_at ON audio_transcripts;
CREATE TRIGGER update_audio_transcripts_updated_at
  BEFORE UPDATE ON audio_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_audio_transcripts_updated_at();
