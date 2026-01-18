-- Shadowing App Initial Schema Migration
-- Creates tables for materials, practice logs, gamification features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Statistics Table
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_practices INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    average_score DECIMAL(5,2) DEFAULT 0.0,
    last_practice_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materials Table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    audio_url TEXT,
    duration_seconds INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sentences Table (for synchronized subtitles)
CREATE TABLE sentences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    start_time DECIMAL(10,3) NOT NULL,
    end_time DECIMAL(10,3) NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Practice Logs Table
CREATE TABLE practice_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    duration_seconds INTEGER NOT NULL,
    xp_gained INTEGER DEFAULT 0,
    user_transcript TEXT,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily Goals Table
CREATE TABLE daily_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    target_count INTEGER DEFAULT 5,
    completed_count INTEGER DEFAULT 0,
    goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, goal_date)
);

-- Achievements Table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_type)
);

-- Create indexes for better query performance
CREATE INDEX idx_materials_difficulty ON materials(difficulty);
CREATE INDEX idx_materials_created_by ON materials(created_by);
CREATE INDEX idx_sentences_material_id ON sentences(material_id);
CREATE INDEX idx_sentences_sequence ON sentences(material_id, sequence_order);
CREATE INDEX idx_practice_logs_user_id ON practice_logs(user_id);
CREATE INDEX idx_practice_logs_material_id ON practice_logs(material_id);
CREATE INDEX idx_practice_logs_created_at ON practice_logs(created_at DESC);
CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, goal_date);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
    ON user_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for materials (public read, authenticated create)
CREATE POLICY "Anyone can view materials"
    ON materials FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create materials"
    ON materials FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own materials"
    ON materials FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own materials"
    ON materials FOR DELETE
    USING (auth.uid() = created_by);

-- RLS Policies for sentences (public read, linked to materials)
CREATE POLICY "Anyone can view sentences"
    ON sentences FOR SELECT
    USING (true);

CREATE POLICY "Users can insert sentences for their materials"
    ON sentences FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM materials
            WHERE materials.id = sentences.material_id
            AND materials.created_by = auth.uid()
        )
    );

-- RLS Policies for practice_logs
CREATE POLICY "Users can view their own practice logs"
    ON practice_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice logs"
    ON practice_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_goals
CREATE POLICY "Users can view their own daily goals"
    ON daily_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals"
    ON daily_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily goals"
    ON daily_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements"
    ON achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
    ON achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at
    BEFORE UPDATE ON daily_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for audio files (run via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);

-- Storage policy for audio files (run after bucket creation)
-- CREATE POLICY "Anyone can view audio files"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'audio-files');
--
-- CREATE POLICY "Authenticated users can upload audio files"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'audio-files' AND auth.role() = 'authenticated');
