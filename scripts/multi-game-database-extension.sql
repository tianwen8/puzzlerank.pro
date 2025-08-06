-- Multi-Game Database Extension Script
-- Created: January 15, 2025
-- Purpose: Extend existing database to support multiple game types

-- Create game type enumeration
CREATE TYPE game_type AS ENUM ('2048', 'wordle');

-- Extend game_sessions table for multi-game support
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS game_type game_type DEFAULT '2048',
ADD COLUMN IF NOT EXISTS game_data JSONB;

-- Extend player_stats table for Wordle statistics
ALTER TABLE player_stats 
ADD COLUMN IF NOT EXISTS wordle_games_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordle_games_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordle_current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordle_best_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wordle_average_guesses DECIMAL(3,1) DEFAULT 0.0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_game_type ON game_sessions(user_id, game_type);

-- Create updated global leaderboard view that supports multi-game
DROP VIEW IF EXISTS global_leaderboard;
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY best_score DESC, total_games DESC, updated_at DESC) as rank,
    user_id,
    COALESCE(username, 'Anonymous Player') as username,
    best_score,
    total_games,
    games_won,
    CASE 
        WHEN total_games = 0 THEN 0.0 
        ELSE ROUND((games_won::DECIMAL / total_games::DECIMAL) * 100, 1)
    END as win_rate,
    CASE 
        WHEN total_games = 0 THEN 0.0 
        ELSE ROUND(best_score::DECIMAL / total_games::DECIMAL, 0)
    END as average_score,
    current_streak,
    highest_tile_achieved,
    -- Wordle specific columns
    wordle_games_played,
    wordle_games_won,
    wordle_current_streak,
    wordle_best_streak,
    wordle_average_guesses,
    updated_at
FROM player_stats
WHERE total_games > 0 OR wordle_games_played > 0
ORDER BY best_score DESC, total_games DESC, updated_at DESC
LIMIT 100;

-- Create Wordle specific leaderboard view
CREATE OR REPLACE VIEW wordle_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY wordle_best_streak DESC, wordle_average_guesses ASC, wordle_games_won DESC) as rank,
    user_id,
    COALESCE(username, 'Anonymous Player') as username,
    wordle_games_played,
    wordle_games_won,
    CASE 
        WHEN wordle_games_played = 0 THEN 0.0 
        ELSE ROUND((wordle_games_won::DECIMAL / wordle_games_played::DECIMAL) * 100, 1)
    END as wordle_win_rate,
    wordle_current_streak,
    wordle_best_streak,
    wordle_average_guesses,
    updated_at
FROM player_stats
WHERE wordle_games_played > 0
ORDER BY wordle_best_streak DESC, wordle_average_guesses ASC, wordle_games_won DESC
LIMIT 100;

-- Update the trigger function to handle multi-game statistics
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_stats RECORD;
    new_streak INTEGER := 0;
    user_info RECORD;
    is_game_won BOOLEAN := false;
    avg_guesses DECIMAL(3,1) := 0.0;
