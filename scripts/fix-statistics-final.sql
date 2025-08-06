-- 最终修复统计数据问题
-- 确保胜利状态和连胜正确计算

-- 1. 修复现有游戏会话的胜利状态
UPDATE game_sessions 
SET is_won = true 
WHERE highest_tile >= 2048 AND is_won = false;

-- 2. 重新计算所有玩家统计
-- 先备份现有数据，然后重新计算
CREATE TEMP TABLE temp_correct_stats AS
SELECT 
    gs.user_id,
    MAX(u.raw_user_meta_data->>'full_name') as username,
    MAX(u.email) as email,
    MAX(gs.score) as best_score,
    COUNT(*) as total_games,
    COUNT(*) FILTER (WHERE gs.is_won = true OR gs.highest_tile >= 2048) as games_won,
    SUM(gs.moves_count) as total_moves,
    SUM(gs.duration_seconds) as total_duration_seconds,
    MAX(gs.highest_tile) as highest_tile_achieved
FROM game_sessions gs
JOIN auth.users u ON gs.user_id = u.id
GROUP BY gs.user_id;

-- 3. 更新玩家统计表
UPDATE player_stats 
SET 
    best_score = temp_correct_stats.best_score,
    total_games = temp_correct_stats.total_games,
    games_won = temp_correct_stats.games_won,
    total_moves = temp_correct_stats.total_moves,
    total_duration_seconds = temp_correct_stats.total_duration_seconds,
    highest_tile_achieved = temp_correct_stats.highest_tile_achieved,
    username = COALESCE(temp_correct_stats.username, player_stats.username),
    email = COALESCE(temp_correct_stats.email, player_stats.email),
    updated_at = NOW()
FROM temp_correct_stats
WHERE player_stats.user_id = temp_correct_stats.user_id;

-- 4. 计算连胜记录（复杂逻辑，需要按时间顺序）
WITH game_streaks AS (
    SELECT 
        user_id,
        (is_won OR highest_tile >= 2048) as won,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as game_num
    FROM game_sessions
    ORDER BY user_id, created_at
),
streak_groups AS (
    SELECT 
        user_id,
        won,
        game_num - ROW_NUMBER() OVER (PARTITION BY user_id, won ORDER BY game_num) as streak_group
    FROM game_streaks
),
user_streaks AS (
    SELECT 
        user_id,
        MAX(CASE WHEN won THEN COUNT(*) ELSE 0 END) as best_streak
    FROM streak_groups
    WHERE won = true
    GROUP BY user_id, streak_group
)
UPDATE player_stats 
SET 
    best_streak = COALESCE(user_streaks.best_streak, 0),
    current_streak = CASE 
        WHEN (
            SELECT (is_won OR highest_tile >= 2048) 
            FROM game_sessions 
            WHERE user_id = player_stats.user_id 
            ORDER BY created_at DESC 
            LIMIT 1
        ) THEN 1 ELSE 0 END,
    updated_at = NOW()
FROM user_streaks
WHERE player_stats.user_id = user_streaks.user_id;

-- 清理临时表
DROP TABLE temp_correct_stats;
