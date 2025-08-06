-- Create Wordle-specific leaderboard view
-- This view ranks players based on Wordle game performance

-- Create Wordle leaderboard view
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

-- Update the original global_leaderboard to be 2048-specific
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

-- Grant permissions
GRANT SELECT ON wordle_leaderboard TO authenticated;
GRANT SELECT ON wordle_leaderboard TO anon;
GRANT SELECT ON global_leaderboard TO authenticated;
GRANT SELECT ON global_leaderboard TO anon; 