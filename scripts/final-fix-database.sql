-- Final Database Fix Script
-- This script ensures all multi-game features work properly

-- Ensure the global_leaderboard view exists and works correctly
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
    COALESCE(wordle_games_played, 0) as wordle_games_played,
    COALESCE(wordle_games_won, 0) as wordle_games_won,
    COALESCE(wordle_current_streak, 0) as wordle_current_streak,
    COALESCE(wordle_best_streak, 0) as wordle_best_streak,
    COALESCE(wordle_average_guesses, 0.0) as wordle_average_guesses,
    updated_at
FROM player_stats
WHERE total_games > 0
ORDER BY rank;

-- Ensure the get_user_combined_stats function works correctly
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

-- Ensure proper permissions on the view
GRANT SELECT ON global_leaderboard TO authenticated;
GRANT SELECT ON global_leaderboard TO anon;

-- Create some sample data if tables are empty (for testing)
INSERT INTO player_stats (user_id, username, email, best_score, total_games, games_won, current_streak, best_streak, total_moves, total_duration_seconds, highest_tile_achieved, wordle_games_played, wordle_games_won, wordle_current_streak, wordle_best_streak, wordle_average_guesses)
SELECT 
    gen_random_uuid(),
    'Player ' || generate_series,
    'player' || generate_series || '@example.com',
    floor(random() * 10000 + 1000)::INTEGER,
    floor(random() * 50 + 10)::INTEGER,
    floor(random() * 25 + 5)::INTEGER,
    floor(random() * 10)::INTEGER,
    floor(random() * 15 + 1)::INTEGER,
    floor(random() * 5000 + 1000)::INTEGER,
    floor(random() * 3600 + 300)::INTEGER,
    floor(random() * 1000 + 64)::INTEGER,
    floor(random() * 30 + 5)::INTEGER,
    floor(random() * 20 + 3)::INTEGER,
    floor(random() * 8)::INTEGER,
    floor(random() * 12 + 1)::INTEGER,
    round((random() * 2 + 3)::DECIMAL, 1)
FROM generate_series(1, 20)
WHERE NOT EXISTS (SELECT 1 FROM player_stats LIMIT 1);

-- Refresh the view
REFRESH MATERIALIZED VIEW IF EXISTS global_leaderboard_cache; 