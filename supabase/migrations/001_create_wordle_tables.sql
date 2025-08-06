-- Wordle答案数据库表结构 (Supabase版本)
-- 用于存储所有历史和当前的Wordle答案数据
-- 注意：这些表与现有的游戏排行榜表完全独立，不会影响现有功能

-- 创建Wordle答案主表
CREATE TABLE IF NOT EXISTS public.wordle_answers (
    id BIGSERIAL PRIMARY KEY,
    game_number INTEGER UNIQUE NOT NULL,
    date DATE UNIQUE NOT NULL,
    word TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    sources TEXT, -- JSON格式存储数据源列表
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verification_time TIMESTAMPTZ,
    confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    category TEXT DEFAULT 'General',
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard'))
);

-- 创建数据源表，记录每次抓取的原始数据
CREATE TABLE IF NOT EXISTS public.wordle_sources (
    id BIGSERIAL PRIMARY KEY,
    game_number INTEGER,
    source_name TEXT NOT NULL,
    word TEXT NOT NULL,
    url TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    raw_data TEXT, -- 存储原始HTML或JSON数据
    CONSTRAINT fk_wordle_sources_game_number 
        FOREIGN KEY (game_number) 
        REFERENCES public.wordle_answers(game_number) 
        ON DELETE CASCADE
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_wordle_answers_game_number ON public.wordle_answers(game_number);
CREATE INDEX IF NOT EXISTS idx_wordle_answers_date ON public.wordle_answers(date);
CREATE INDEX IF NOT EXISTS idx_wordle_answers_verified ON public.wordle_answers(verified);
CREATE INDEX IF NOT EXISTS idx_wordle_answers_updated_at ON public.wordle_answers(updated_at);

CREATE INDEX IF NOT EXISTS idx_wordle_sources_game_number ON public.wordle_sources(game_number);
CREATE INDEX IF NOT EXISTS idx_wordle_sources_source_name ON public.wordle_sources(source_name);
CREATE INDEX IF NOT EXISTS idx_wordle_sources_scraped_at ON public.wordle_sources(scraped_at);

-- 创建更新触发器，自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_wordle_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wordle_answers_updated_at
    BEFORE UPDATE ON public.wordle_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_wordle_answers_updated_at();

-- 启用行级安全策略 (RLS)
ALTER TABLE public.wordle_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wordle_sources ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略（所有人都可以读取Wordle答案）
CREATE POLICY "Allow public read access on wordle_answers" 
    ON public.wordle_answers 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access on wordle_sources" 
    ON public.wordle_sources 
    FOR SELECT 
    USING (true);

-- 创建服务端写入策略（只有服务端可以写入数据）
CREATE POLICY "Allow service role write access on wordle_answers" 
    ON public.wordle_answers 
    FOR ALL 
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role write access on wordle_sources" 
    ON public.wordle_sources 
    FOR ALL 
    USING (auth.role() = 'service_role');

-- 插入已知的历史数据
INSERT INTO public.wordle_answers (game_number, date, word, verified, sources, confidence_score, category, difficulty, verification_time) VALUES
(1509, '2025-08-06', 'GROAN', TRUE, '["tomsguide", "manual"]', 100, 'Emotions', 'Medium', NOW()),
(1508, '2025-08-05', 'STORK', TRUE, '["tomsguide", "historical"]', 100, 'Animals', 'Medium', NOW()),
(1507, '2025-08-04', 'RIGID', TRUE, '["historical"]', 90, 'Concepts', 'Medium', NOW()),
(1506, '2025-08-03', 'LUMPY', TRUE, '["historical"]', 90, 'Concepts', 'Medium', NOW()),
(1505, '2025-08-02', 'DAUNT', TRUE, '["historical"]', 90, 'Concepts', 'Hard', NOW()),
(1504, '2025-08-01', 'BANJO', TRUE, '["historical"]', 90, 'Music', 'Medium', NOW()),
(1503, '2025-07-31', 'FRILL', TRUE, '["historical"]', 90, 'Fashion', 'Medium', NOW()),
(1502, '2025-07-30', 'ASSAY', TRUE, '["historical"]', 90, 'Science', 'Hard', NOW()),
(1501, '2025-07-29', 'OMEGA', TRUE, '["historical"]', 90, 'Greek', 'Medium', NOW()),
(1500, '2025-07-28', 'SAVVY', TRUE, '["historical"]', 90, 'Concepts', 'Medium', NOW())
ON CONFLICT (game_number) DO UPDATE SET
    word = EXCLUDED.word,
    verified = EXCLUDED.verified,
    sources = EXCLUDED.sources,
    confidence_score = EXCLUDED.confidence_score,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    updated_at = NOW();

-- 创建视图方便查询最新答案
CREATE OR REPLACE VIEW public.latest_wordle_answers AS
SELECT 
    game_number,
    date,
    word,
    verified,
    sources,
    confidence_score,
    category,
    difficulty,
    created_at,
    updated_at
FROM public.wordle_answers
ORDER BY game_number DESC
LIMIT 50;

-- 创建今日答案视图
CREATE OR REPLACE VIEW public.today_wordle_answer AS
SELECT 
    game_number,
    date,
    word,
    verified,
    sources,
    confidence_score,
    category,
    difficulty,
    created_at,
    updated_at
FROM public.wordle_answers
WHERE date = CURRENT_DATE
ORDER BY confidence_score DESC, updated_at DESC
LIMIT 1;

-- 添加注释说明
COMMENT ON TABLE public.wordle_answers IS 'Wordle每日答案数据表，与游戏排行榜功能完全独立';
COMMENT ON TABLE public.wordle_sources IS 'Wordle数据源抓取记录表，用于追踪答案来源';
COMMENT ON COLUMN public.wordle_answers.game_number IS 'Wordle游戏编号，如#1509';
COMMENT ON COLUMN public.wordle_answers.word IS 'Wordle答案单词，5个字母';
COMMENT ON COLUMN public.wordle_answers.verified IS '是否经过多源验证';
COMMENT ON COLUMN public.wordle_answers.confidence_score IS '答案置信度分数，0-100';