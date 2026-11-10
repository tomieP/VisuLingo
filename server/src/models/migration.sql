-- Migration script for VisuLingo database
-- Create tables in correct dependency order (foreign keys dependent on parent tables)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  status VARCHAR(10) CHECK (status IN ('active', 'locked')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  streak_count INTEGER DEFAULT 0,
  last_active_date DATE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. images table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  width_px INTEGER,
  height_px INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images(uploaded_at);

-- 3. detected_objects table
CREATE TABLE IF NOT EXISTS detected_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(255) NOT NULL,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1) NOT NULL,
  bbox_x NUMERIC CHECK (bbox_x >= 0 AND bbox_x <= 1) NOT NULL,
  bbox_y NUMERIC CHECK (bbox_y >= 0 AND bbox_y <= 1) NOT NULL,
  bbox_w NUMERIC CHECK (bbox_w >= 0 AND bbox_w <= 1) NOT NULL,
  bbox_h NUMERIC CHECK (bbox_h >= 0 AND bbox_h <= 1) NOT NULL,
  raw_label VARCHAR(255),
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX  IF NOT EXISTS idx_detected_objects_image_id ON detected_objects(image_id);
CREATE INDEX  IF NOT EXISTS idx_detected_objects_label ON detected_objects(label);
CREATE INDEX  IF NOT EXISTS idx_detected_objects_confidence ON detected_objects(confidence);

-- 4. vocabularies table
CREATE TABLE IF NOT EXISTS vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(255) UNIQUE NOT NULL,
  meaning_vi VARCHAR(1000) NOT NULL,
  ipa VARCHAR(100),
  example_sentence TEXT,
  source VARCHAR(20) DEFAULT 'api' CHECK (source IN ('api', 'manual', 'ai_gemini')),
  status VARCHAR(10) DEFAULT 'auto' CHECK (status IN ('auto', 'verified', 'hidden')),
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX  IF NOT EXISTS idx_vocabularies_word ON vocabularies(word);
CREATE INDEX  IF NOT EXISTS idx_vocabularies_source ON vocabularies(source);

-- 5. saved_words table
CREATE TABLE IF NOT EXISTS saved_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vocabulary_id UUID REFERENCES vocabularies(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_words_user_vocab ON saved_words(user_id, vocabulary_id);
CREATE INDEX  IF NOT EXISTS idx_saved_words_user_id ON saved_words(user_id);
CREATE INDEX  IF NOT EXISTS idx_saved_words_vocabulary_id ON saved_words(vocabulary_id);

-- 6. collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  theme VARCHAR(100),
  description TEXT,
  cover_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE collections ADD COLUMN IF NOT EXISTS theme VARCHAR(100);
ALTER TABLE collections ADD COLUMN IF NOT EXISTS cover_image_id UUID REFERENCES images(id) ON DELETE SET NULL;
ALTER TABLE images ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(500);

CREATE INDEX  IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX  IF NOT EXISTS idx_collections_is_public ON collections(is_public);

-- 7. collection_images table
CREATE TABLE IF NOT EXISTS collection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_images_collection_image ON collection_images(collection_id, image_id);
CREATE INDEX  IF NOT EXISTS idx_collection_images_collection_id ON collection_images(collection_id);

-- 8. analysis_sessions table
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  total_objects INTEGER DEFAULT 0,
  confidence_threshold NUMERIC CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX  IF NOT EXISTS idx_analysis_sessions_image_id ON analysis_sessions(image_id);
CREATE INDEX  IF NOT EXISTS idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX  IF NOT EXISTS idx_analysis_sessions_status ON analysis_sessions(status);

-- 9. label_mappings table
CREATE TABLE IF NOT EXISTS label_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_label VARCHAR(255) NOT NULL,
  normalized_label VARCHAR(255) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(raw_label, language)
);

CREATE INDEX  IF NOT EXISTS idx_label_mappings_raw ON label_mappings(raw_label);
CREATE INDEX  IF NOT EXISTS idx_label_mappings_normalized ON label_mappings(normalized_label);

-- 10. app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX  IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- 11. usage_events table
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX  IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX  IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);

-- 12. audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX  IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX  IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 13. Ensure default admin user exists
INSERT INTO users (email, password_hash, display_name, role, status)
VALUES (
  'admin@visulingo.com',
  crypt('password123', gen_salt('bf')),
  'Quản trị viên VisuLingo',
  'admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

COMMIT;