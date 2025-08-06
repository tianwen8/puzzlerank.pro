-- Clean up any duplicate player_stats records
-- This will ensure each user has only one stats record

-- First, let's see if there are any duplicates
SELECT user_id, COUNT(*) as count
FROM player_stats
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Remove duplicates, keeping the most recent record for each user
WITH ranked_stats AS (
    SELECT 
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn,
        best_score,
        total_games,
        games_won,
        total_moves,
        total_duration_seconds,
        highest_tile_achieved,
        best_streak
    FROM player_stats
),
merged_stats AS (
    SELECT 
        user_id,
        MAX(best_score) as best_score,
        SUM(total_games) as total_games,
        SUM(games_won) as games_won,
        SUM(total_moves) as total_moves,
        SUM(total_duration_seconds) as total_duration_seconds,
        MAX(highest_tile_achieved) as highest_tile_achieved,
        MAX(best_streak) as best_streak
    FROM ranked_stats
    GROUP BY user_id
)
-- Delete all but the first record for each user
DELETE FROM player_stats 
WHERE (user_id, updated_at, created_at) NOT IN (
    SELECT user_id, updated_at, created_at
    FROM (
        SELECT 
            user_id, 
            updated_at, 
            created_at,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
        FROM player_stats
    ) ranked
    WHERE rn = 1
);

-- Update the remaining records with merged data
UPDATE player_stats 
SET 
    best_score = merged.best_score,
    total_games = merged.total_games,
    games_won = merged.games_won,
    total_moves = merged.total_moves,
    total_duration_seconds = merged.total_duration_seconds,
    highest_tile_achieved = merged.highest_tile_achieved,
    best_streak = merged.best_streak,
    updated_at = NOW()
FROM (
    SELECT 
        gs.user_id,
        MAX(gs.score) as best_score,
        COUNT(*) as total_games,
        COUNT(*) FILTER (WHERE gs.is_won = true) as games_won,
        SUM(gs.moves_count) as total_moves,
        SUM(gs.duration_seconds) as total_duration_seconds,
        MAX(gs.highest_tile) as highest_tile_achieved,
        0 as best_streak
    FROM game_sessions gs
    GROUP BY gs.user_id
) merged
WHERE player_stats.user_id = merged.user_id;

-- Verify no duplicates remain
SELECT user_id, COUNT(*) as count
FROM player_stats
GROUP BY user_id
HAVING COUNT(*) > 1;
