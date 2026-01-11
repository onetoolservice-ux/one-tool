-- ==========================================
-- One Tool Database Schema
-- ==========================================
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TOOLS TABLE (Global Catalog)
-- ==========================================
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  icon_name TEXT, -- Store icon name from lucide-react
  color TEXT, -- Tailwind color classes
  href TEXT NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Ready', -- 'Ready', 'New', 'Draft'
  metadata JSONB DEFAULT '{}', -- For additional tool metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tools (but allow public read access)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Anyone can read tools (public catalog)
CREATE POLICY "Tools are publicly readable"
  ON tools FOR SELECT
  USING (true);

-- Only authenticated users with admin role can modify tools
CREATE POLICY "Admins can insert tools"
  ON tools FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tools"
  ON tools FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tools"
  ON tools FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ==========================================
-- 2. USER PROFILES TABLE (Extended User Info)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from changing their own role
    (OLD.role = NEW.role OR OLD.role IS NULL)
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 3. USER FAVORITES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 4. USER RECENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_recents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

ALTER TABLE user_recents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recents"
  ON user_recents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recents"
  ON user_recents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recents"
  ON user_recents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recents"
  ON user_recents FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 5. USER TOOL DATA TABLE (For tool-specific data like budget)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_tool_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

ALTER TABLE user_tool_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tool data"
  ON user_tool_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool data"
  ON user_tool_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool data"
  ON user_tool_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tool data"
  ON user_tool_data FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 6. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_recents_user_id ON user_recents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recents_accessed_at ON user_recents(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_user_id ON user_tool_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_data_tool_id ON user_tool_data(tool_id);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_popular ON tools(popular) WHERE popular = true;

-- ==========================================
-- 7. FUNCTION: Auto-create user profile on signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 8. FUNCTION: Update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_tool_data_updated_at BEFORE UPDATE ON user_tool_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
