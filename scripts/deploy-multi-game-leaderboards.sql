-- Complete Multi-Game Leaderboard Deployment Script
-- This script sets up separate leaderboards for 2048 and Wordle games
-- Run this script in Supabase SQL Editor

-- 1. Create Wordle-specific leaderboard view
DROP VIEW IF EXISTS wordle_leaderboard;
CREATE OR REPLACE VIEW wordle_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (
        ORDER BY 
            COALESCE(wordle_current_streak, 0) DESC,  -- Primary: Current streak
            CASE 
                WHEN COALESCE(wordle_games_played, 0) = 0 THEN 0.0 
                ELSE ROUND((COALESCE(wordle_games_won, 0)::DECIMAL / COALESCE(wordle_games_played, 0)::DECIMAL) * 100, 1)
            END DESC,  -- Secondary: Win rate
            CASE 
                WHEN COALESCE(wordle_games_won, 0) = 0 THEN 999.0 
                ELSE COALESCE(wordle_average_guesses, 999.0)
            END ASC,  -- Tertiary: Average guesses (lower is better)
            COALESCE(wordle_games_played, 0) DESC  -- Final: Total games played
    ) as rank,
    user_id,
    COALESCE(username, 'Anonymous Player') as username,
    COALESCE(wordle_games_played, 0) as games_played,
    COALESCE(wordle_games_won, 0) as games_won,
    CASE 
        WHEN COALESCE(wordle_games_played, 0) = 0 THEN 0.0 
        ELSE ROUND((COALESCE(wordle_games_won, 0)::DECIMAL / COALESCE(wordle_games_played, 0)::DECIMAL) * 100, 1)
    END as win_rate,
    COALESCE(wordle_current_streak, 0) as current_streak,
    COALESCE(wordle_best_streak, 0) as best_streak,
    CASE 
        WHEN COALESCE(wordle_games_won, 0) = 0 THEN 0.0 
        ELSE COALESCE(wordle_average_guesses, 0.0)
    END as average_guesses,
    updated_at
FROM player_stats
WHERE COALESCE(wordle_games_played, 0) > 0
ORDER BY rank;

-- 2. Update the global_leaderboard to be 2048-specific
DROP VIEW IF EXISTS global_leaderboard;
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (
        ORDER BY 
            COALESCE(best_score, 0) DESC,
            COALESCE(current_streak, 0) DESC,
            CASE 
                WHEN COALESCE(total_games, 0) = 0 THEN 0.0 
                ELSE ROUND((COALESCE(games_won, 0)::DECIMAL / COALESCE(total_games, 0)::DECIMAL) * 100, 1)
            END DESC,
            COALESCE(total_games, 0) DESC,
            updated_at DESC
    ) as rank,
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
    COALESCE(best_streak, 0) as best_streak,
    COALESCE(highest_tile_achieved, 0) as highest_tile_achieved,
    updated_at
FROM player_stats
WHERE COALESCE(total_games, 0) > 0
ORDER BY rank;

-- 3. Ensure get_user_combined_stats function is properly set up
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

-- 4. Grant permissions
GRANT SELECT ON wordle_leaderboard TO authenticated;
GRANT SELECT ON wordle_leaderboard TO anon;
GRANT SELECT ON global_leaderboard TO authenticated;
GRANT SELECT ON global_leaderboard TO anon;
GRANT EXECUTE ON FUNCTION get_user_combined_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_combined_stats(UUID) TO anon;

-- 5. Create sample data for testing (only if no data exists)
DO $$
BEGIN
    -- Check if we already have sample data
    IF NOT EXISTS (SELECT 1 FROM player_stats LIMIT 1) THEN
        -- Insert sample players with both 2048 and Wordle statistics
        INSERT INTO player_stats (
            user_id, username, email, 
            best_score, total_games, games_won, current_streak, best_streak, 
            total_moves, total_duration_seconds, highest_tile_achieved,
            wordle_games_played, wordle_games_won, wordle_current_streak, 
            wordle_best_streak, wordle_average_guesses
        ) VALUES
        -- Top 2048 players
        (gen_random_uuid(), 'Alex Chen', 'alex@example.com', 
         15840, 45, 12, 3, 8, 2450, 1800, 2048, 
         25, 20, 12, 18, 3.8),
        (gen_random_uuid(), 'Sarah Johnson', 'sarah@example.com', 
         12960, 38, 15, 5, 10, 2100, 1650, 1024, 
         30, 25, 15, 20, 3.2),
        (gen_random_uuid(), 'Mike Zhang', 'mike@example.com', 
         11520, 42, 8, 2, 6, 2300, 1900, 512, 
         20, 15, 8, 12, 4.1),
        
        -- Top Wordle players (high streaks)
        (gen_random_uuid(), 'WordMaster', 'wordmaster@example.com', 
         3840, 15, 8, 2, 5, 800, 600, 256, 
         50, 45, 28, 35, 2.8),
        (gen_random_uuid(), 'StreakKing', 'streakking@example.com', 
         5120, 20, 12, 4, 7, 1200, 900, 512, 
         45, 40, 25, 30, 3.1),
        (gen_random_uuid(), 'GuessGenius', 'guessgenius@example.com', 
         2560, 12, 6, 1, 4, 650, 450, 128, 
         60, 55, 22, 28, 2.5),
        
        -- Mixed players (good at both games)
        (gen_random_uuid(), 'GameMaster', 'gamemaster@example.com', 
         8960, 32, 14, 4, 9, 1600, 1200, 512, 
         42, 38, 16, 20, 3.2),
        (gen_random_uuid(), 'PuzzlePro', 'puzzlepro@example.com', 
         7680, 28, 11, 3, 7, 1400, 1000, 256, 
         36, 32, 14, 18, 3.4),
        (gen_random_uuid(), 'BrainChamp', 'brainchamp@example.com', 
         6720, 25, 13, 5, 8, 1300, 950, 512, 
         33, 28, 12, 16, 3.6);
        
        RAISE NOTICE 'Sample data created successfully!';
    ELSE
        RAISE NOTICE 'Data already exists, skipping sample data creation.';
    END IF;
END $$;

-- 6. Verification queries (uncomment to test)
-- SELECT 'Wordle Leaderboard' as leaderboard_type, * FROM wordle_leaderboard LIMIT 5;
-- SELECT '2048 Leaderboard' as leaderboard_type, * FROM global_leaderboard LIMIT 5;

-- 7. Deployment completion messages
DO $$
BEGIN
    RAISE NOTICE 'Multi-game leaderboard deployment completed successfully!';
    RAISE NOTICE 'Wordle leaderboard: Ranked by current streak, win rate, and efficiency';
    RAISE NOTICE '2048 leaderboard: Ranked by best score, current streak, and win rate'; 
END $$; 