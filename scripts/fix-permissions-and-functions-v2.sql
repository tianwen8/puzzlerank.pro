-- 修复权限问题和数据库函数 - 正确的删除顺序
-- 先删除触发器，再删除函数

-- 1. 先删除所有相关的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_player_stats_trigger ON game_sessions;

-- 2. 再删除函数
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_user_stats_if_missing(UUID);
DROP FUNCTION IF EXISTS update_user_profile(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_player_stats();

-- 3. 重新创建所有函数

-- 创建用户统计创建函数（不直接访问auth.users）
CREATE OR REPLACE FUNCTION create_user_stats_if_missing(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- 直接插入用户统计，如果不存在的话
    INSERT INTO public.player_stats (
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
    VALUES (
        user_uuid,
        'Player',  -- 默认用户名，后续可以更新
        '',        -- 默认邮箱，后续可以更新
        0, 0, 0, 0, 0, 0, 0, 0
    )
    ON CONFLICT (user_id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不抛出异常
        RAISE LOG 'Error creating player stats for user %: %', user_uuid, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建更新用户信息的函数
CREATE OR REPLACE FUNCTION update_user_profile(
    user_uuid UUID,
    user_name TEXT DEFAULT NULL,
    user_email TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.player_stats 
    SET 
        username = COALESCE(user_name, username),
        email = COALESCE(user_email, email),
        updated_at = NOW()
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 简化的新用户处理函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 为新用户创建统计记录
    PERFORM create_user_stats_if_missing(NEW.id);
    
    -- 如果有用户信息，更新profile
    IF NEW.raw_user_meta_data IS NOT NULL OR NEW.email IS NOT NULL THEN
        PERFORM update_user_profile(
            NEW.id,
            NEW.raw_user_meta_data->>'full_name',
            NEW.email
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建更新玩家统计的函数
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_stats (
        user_id, 
        username,
        email,
        best_score, 
        total_games, 
        games_won, 
        total_moves,
        total_duration_seconds,
        highest_tile_achieved
    )
    SELECT 
        NEW.user_id,
        COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Player'),
        u.email,
        NEW.score,
        1,
        CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
        NEW.moves_count,
        NEW.duration_seconds,
        NEW.highest_tile
    FROM auth.users u 
    WHERE u.id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        best_score = GREATEST(player_stats.best_score, NEW.score),
        total_games = player_stats.total_games + 1,
        games_won = player_stats.games_won + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
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

-- 4. 重新创建所有触发器

-- 创建触发器处理新用户和邮箱确认
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 创建触发器自动更新玩家统计
CREATE TRIGGER update_player_stats_trigger
    AFTER INSERT ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_player_stats();

-- 5. 重新设置RLS策略

-- 删除旧策略
DROP POLICY IF EXISTS "Users can view own player stats" ON player_stats;
DROP POLICY IF EXISTS "Users can insert own player stats" ON player_stats;
DROP POLICY IF EXISTS "Users can update own player stats" ON player_stats;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON player_stats;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON player_stats;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON player_stats;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON player_stats;

-- 创建新的RLS策略 - player_stats表
CREATE POLICY "Users can view own player stats" ON player_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own player stats" ON player_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player stats" ON player_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 允许所有认证用户查看排行榜
CREATE POLICY "Anyone can view leaderboard" ON player_stats
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- 删除旧的game_sessions策略
DROP POLICY IF EXISTS "Users can view own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON game_sessions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON game_sessions;

-- 创建新的RLS策略 - game_sessions表
CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. 为现有用户创建统计记录（如果需要）
-- 这个查询会为所有已确认邮箱但没有统计记录的用户创建记录
INSERT INTO public.player_stats (
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
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Player'),
    u.email,
    0, 0, 0, 0, 0, 0, 0, 0
FROM auth.users u
LEFT JOIN public.player_stats ps ON u.id = ps.user_id
WHERE u.email_confirmed_at IS NOT NULL 
  AND ps.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
