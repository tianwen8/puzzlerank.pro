-- Fix NULL values in leaderboard data
-- This script ensures all fields have proper default values

-- Drop and recreate the global_leaderboard view with proper NULL handling
DROP VIEW IF EXISTS global_leaderboard;
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(best_score, 0) DESC, COALESCE(total_games, 0) DESC, updated_at DESC) as rank,
    user_id,
    COALESCE(username, 'Anonymous Player') as username,
    COALESCE(best_score, 0) as best_score,
    COALESCE(total_games, 0) as total_games,
    COALESCE(games_won, 0) as games_won,
    CASE 
        WHEN COALESCE(total_games, 0) = 0 THEN 0.0 
        ELSE ROUND((COALESCE(games_won, 0)::DECIMAL / COALESCE(total_games, 0)::DECIMAL) * 100, 1)
    END as win_rate,
    CASE 
        WHEN COALESCE(total_games, 0) = 0 THEN 0.0 
        ELSE ROUND(COALESCE(best_score, 0)::DECIMAL / COALESCE(total_games, 0)::DECIMAL, 0)
    END as average_score,
    COALESCE(current_streak, 0) as current_streak,
    COALESCE(highest_tile_achieved, 0) as highest_tile_achieved,
    -- Wordle specific columns
    COALESCE(wordle_games_played, 0) as wordle_games_played,
    COALESCE(wordle_games_won, 0) as wordle_games_won,
    COALESCE(wordle_current_streak, 0) as wordle_current_streak,
    COALESCE(wordle_best_streak, 0) as wordle_best_streak,
    COALESCE(wordle_average_guesses, 0.0) as wordle_average_guesses,
    updated_at
FROM player_stats
WHERE COALESCE(total_games, 0) > 0 OR COALESCE(wordle_games_played, 0) > 0
ORDER BY rank;

-- Also ensure the get_user_combined_stats function returns proper defaults
DROP FUNCTION IF EXISTS get_user_combined_stats(UUID);
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
        COALESCE(ps.best_score, 0)::BIGINT,
        COALESCE(ps.total_games, 0)::BIGINT,
        COALESCE(ps.games_won, 0)::BIGINT,
        CASE 
            WHEN COALESCE(ps.total_games, 0) = 0 THEN 0.0 
            ELSE ROUND((COALESCE(ps.games_won, 0)::DECIMAL / COALESCE(ps.total_games, 0)::DECIMAL) * 100, 1)
        END as win_rate,
        COALESCE(ps.current_streak, 0)::BIGINT,
        COALESCE(ps.best_streak, 0)::BIGINT,
        CASE 
            WHEN COALESCE(ps.total_games, 0) = 0 THEN 0.0 
            ELSE ROUND(COALESCE(ps.best_score, 0)::DECIMAL / COALESCE(ps.total_games, 0)::DECIMAL, 0)
        END as average_score,
        COALESCE(ps.total_moves, 0)::BIGINT,
        COALESCE(ps.total_duration_seconds, 0)::BIGINT,
        COALESCE(ps.highest_tile_achieved, 0)::BIGINT,
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
        -- User rank (based on global leaderboard)
        COALESCE((SELECT rank FROM global_leaderboard WHERE user_id = user_uuid), 0)::BIGINT as user_rank,
        COALESCE(ps.username, 'Player') as username,
        COALESCE(ps.email, '') as email
    FROM player_stats ps
    WHERE ps.user_id = user_uuid
    UNION ALL
    -- Return default values if user doesn't exist yet
    SELECT 
        0::BIGINT, 0::BIGINT, 0::BIGINT, 0.0::DECIMAL, 0::BIGINT, 0::BIGINT, 0.0::DECIMAL,
        0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0.0::DECIMAL, 0::BIGINT,
        0::BIGINT, 0.0::DECIMAL, 0::BIGINT, 'Player'::TEXT, ''::TEXT
    WHERE NOT EXISTS (SELECT 1 FROM player_stats WHERE user_id = user_uuid)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_combined_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_combined_stats(UUID) TO anon;
GRANT SELECT ON global_leaderboard TO authenticated;
GRANT SELECT ON global_leaderboard TO anon; 