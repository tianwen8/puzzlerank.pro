-- 正确设置认证相关的数据库配置
-- 不直接修改 auth.users 表，而是确保我们的触发器正常工作

-- 确保 player_stats 表的 RLS 策略正确
DROP POLICY IF EXISTS "Users can insert own player stats" ON player_stats;
DROP POLICY IF EXISTS "Users can view own player stats" ON player_stats;
DROP POLICY IF EXISTS "Users can update own player stats" ON player_stats;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON player_stats;

-- 重新创建正确的 RLS 策略
CREATE POLICY "Users can view own player stats" ON player_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own player stats" ON player_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own player stats" ON player_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- 允许所有人查看排行榜（但只显示公开信息）
CREATE POLICY "Anyone can view leaderboard" ON player_stats
    FOR SELECT USING (true);

-- 确保 game_sessions 表的 RLS 策略正确
DROP POLICY IF EXISTS "Users can view own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update own game sessions" ON game_sessions;

CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- 修复用户注册触发器，确保兼容邮箱确认流程
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 只有当用户邮箱已确认时才创建 player_stats 记录
    -- 这样可以避免未确认用户产生垃圾数据
    IF NEW.email_confirmed_at IS NOT NULL THEN
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
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NEW.email,
            0, 0, 0, 0, 0, 0, 0, 0
        )
        ON CONFLICT (user_id) DO UPDATE SET
            username = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            email = NEW.email,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不阻止用户创建
        RAISE LOG 'Error creating player stats for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器处理新用户和邮箱确认
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 创建函数来手动创建用户统计（用于已登录但没有统计的用户）
CREATE OR REPLACE FUNCTION create_user_stats_if_missing(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    user_record auth.users%ROWTYPE;
BEGIN
    -- 获取用户信息
    SELECT * INTO user_record FROM auth.users WHERE id = user_uuid;
    
    IF FOUND AND user_record.email_confirmed_at IS NOT NULL THEN
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
            COALESCE(user_record.raw_user_meta_data->>'full_name', split_part(user_record.email, '@', 1)),
            user_record.email,
            0, 0, 0, 0, 0, 0, 0, 0
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
