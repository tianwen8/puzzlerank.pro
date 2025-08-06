-- Wordle自动预测验证系统数据库表
-- 创建时间: 2025-08-06

-- 1. Wordle答案预测表
CREATE TABLE IF NOT EXISTS wordle_predictions (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  predicted_word VARCHAR(5),
  verified_word VARCHAR(5),
  status VARCHAR(20) DEFAULT 'candidate' CHECK (status IN ('candidate', 'verified', 'rejected')),
  confidence_score DECIMAL(3,2) DEFAULT 0.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  verification_sources JSONB DEFAULT '[]'::jsonb,
  hints JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT unique_game_date UNIQUE (game_number, date)
);

-- 2. 验证来源配置表
CREATE TABLE IF NOT EXISTS verification_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  base_url VARCHAR(500) NOT NULL,
  selector_config JSONB NOT NULL, -- CSS选择器配置
  weight DECIMAL(3,2) DEFAULT 1.00 CHECK (weight >= 0 AND weight <= 1),
  is_active BOOLEAN DEFAULT true,
  last_check TIMESTAMP WITH TIME ZONE,
  success_rate DECIMAL(3,2) DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 采集日志表
CREATE TABLE IF NOT EXISTS collection_logs (
  id SERIAL PRIMARY KEY,
  game_number INTEGER NOT NULL,
  source_name VARCHAR(100) NOT NULL,
  collected_word VARCHAR(5),
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'timeout')),
  response_time INTEGER, -- 毫秒
  error_message TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wordle_predictions_date ON wordle_predictions(date DESC);
CREATE INDEX IF NOT EXISTS idx_wordle_predictions_status ON wordle_predictions(status);
CREATE INDEX IF NOT EXISTS idx_wordle_predictions_game_number ON wordle_predictions(game_number);
CREATE INDEX IF NOT EXISTS idx_collection_logs_game_number ON collection_logs(game_number);
CREATE INDEX IF NOT EXISTS idx_collection_logs_created_at ON collection_logs(created_at DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wordle_predictions_updated_at 
    BEFORE UPDATE ON wordle_predictions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_sources_updated_at 
    BEFORE UPDATE ON verification_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认验证源配置
INSERT INTO verification_sources (name, base_url, selector_config, weight) VALUES
('tomsguide', 'https://www.tomsguide.com/news/what-is-todays-wordle-answer', 
 '{"answer_selector": ".wordle-answer", "backup_selectors": [".answer", "strong"]}', 0.9),
('techradar', 'https://www.techradar.com/gaming/wordle-today', 
 '{"answer_selector": ".wordle-today-answer", "backup_selectors": [".answer", "strong"]}', 0.8),
('gamerant', 'https://gamerant.com/wordle-answer-today/', 
 '{"answer_selector": ".wordle-answer", "backup_selectors": [".answer", "strong"]}', 0.7),
('polygon', 'https://www.polygon.com/wordle-answer-today', 
 '{"answer_selector": ".wordle-answer", "backup_selectors": [".answer", "strong"]}', 0.7)
ON CONFLICT (name) DO NOTHING;

-- 插入系统配置
INSERT INTO system_config (key, value, description) VALUES
('collection_schedule', '{"enabled": true, "cron": "0 1 * * *", "timezone": "UTC"}', '采集任务调度配置'),
('verification_threshold', '{"min_sources": 2, "min_confidence": 0.8}', '验证阈值配置'),
('retry_config', '{"max_retries": 3, "retry_delay": 5000}', '重试配置'),
('cache_config', '{"ttl": 3600, "enabled": true}', '缓存配置')
ON CONFLICT (key) DO NOTHING;

-- 创建RLS策略（如果需要）
-- ALTER TABLE wordle_predictions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE verification_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collection_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE wordle_predictions IS 'Wordle答案预测和验证数据';
COMMENT ON TABLE verification_sources IS '验证来源配置';
COMMENT ON TABLE collection_logs IS '数据采集日志';
COMMENT ON TABLE system_config IS '系统配置参数';