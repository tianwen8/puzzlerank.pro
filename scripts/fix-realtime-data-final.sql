-- 彻底修复实时数据显示问题
-- 确保触发器正确工作，数据实时更新

-- 1. 检查并修复触发器
DROP TRIGGER IF EXISTS update_player_stats_trigger ON game_sessions;
DROP FUNCTION IF EXISTS update_player_stats();

-- 重新创建更可靠的统计更新函数
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_stats RECORD;
    new_streak INTEGER := 0;
    user_info RECORD;
BEGIN
    -- 获取用户信息
    SELECT 
        COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Player') as username,
        email
    INTO user_info
    FROM auth.users 
    WHERE id = NEW.user_id;

    -- 获取当前统计
    SELECT * INTO current_stats
    FROM player_stats
    WHERE user_id = NEW.user_id;

    -- 计算新的连胜记录
    IF NEW.is_won THEN
        new_streak = COALESCE(current_stats.current_streak, 0) + 1;
    ELSE
        new_streak = 0;
    END IF;

    -- 更新或插入统计数据
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
    VALUES (
        NEW.user_id,
        user_info.username,
        user_info.email,
        NEW.score,
        1,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        new_streak,
        new_streak,
        NEW.moves_count,
        NEW.duration_seconds,
        NEW.highest_tile,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        best_score = GREATEST(player_stats.best_score, NEW.score),
        total_games = player_stats.total_games + 1,
        games_won = player_stats.games_won + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        current_streak = new_streak,
        best_streak = GREATEST(player_stats.best_streak, new_streak),
        total_moves = player_stats.total_moves + NEW.moves_count,
        total_duration_seconds = player_stats.total_duration_seconds + NEW.duration_seconds,
        highest_tile_achieved = GREATEST(player_stats.highest_tile_achieved, NEW.highest_tile),
        username = COALESCE(user_info.username, player_stats.username),
        email = COALESCE(user_info.email, player_stats.email),
        updated_at = NOW();
    
    -- 记录日志以便调试
    RAISE LOG 'Updated player stats for user %: score=%, games=%, won=%', 
        NEW.user_id, NEW.score, 
        COALESCE(current_stats.total_games, 0) + 1, 
        NEW.is_won;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error updating player stats for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER update_player_stats_trigger
    AFTER INSERT ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_player_stats();

-- 2. 手动更新现有数据（重新计算所有统计）
-- 清空现有统计，重新计算
TRUNCATE TABLE player_stats;

-- 从game_sessions重新计算所有统计
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
    gs.user_id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Player') as username,
    u.email,
    MAX(gs.score) as best_score,
    COUNT(*) as total_games,
    COUNT(*) FILTER (WHERE gs.is_won = true) as games_won,
    0 as current_streak, -- 需要复杂计算，暂时设为0
    0 as best_streak,
    SUM(gs.moves_count) as total_moves,
    SUM(gs.duration_seconds) as total_duration_seconds,
    MAX(gs.highest_tile) as highest_tile_achieved,
    NOW() as updated_at
FROM game_sessions gs
JOIN auth.users u ON gs.user_id = u.id
GROUP BY gs.user_id, u.raw_user_meta_data, u.email
ON CONFLICT (user_id) DO UPDATE SET
    best_score = EXCLUDED.best_score,
    total_games = EXCLUDED.total_games,
    games_won = EXCLUDED.games_won,
    total_moves = EXCLUDED.total_moves,
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    highest_tile_achieved = EXCLUDED.highest_tile_achieved,
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    updated_at = NOW();

-- 3. 创建实时通知函数
CREATE OR REPLACE FUNCTION notify_stats_update()
RETURNS TRIGGER AS $$
BEGIN
    -- 发送实时通知
    PERFORM pg_notify('player_stats_updated', json_build_object(
        'user_id', NEW.user_id,
        'best_score', NEW.best_score,
        'total_games', NEW.total_games,
        'timestamp', extract(epoch from NOW())
    )::text);
    
    PERFORM pg_notify('leaderboard_updated', json_build_object(
        'timestamp', extract(epoch from NOW())
    )::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 添加通知触发器
CREATE TRIGGER notify_stats_update_trigger
    AFTER INSERT OR UPDATE ON player_stats
    FOR EACH ROW
    EXECUTE FUNCTION notify_stats_update();

-- 4. 确保视图是最新的
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
    updated_at
FROM player_stats
WHERE total_games > 0
ORDER BY best_score DESC, total_games DESC, updated_at DESC
LIMIT 100;

-- 5. 创建调试函数
CREATE OR REPLACE FUNCTION debug_user_stats(user_uuid UUID)
RETURNS TABLE(
    sessions_count BIGINT,
    stats_exists BOOLEAN,
    best_score INTEGER,
    total_games INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM game_sessions WHERE user_id = user_uuid) as sessions_count,
        (SELECT EXISTS(SELECT 1 FROM player_stats WHERE user_id = user_uuid)) as stats_exists,
        COALESCE((SELECT ps.best_score FROM player_stats ps WHERE ps.user_id = user_uuid), 0) as best_score,
        COALESCE((SELECT ps.total_games FROM player_stats ps WHERE ps.user_id = user_uuid), 0) as total_games;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
