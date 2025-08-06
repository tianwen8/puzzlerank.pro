-- 修复用户注册触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 重新创建处理新用户的函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 插入新用户的统计记录
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
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- 记录错误但不阻止用户创建
        RAISE LOG 'Error creating player stats for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 确保RLS策略正确
DROP POLICY IF EXISTS "Users can insert own player stats" ON player_stats;
CREATE POLICY "Users can insert own player stats" ON player_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 允许认证用户查看排行榜
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON player_stats;
CREATE POLICY "Anyone can view leaderboard" ON player_stats
    FOR SELECT USING (true);
