-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    moves_count INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    is_won BOOLEAN NOT NULL DEFAULT false,
    highest_tile INTEGER NOT NULL DEFAULT 0,
    game_board JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT,
    avatar_url TEXT,
    best_score INTEGER NOT NULL DEFAULT 0,
    total_games INTEGER NOT NULL DEFAULT 0,
    games_won INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    total_moves INTEGER NOT NULL DEFAULT 0,
    total_duration_seconds INTEGER NOT NULL DEFAULT 0,
    highest_tile_achieved INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create computed columns for player_stats
ALTER TABLE player_stats 
ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
        WHEN total_games = 0 THEN 0 
        ELSE ROUND((games_won::DECIMAL / total_games::DECIMAL) * 100, 2)
    END
) STORED;

ALTER TABLE player_stats 
ADD COLUMN IF NOT EXISTS average_score DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
        WHEN total_games = 0 THEN 0 
        ELSE ROUND(best_score::DECIMAL / total_games::DECIMAL, 2)
    END
) STORED;

-- Create global_leaderboard view
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY best_score DESC, total_games DESC) as rank,
    user_id,
    username,
    best_score,
    total_games,
    games_won,
    win_rate,
    average_score,
    current_streak,
    highest_tile_achieved,
    updated_at
FROM player_stats
WHERE total_games > 0
ORDER BY best_score DESC, total_games DESC
LIMIT 100;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_best_score ON player_stats(best_score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for game_sessions
CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for player_stats
CREATE POLICY "Users can view own player stats" ON player_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own player stats" ON player_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player stats" ON player_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read access to global leaderboard data (anonymized)
CREATE POLICY "Anyone can view leaderboard" ON player_stats
    FOR SELECT USING (true);

-- Create function to update player stats after game session
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_stats (
        user_id, 
        username,
        email,
        best_score, 
        total_games, 
        games_won, 
        total_moves,
        total_duration_seconds,
        highest_tile_achieved
    )
    VALUES (
        NEW.user_id,
        (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = NEW.user_id),
        (SELECT email FROM auth.users WHERE id = NEW.user_id),
        NEW.score,
        1,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        NEW.moves_count,
        NEW.duration_seconds,
        NEW.highest_tile
    )
    ON CONFLICT (user_id) DO UPDATE SET
        best_score = GREATEST(player_stats.best_score, NEW.score),
        total_games = player_stats.total_games + 1,
        games_won = player_stats.games_won + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        total_moves = player_stats.total_moves + NEW.moves_count,
        total_duration_seconds = player_stats.total_duration_seconds + NEW.duration_seconds,
        highest_tile_achieved = GREATEST(player_stats.highest_tile_achieved, NEW.highest_tile),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update player stats
CREATE TRIGGER update_player_stats_trigger
    AFTER INSERT ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_player_stats();

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_stats (user_id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