BEGIN
    -- Get user information
    SELECT 
        COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Player') as username,
        email
    INTO user_info
    FROM auth.users 
    WHERE id = NEW.user_id;

    -- Get current statistics
    SELECT * INTO current_stats
    FROM player_stats
    WHERE user_id = NEW.user_id;

    -- Handle different game types
    IF NEW.game_type = '2048' THEN
        -- Original 2048 logic
        is_game_won := NEW.is_won OR NEW.highest_tile >= 2048;
        
        -- Calculate new streak
        IF is_game_won THEN
            new_streak = COALESCE(current_stats.current_streak, 0) + 1;
        ELSE
            new_streak = 0;
        END IF;

        -- Update 2048 statistics
        INSERT INTO player_stats (
            user_id, username, email,
            best_score, total_games, games_won, 
            current_streak, best_streak,
            total_moves, total_duration_seconds,
            highest_tile_achieved, updated_at
        )
        VALUES (
            NEW.user_id, user_info.username, user_info.email,
            NEW.score, 1, CASE WHEN is_game_won THEN 1 ELSE 0 END,
            new_streak, new_streak,
            NEW.moves_count, NEW.duration_seconds,
            NEW.highest_tile, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            best_score = GREATEST(player_stats.best_score, NEW.score),
            total_games = player_stats.total_games + 1,
            games_won = player_stats.games_won + CASE WHEN is_game_won THEN 1 ELSE 0 END,
            current_streak = new_streak,
            best_streak = GREATEST(player_stats.best_streak, new_streak),
            total_moves = player_stats.total_moves + NEW.moves_count,
            total_duration_seconds = player_stats.total_duration_seconds + NEW.duration_seconds,
            highest_tile_achieved = GREATEST(player_stats.highest_tile_achieved, NEW.highest_tile),
            username = COALESCE(user_info.username, player_stats.username),
            email = COALESCE(user_info.email, player_stats.email),
            updated_at = NOW();

    ELSIF NEW.game_type = 'wordle' THEN
        -- Wordle logic
        is_game_won := (NEW.game_data->>'isWon')::boolean;
        
        -- Calculate Wordle streak
        IF is_game_won THEN
            new_streak = COALESCE(current_stats.wordle_current_streak, 0) + 1;
        ELSE
            new_streak = 0;
        END IF;

        -- Calculate average guesses
        IF current_stats.user_id IS NOT NULL THEN
            -- Update existing stats
            avg_guesses = CASE 
                WHEN (current_stats.wordle_games_played + 1) = 0 THEN 0.0
                ELSE ROUND(
                    ((current_stats.wordle_average_guesses * current_stats.wordle_games_played) + 
                     (NEW.game_data->>'guessCount')::integer) / 
                    (current_stats.wordle_games_played + 1)::decimal, 1
                )
            END;
        ELSE
            -- New user
            avg_guesses = (NEW.game_data->>'guessCount')::integer;
        END IF;

        -- Update Wordle statistics
        INSERT INTO player_stats (
            user_id, username, email,
            wordle_games_played, wordle_games_won,
            wordle_current_streak, wordle_best_streak,
            wordle_average_guesses, updated_at
        )
        VALUES (
            NEW.user_id, user_info.username, user_info.email,
            1, CASE WHEN is_game_won THEN 1 ELSE 0 END,
            new_streak, new_streak,
            avg_guesses, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            wordle_games_played = player_stats.wordle_games_played + 1,
            wordle_games_won = player_stats.wordle_games_won + CASE WHEN is_game_won THEN 1 ELSE 0 END,
            wordle_current_streak = new_streak,
            wordle_best_streak = GREATEST(player_stats.wordle_best_streak, new_streak),
            wordle_average_guesses = avg_guesses,
            username = COALESCE(user_info.username, player_stats.username),
            email = COALESCE(user_info.email, player_stats.email),
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error updating player stats for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get combined user statistics
CREATE OR REPLACE FUNCTION get_user_combined_stats(user_uuid UUID)
RETURNS TABLE(
    -- 2048 stats
    best_score INTEGER,
    total_games INTEGER,
    games_won INTEGER,
    win_rate DECIMAL,
    current_streak INTEGER,
    best_streak INTEGER,
    average_score DECIMAL,
    total_moves INTEGER,
    total_duration_seconds INTEGER,
    highest_tile_achieved INTEGER,
    -- Wordle stats
    wordle_games_played INTEGER,
    wordle_games_won INTEGER,
    wordle_win_rate DECIMAL,
    wordle_current_streak INTEGER,
    wordle_best_streak INTEGER,
    wordle_average_guesses DECIMAL,
    -- Common
    user_rank INTEGER,
    username TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.best_score,
        ps.total_games,
        ps.games_won,
        CASE 
            WHEN ps.total_games = 0 THEN 0.0 
            ELSE ROUND((ps.games_won::DECIMAL / ps.total_games::DECIMAL) * 100, 1)
        END as win_rate,
        ps.current_streak,
        ps.best_streak,
        CASE 
            WHEN ps.total_games = 0 THEN 0.0 
            ELSE ROUND(ps.best_score::DECIMAL / ps.total_games::DECIMAL, 0)
        END as average_score,
        ps.total_moves,
        ps.total_duration_seconds,
        ps.highest_tile_achieved,
        -- Wordle stats
        ps.wordle_games_played,
        ps.wordle_games_won,
        CASE 
            WHEN ps.wordle_games_played = 0 THEN 0.0 
            ELSE ROUND((ps.wordle_games_won::DECIMAL / ps.wordle_games_played::DECIMAL) * 100, 1)
        END as wordle_win_rate,
        ps.wordle_current_streak,
        ps.wordle_best_streak,
        ps.wordle_average_guesses,
        -- User rank (based on 2048 for now)
        COALESCE((SELECT rank FROM global_leaderboard WHERE user_id = user_uuid), 0) as user_rank,
        COALESCE(ps.username, 'Player') as username,
        COALESCE(ps.email, '') as email
    FROM player_stats ps
    WHERE ps.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TYPE game_type IS 'Enumeration of supported game types';
COMMENT ON COLUMN game_sessions.game_type IS 'Type of game played in this session';
COMMENT ON COLUMN game_sessions.game_data IS 'Game-specific data stored as JSON';
COMMENT ON COLUMN player_stats.wordle_games_played IS 'Total number of Wordle games played';
COMMENT ON COLUMN player_stats.wordle_games_won IS 'Total number of Wordle games won';
COMMENT ON COLUMN player_stats.wordle_current_streak IS 'Current Wordle win streak';
COMMENT ON COLUMN player_stats.wordle_best_streak IS 'Best Wordle win streak achieved';
COMMENT ON COLUMN player_stats.wordle_average_guesses IS 'Average number of guesses per Wordle game'; 