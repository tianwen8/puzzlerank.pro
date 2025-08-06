-- Fix function types to match actual database column types
-- This script fixes the type mismatch error in get_user_combined_stats function

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_user_combined_stats(UUID);

-- Create the function with correct types
CREATE OR REPLACE FUNCTION get_user_combined_stats(user_uuid UUID)
RETURNS TABLE(
    -- 2048 stats
    best_score BIGINT,
    total_games BIGINT,
    games_won BIGINT,
    win_rate DECIMAL,
    current_streak BIGINT,
    best_streak BIGINT,
    average_score DECIMAL,
    total_moves BIGINT,
    total_duration_seconds BIGINT,
    highest_tile_achieved BIGINT,
    -- Wordle stats
    wordle_games_played BIGINT,
    wordle_games_won BIGINT,
    wordle_win_rate DECIMAL,
    wordle_current_streak BIGINT,
    wordle_best_streak BIGINT,
    wordle_average_guesses DECIMAL,
    -- Common
    user_rank BIGINT,
    username TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.best_score::BIGINT,
        ps.total_games::BIGINT,
        ps.games_won::BIGINT,
        CASE 
            WHEN ps.total_games = 0 THEN 0.0 
            ELSE ROUND((ps.games_won::DECIMAL / ps.total_games::DECIMAL) * 100, 1)
        END as win_rate,
        ps.current_streak::BIGINT,
        ps.best_streak::BIGINT,
        CASE 
            WHEN ps.total_games = 0 THEN 0.0 
            ELSE ROUND(ps.best_score::DECIMAL / ps.total_games::DECIMAL, 0)
        END as average_score,
        ps.total_moves::BIGINT,
        ps.total_duration_seconds::BIGINT,
        ps.highest_tile_achieved::BIGINT,
        -- Wordle stats
        COALESCE(ps.wordle_games_played, 0)::BIGINT,
        COALESCE(ps.wordle_games_won, 0)::BIGINT,
        CASE 
            WHEN COALESCE(ps.wordle_games_played, 0) = 0 THEN 0.0 
            ELSE ROUND((COALESCE(ps.wordle_games_won, 0)::DECIMAL / COALESCE(ps.wordle_games_played, 0)::DECIMAL) * 100, 1)
        END as wordle_win_rate,
        COALESCE(ps.wordle_current_streak, 0)::BIGINT,
        COALESCE(ps.wordle_best_streak, 0)::BIGINT,
        COALESCE(ps.wordle_average_guesses, 0.0)::DECIMAL,
        -- User rank (based on 2048 for now)
        COALESCE((SELECT rank FROM global_leaderboard WHERE user_id = user_uuid), 0)::BIGINT as user_rank,
        COALESCE(ps.username, 'Player') as username,
        COALESCE(ps.email, '') as email
    FROM player_stats ps
    WHERE ps.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_combined_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_combined_stats(UUID) TO anon; 