-- 更新验证源配置
-- 删除失效的源
DELETE FROM verification_sources WHERE name IN ('gamerant', 'polygon');

-- 更新现有源的URL
UPDATE verification_sources 
SET base_url = 'https://www.techradar.com/news/wordle-today'
WHERE name = 'techradar';

-- 添加新的验证源
INSERT INTO verification_sources (name, base_url, selector_config, weight) VALUES
('wordtips', 'https://word.tips/todays-wordle-answer/', 
 '{"answer_selector": ".wordle-answer", "backup_selectors": [".answer", "strong"]}', 0.8)
ON CONFLICT (name) DO UPDATE SET
  base_url = EXCLUDED.base_url,
  weight = EXCLUDED.weight,
  updated_at = NOW();