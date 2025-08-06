-- 优化数据显示和实时更新
-- 重新创建全球排行榜视图，确保数据正确显示

DROP VIEW IF EXISTS global_leaderboard;

-- 创建更好的全球排行榜视图
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
    updated_at
FROM player_stats
WHERE total_games > 0 OR best_score > 0
ORDER BY best_score DESC, total_games DESC, updated_at DESC
LIMIT 100;

-- 创建获取用户排名的函数
CREATE OR REPLACE FUNCTION get_user_rank(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank INTO user_rank
    FROM global_leaderboard
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取用户详细统计的函数
CREATE OR REPLACE FUNCTION get_user_detailed_stats(user_uuid UUID)
RETURNS TABLE(
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
        get_user_rank(user_uuid) as user_rank,
        COALESCE(ps.username, 'Player') as username,
        COALESCE(ps.email, '') as email
    FROM player_stats ps
    WHERE ps.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 优化更新玩家统计的函数，确保数据正确计算
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_best_score INTEGER;
    current_total_games INTEGER;
    current_games_won INTEGER;
    current_streak INTEGER;
    new_streak INTEGER;
BEGIN
    -- 获取当前统计
    SELECT best_score, total_games, games_won, current_streak
    INTO current_best_score, current_total_games, current_games_won, current_streak
    FROM player_stats
    WHERE user_id = NEW.user_id;

    -- 计算新的连胜记录
    IF NEW.is_won THEN
        new_streak = COALESCE(current_streak, 0) + 1;
    ELSE
        new_streak = 0;
    END IF;

    -- 更新或插入玩家统计
    INSERT INTO player_stats (
        user_id, 
        username,
        email,
        best_score, 
        total_games, 
        games_won, 
        current_streak,
        best_streak,
        total_moves,
        total_duration_seconds,
        highest_tile_achieved,
        updated_at
    )
    SELECT 
        NEW.user_id,
        COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Player'),
        u.email,
        NEW.score,
        1,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        new_streak,
        new_streak,
        NEW.moves_count,
        NEW.duration_seconds,
        NEW.highest_tile,
        NOW()
    FROM auth.users u 
    WHERE u.id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        best_score = GREATEST(player_stats.best_score, NEW.score),
        total_games = player_stats.total_games + 1,
        games_won = player_stats.games_won + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        current_streak = new_streak,
        best_streak = GREATEST(player_stats.best_streak, new_streak),
        total_moves = player_stats.total_moves + NEW.moves_count,
        total_duration_seconds = player_stats.total_duration_seconds + NEW.duration_seconds,
        highest_tile_achieved = GREATEST(player_stats.highest_tile_achieved, NEW.highest_tile),
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error updating player stats for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为现有的游戏会话补充统计数据（如果有的话）
-- 这将重新计算所有现有用户的统计
INSERT INTO player_stats (
    user_id,
    username,
    email,
    best_score,
    total_games,
    games_won,
    current_streak,
    best_streak,
    total_moves,
    total_duration_seconds,
    highest_tile_achieved
)
SELECT 
    gs.user_id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Player'),
    u.email,
    MAX(gs.score) as best_score,
    COUNT(*) as total_games,
    COUNT(*) FILTER (WHERE gs.is_won = true) as games_won,
    0 as current_streak, -- 需要复杂逻辑计算，暂时设为0
    0 as best_streak,
    SUM(gs.moves_count) as total_moves,
    SUM(gs.duration_seconds) as total_duration_seconds,
    MAX(gs.highest_tile) as highest_tile_achieved
FROM game_sessions gs
JOIN auth.users u ON gs.user_id = u.id
LEFT JOIN player_stats ps ON gs.user_id = ps.user_id
WHERE ps.user_id IS NULL
GROUP BY gs.user_id, u.raw_user_meta_data, u.email
ON CONFLICT (user_id) DO UPDATE SET
    best_score = GREATEST(player_stats.best_score, EXCLUDED.best_score),
    total_games = GREATEST(player_stats.total_games, EXCLUDED.total_games),
    games_won = GREATEST(player_stats.games_won, EXCLUDED.games_won),
    total_moves = GREATEST(player_stats.total_moves, EXCLUDED.total_moves),
    total_duration_seconds = GREATEST(player_stats.total_duration_seconds, EXCLUDED.total_duration_seconds),
    highest_tile_achieved = GREATEST(player_stats.highest_tile_achieved, EXCLUDED.highest_tile_achieved),
    updated_at = NOW();
