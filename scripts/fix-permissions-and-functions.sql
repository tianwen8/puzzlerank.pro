-- 修复权限问题和数据库函数
-- 删除有问题的函数，重新创建正确的版本

DROP FUNCTION IF EXISTS create_user_stats_if_missing(UUID);
DROP FUNCTION IF EXISTS handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建正确的用户统计创建函数（不直接访问auth.users）
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

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 确保RLS策略允许用户访问自己的数据
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON player_stats;
CREATE POLICY "Enable read access for authenticated users" ON player_stats
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- 允许用户插入和更新自己的统计
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON player_stats;
CREATE POLICY "Enable insert for authenticated users" ON player_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON player_stats;
CREATE POLICY "Enable update for authenticated users" ON player_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 确保game_sessions表的权限正确
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON game_sessions;
CREATE POLICY "Enable insert for authenticated users" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON game_sessions;
CREATE POLICY "Enable read access for authenticated users" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);
