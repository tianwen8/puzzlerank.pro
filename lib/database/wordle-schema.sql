-- Wordle答案数据库表结构
-- 用于存储所有历史和当前的Wordle答案数据

CREATE TABLE IF NOT EXISTS wordle_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_number INTEGER UNIQUE NOT NULL,
    date TEXT UNIQUE NOT NULL,
    word TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    sources TEXT, -- JSON格式存储数据源列表
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verification_time DATETIME,
    confidence_score INTEGER DEFAULT 0, -- 0-100的置信度分数
    category TEXT DEFAULT 'General',
    difficulty TEXT DEFAULT 'Medium'
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_number ON wordle_answers(game_number);
CREATE INDEX IF NOT EXISTS idx_date ON wordle_answers(date);
CREATE INDEX IF NOT EXISTS idx_verified ON wordle_answers(verified);

-- 数据源表，记录每次抓取的原始数据
CREATE TABLE IF NOT EXISTS wordle_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_number INTEGER,
    source_name TEXT NOT NULL,
    word TEXT NOT NULL,
    url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE,
    raw_data TEXT, -- 存储原始HTML或JSON数据
    FOREIGN KEY (game_number) REFERENCES wordle_answers(game_number)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_source_game_number ON wordle_sources(game_number);
CREATE INDEX IF NOT EXISTS idx_source_name ON wordle_sources(source_name);
CREATE INDEX IF NOT EXISTS idx_scraped_at ON wordle_sources(scraped_at);

-- 插入已知的历史数据
INSERT OR REPLACE INTO wordle_answers (game_number, date, word, verified, sources, confidence_score, category, difficulty) VALUES
(1509, '2025-08-06', 'GROAN', TRUE, '["tomsguide", "manual"]', 100, 'Emotions', 'Medium'),
(1508, '2025-08-05', 'STORK', TRUE, '["tomsguide", "historical"]', 100, 'Animals', 'Medium'),
(1507, '2025-08-04', 'RIGID', TRUE, '["historical"]', 90, 'Concepts', 'Medium'),
(1506, '2025-08-03', 'LUMPY', TRUE, '["historical"]', 90, 'Concepts', 'Medium'),
(1505, '2025-08-02', 'DAUNT', TRUE, '["historical"]', 90, 'Concepts', 'Hard'),
(1504, '2025-08-01', 'BANJO', TRUE, '["historical"]', 90, 'Music', 'Medium'),
(1503, '2025-07-31', 'FRILL', TRUE, '["historical"]', 90, 'Fashion', 'Medium'),
(1502, '2025-07-30', 'ASSAY', TRUE, '["historical"]', 90, 'Science', 'Hard'),
(1501, '2025-07-29', 'OMEGA', TRUE, '["historical"]', 90, 'Greek', 'Medium'),
(1500, '2025-07-28', 'SAVVY', TRUE, '["historical"]', 90, 'Concepts', 'Medium');

-- 更新触发器，自动更新updated_at字段
CREATE TRIGGER IF NOT EXISTS update_wordle_answers_updated_at 
    AFTER UPDATE ON wordle_answers
BEGIN
    UPDATE wordle_answers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;