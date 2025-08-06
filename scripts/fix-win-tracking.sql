-- 修复胜利状态跟踪和统计计算
-- 重新创建更准确的统计更新函数

DROP TRIGGER IF EXISTS update_player_stats_trigger ON game_sessions;
DROP FUNCTION IF EXISTS update_player_stats();

-- 创建改进的统计更新函数
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_stats RECORD;
    new_streak INTEGER := 0;
    user_info RECORD;
    is_game_won BOOLEAN := false;
BEGIN
    -- 获取用户信息
    SELECT 
        COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Player') as username,
        email
    INTO user_info
    FROM auth.users 
    WHERE id = NEW.user_id;

    -- 判断游戏是否胜利 (达到2048或更高)
    is_game_won := NEW.is_won OR NEW.highest_tile >= 2048;

    -- 获取当前统计
    SELECT * INTO current_stats
    FROM player_stats
    WHERE user_id = NEW.user_id;

    -- 计算新的连胜记录
    IF is_game_won THEN
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
        CASE WHEN is_game_won THEN 1 ELSE 0 END,
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
        games_won = player_stats.games_won + CASE WHEN is_game_won THEN 1 ELSE 0 END,
        current_streak = new_streak,
        best_streak = GREATEST(player_stats.best_streak, new_streak),
        total_moves = player_stats.total_moves + NEW.moves_count,
        total_duration_seconds = player_stats.total_duration_seconds + NEW.duration_seconds,
        highest_tile_achieved = GREATEST(player_stats.highest_tile_achieved, NEW.highest_tile),
        username = COALESCE(user_info.username, player_stats.username),
        email = COALESCE(user_info.email, player_stats.email),
        updated_at = NOW();
    
    -- 记录详细日志
    RAISE LOG 'Updated player stats for user %: score=%, won=%, streak=%, total_games=%', 
        NEW.user_id, NEW.score, is_game_won, new_streak,
        COALESCE(current_stats.total_games, 0) + 1;
    
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

-- 修复现有数据 - 重新计算所有统计
UPDATE player_stats 
SET 
    games_won = (
        SELECT COUNT(*) 
        FROM game_sessions gs 
        WHERE gs.user_id = player_stats.user_id 
        AND (gs.is_won = true OR gs.highest_tile >= 2048)
    ),
    updated_at = NOW()
WHERE user_id IN (
    SELECT DISTINCT user_id FROM game_sessions
);

-- 重新计算胜率（通过触发器自动计算）
UPDATE player_stats 
SET updated_at = NOW()
WHERE total_games > 0;
