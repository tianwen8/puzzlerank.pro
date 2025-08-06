-- 临时禁用邮箱确认，允许用户直接登录
-- 注意：这是为了开发测试，生产环境建议启用邮箱确认

-- 更新现有未确认的用户，将其设为已确认
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL 
  AND confirmed_at IS NULL;

-- 创建一个函数来自动确认新用户
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 自动确认新注册的用户
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器来自动确认新用户
DROP TRIGGER IF EXISTS auto_confirm_new_users ON auth.users;
CREATE TRIGGER auto_confirm_new_users
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_user();
