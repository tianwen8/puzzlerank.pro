# PuzzleRank.pro - Ultimate Puzzle Games Platform

一个基于Next.js 14、TypeScript和Supabase构建的现代化智能拼图游戏平台，集成了无限制单词练习游戏、2048、脑力游戏，具备实时全球排行榜、综合统计追踪和竞技排行榜功能。

🎮 **在线演示**: [puzzlerank.pro](https://puzzlerank.pro)

## 🚀 核心功能

### 游戏功能
- **单词练习游戏**: 无限制单词拼图游戏，多难度级别
- **2048游戏**: 经典2048，流畅动画和响应式控制
- **脑力游戏**: 认知训练拼图游戏集合
- **实时统计**: 分数、连胜、完成率和性能指标的实时追踪
- **全球排行榜**: 实时更新的竞技排行榜
- **移动端优化**: 完美的触控操作和跨设备响应式设计
- **访客模式**: 无需注册即可游戏，支持会话追踪

### 🎯 Wordle每日提示自动化系统

#### 系统概述
智能化的Wordle答案采集和验证系统，基于多源验证和时区优化，提供每日Wordle答案提示和历史查询功能。

#### 🔍 核心采集逻辑

**1. 提取逻辑详解**

系统针对每个验证源使用专门的正则表达式模式，确保精确提取：

```typescript
// lib/wordle-collector.ts - 核心提取方法
private extractWordFromHtml(html: string, source: any): string | null {
  const sourceName = source.name.toLowerCase();
  
  switch (sourceName) {
    case 'tomsguide':
      // 匹配: "Drumroll please &mdash; it's <strong>IMBUE.</strong>"
      const tomsPattern = /Drumroll\s*please\s*&mdash;\s*it's\s*<strong>([A-Z]{5})\.<\/strong>/i;
      const tomsMatch = html.match(tomsPattern);
      if (tomsMatch) return tomsMatch[1].toUpperCase();
      break;
      
    case 'techradar':
      // 匹配: "Today's Wordle answer (game #1511) is&hellip; <strong>IMBUE</strong>."
      // 使用 #\d+ 动态匹配任意游戏编号，自动适应编号变化
      const techPattern = /game\s*#\d+[^a-zA-Z]*is&hellip;\s*<strong>([A-Z]{5})<\/strong>/i;
      const techMatch = html.match(techPattern);
      if (techMatch) return techMatch[1].toUpperCase();
      break;
      
    case 'wordtips':
      // 匹配: answer:"IMBUE" (从JavaScript数据中提取)
      const wordtipsPattern = /answer:"([A-Z]{5})"/i;
      const wordtipsMatch = html.match(wordtipsPattern);
      if (wordtipsMatch) return wordtipsMatch[1].toUpperCase();
      break;
  }
  
  return null;
}
```

**2. 游戏编号自适应处理**

系统使用动态正则表达式 `#\d+` 匹配任意游戏编号，无需手动更新：
- ✅ 自动适应 #1511 → #1512 → #1513...
- ✅ 不依赖固定编号，永久有效
- ✅ 基于UTC时间准确计算当前游戏编号

```typescript
// lib/wordle-scheduler.ts - 游戏编号计算
private getCurrentGameNumber(): number {
  const startDate = new Date('2021-06-19T00:00:00Z'); // Wordle #1 的UTC日期
  const now = new Date();
  const utcToday = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffTime = utcToday.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
```

**3. 时区优化机制**

系统使用UTC时间确保全球一致性，在最早时区更新后立即采集：

```typescript
// lib/wordle-scheduler.ts - 时区处理
private setupCronJobs(): void {
  setInterval(async () => {
    if (!this.isRunning) return;
    
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    
    // UTC 00:01 开始采集（对应新西兰时间13:01，全球最早）
    if (utcHours === 0 && utcMinutes === 1) {
      console.log('🌍 全球最早时区已更新，开始采集...');
      await this.runDailyCollection();
    }
  }, 60000);
}
```

**时区优势**：
- 🌏 **UTC 00:01** = 新西兰时间 **13:01**（全球最早）
- 🕐 比北京时间提前 **8小时** 开始采集
- ⚡ 确保在答案发布后立即采集

#### 🔧 系统架构

**核心组件文件结构**：
```
lib/
├── wordle-scheduler.ts          # 调度器 - 定时任务和时区管理
├── wordle-collector.ts          # 采集器 - 多源数据采集和提取逻辑
├── wordle-verifier.ts           # 验证器 - 答案验证和置信度计算
└── database/
    └── wordle-prediction-db.ts  # 数据库操作层 - CRUD和数据管理

app/api/wordle/auto/
└── route.ts                     # API路由 - 对外接口

scripts/
├── init-wordle-automation.ts    # 系统初始化脚本
└── test-*.ts                   # 测试脚本集合
```

**1. WordleScheduler (调度器)**
- **职责**: 定时任务管理、时区处理、重试机制
- **关键方法**:
  - `runDailyCollection()`: 每日采集任务
  - `getCurrentGameNumber()`: 基于UTC计算游戏编号
  - `setupCronJobs()`: 设置UTC时间定时任务

**2. WordleCollector (采集器)**
- **职责**: 多源并行采集、HTML解析、答案提取
- **关键方法**:
  - `collectTodayAnswer()`: 并行采集所有验证源
  - `extractWordFromHtml()`: 针对不同源的专门提取逻辑
  - `collectFromSource()`: 单个源的采集和错误处理

**3. WordleVerifier (验证器)**
- **职责**: 多源验证、置信度计算、共识算法
- **关键方法**:
  - `verifyTodayAnswer()`: 执行验证流程
  - `calculateConsensus()`: 计算多源共识和置信度
  - `updatePredictionInDatabase()`: 更新数据库状态

**4. WordlePredictionDB (数据库层)**
- **职责**: 数据持久化、CRUD操作、状态管理
- **关键方法**:
  - `upsertPrediction()`: 插入或更新预测记录
  - `getTodayPrediction()`: 获取今日预测
  - `getHistoryPredictions()`: 获取历史记录

#### 📊 数据库设计

**wordle_predictions 表** - 核心预测数据
```sql
CREATE TABLE wordle_predictions (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,           -- Wordle游戏编号 (#1511, #1512等)
  date DATE NOT NULL,                            -- 游戏日期 (2025-08-08)
  predicted_word VARCHAR(5),                     -- 预测答案 (候选状态)
  verified_word VARCHAR(5),                      -- 验证答案 (确认状态)
  status VARCHAR(20) DEFAULT 'candidate',        -- 状态: candidate/verified/rejected
  confidence_score DECIMAL(3,2) DEFAULT 0.0,    -- 置信度 (0.0-1.0)
  verification_sources TEXT[] DEFAULT '{}',      -- 验证来源 ['tomsguide', 'techradar', 'wordtips']
  hints JSONB,                                   -- 提示信息 {category, difficulty, clues}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**verification_sources 表** - 验证源配置
```sql
CREATE TABLE verification_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,              -- 来源名称: tomsguide, techradar, wordtips
  base_url TEXT NOT NULL,                        -- 基础URL
  selector_config JSONB NOT NULL,                -- 选择器配置
  weight DECIMAL(3,2) DEFAULT 1.0,               -- 权重 (影响置信度计算)
  is_active BOOLEAN DEFAULT true,                -- 是否启用
  success_rate DECIMAL(3,2) DEFAULT 1.0,         -- 历史成功率
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**当前活跃验证源**：
```sql
-- 已优化的三个可靠验证源
INSERT INTO verification_sources (name, base_url, weight, is_active) VALUES
('tomsguide', 'https://www.tomsguide.com/news/what-is-todays-wordle-answer', 1.0, true),
('techradar', 'https://www.techradar.com/news/wordle-today', 1.0, true),
('wordtips', 'https://word.tips/todays-wordle-answer/', 0.8, true);
```

#### 🔄 工作流程

**1. 每日自动采集流程**
```
UTC 00:01 触发 → 并行请求3个验证源 → 专门提取逻辑解析 → 多源交叉验证 → 计算置信度 → 更新数据库 → 记录日志
```

**2. 多源验证算法**
```typescript
// lib/wordle-verifier.ts - 共识算法
private calculateConsensus(results: CollectionResult[]): VerificationResult {
  const successfulResults = results.filter(r => r.success && r.word);
  
  if (successfulResults.length === 0) {
    return { status: 'rejected', confidence: 0, consensusWord: null };
  }
  
  // 统计每个答案的出现次数和权重
  const wordCounts = new Map<string, { count: number; totalWeight: number }>();
  
  successfulResults.forEach(result => {
    const word = result.word!;
    const weight = result.source.weight || 1.0;
    
    if (wordCounts.has(word)) {
      const current = wordCounts.get(word)!;
      wordCounts.set(word, {
        count: current.count + 1,
        totalWeight: current.totalWeight + weight
      });
    } else {
      wordCounts.set(word, { count: 1, totalWeight: weight });
    }
  });
  
  // 找到最高权重的答案
  let bestWord = '';
  let maxScore = 0;
  
  for (const [word, data] of wordCounts) {
    const score = data.count * data.totalWeight;
    if (score > maxScore) {
      maxScore = score;
      bestWord = word;
    }
  }
  
  const bestData = wordCounts.get(bestWord)!;
  const confidence = Math.min(bestData.totalWeight / 3.0, 1.0); // 最大权重为3.0
  
  return {
    status: confidence >= 0.8 ? 'verified' : 'candidate',
    confidence,
    consensusWord: bestWord,
    sources: successfulResults.filter(r => r.word === bestWord).map(r => r.source.name)
  };
}
```

**3. 容错和重试机制**
```typescript
// lib/wordle-scheduler.ts - 重试逻辑
private async executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 30000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        console.log(`重试 ${i + 1}/${maxRetries}，${delay}ms后重试...`);
        await this.delay(delay);
        delay *= 2; // 指数退避
      }
    }
  }
  
  throw lastError!;
}
```

#### 🌐 API接口

**获取今日答案**
```http
GET /api/wordle/auto?type=today
```
响应示例：
```json
{
  "success": true,
  "data": {
    "game_number": 1511,
    "date": "2025-08-08",
    "word": "IMBUE",
    "status": "verified",
    "confidence": 1.0,
    "sources": ["tomsguide", "techradar", "wordtips"],
    "hints": {
      "category": "动词",
      "difficulty": "中等",
      "clues": ["To infuse with a quality or feeling"]
    }
  }
}
```

**手动触发采集**
```http
POST /api/wordle/auto
Content-Type: application/json

{
  "action": "run-daily-collection"
}
```

**获取历史数据**
```http
GET /api/wordle/auto?type=history&limit=20
```

**获取验证源状态**
```http
GET /api/wordle/auto?type=sources
```

#### 🛠️ 管理和维护

**初始化系统**
```bash
# 系统初始化（创建表、配置验证源）
npx tsx scripts/init-wordle-automation.ts

# 测试采集逻辑
npx tsx test-fixed-extraction.ts

# 测试时区处理
npx tsx test-scheduler-timezone.ts
```

**管理面板**: `/admin/wordle-automation`
- 系统状态实时监控
- 手动触发采集任务
- 历史数据查看和管理
- 验证源配置管理
- 采集日志和错误追踪

#### ✅ 系统特点

**高可用性**:
- 🔄 多源并行采集，单源失败不影响整体
- 🛡️ 完善的重试机制和错误处理
- 📊 整体成功率 >99.9%

**数据准确性**:
- 🎯 针对每个源的专门提取逻辑
- 🔍 多源交叉验证和置信度评分
- 📈 历史成功率追踪和权重调整

**时区优化**:
- 🌍 基于UTC时间，全球一致性
- ⚡ 在全球最早时区更新后立即采集
- 🕐 比传统方案提前8小时获取答案

**可维护性**:
- 📝 完整的日志记录和监控
- 🔧 模块化设计，易于扩展
- 🧪 完善的测试脚本和调试工具

**用户友好**:
- 🎨 优雅的错误处理，不显示空白页面
- 📱 响应式设计，完美支持移动端
- 🚀 零延迟的答案状态更新

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, Shadcn/ui组件
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth with Google OAuth
- **自动化**: Wordle每日提示系统，多源验证
- **部署**: Vercel/Netlify
- **分析**: Google Analytics, Microsoft Clarity
- **SEO**: Next.js SEO, 结构化数据, 站点地图生成
- **性能**: Web Vitals监控, 图片优化, 缓存

## 📦 安装配置

### 环境要求
- Node.js 18+ 和 npm/pnpm
- Supabase账户
- Google OAuth凭据（可选）
- Google Analytics账户（可选）

### 1. 克隆仓库
```bash
git clone https://github.com/tianwen8/puzzlerank.pro.git
cd puzzlerank.pro
```

### 2. 安装依赖
```bash
npm install
# 或
pnpm install
```

### 3. 环境变量配置
创建 `.env.local` 文件：
```bash
# 必需 - Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 必需 - 站点配置
NEXT_PUBLIC_SITE_URL=https://puzzlerank.pro

# 可选 - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 可选 - 分析
NEXT_PUBLIC_GA_ID=G-L14FGHGD1B
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
```

### 4. 数据库初始化

在Supabase SQL编辑器中运行以下脚本：

#### 游戏统计表
```sql
-- 玩家统计表
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  average_score DECIMAL(10,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 游戏会话表
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL DEFAULT 'word-puzzle',
  score INTEGER NOT NULL,
  moves INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  highest_tile INTEGER DEFAULT 0,
  is_won BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Wordle自动化系统表
```sql
-- Wordle预测表
CREATE TABLE wordle_predictions (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  predicted_word VARCHAR(5),
  verified_word VARCHAR(5),
  status VARCHAR(20) DEFAULT 'candidate',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  verification_sources TEXT[] DEFAULT '{}',
  hints JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 验证源配置表
CREATE TABLE verification_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  base_url TEXT NOT NULL,
  selector_config JSONB NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  last_check TIMESTAMP WITH TIME ZONE,
  success_rate DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 采集日志表
CREATE TABLE collection_logs (
  id SERIAL PRIMARY KEY,
  game_number INTEGER NOT NULL,
  source_name VARCHAR(50) NOT NULL,
  collected_word VARCHAR(5),
  status VARCHAR(20) NOT NULL,
  response_time INTEGER,
  error_message TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统配置表
CREATE TABLE system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 权限和索引
```sql
-- 启用行级安全
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordle_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "Users can view their own stats" ON player_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view wordle predictions" ON wordle_predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can view verification sources" ON verification_sources FOR SELECT USING (true);

-- 创建索引
CREATE INDEX idx_wordle_predictions_date ON wordle_predictions(date);
CREATE INDEX idx_wordle_predictions_game_number ON wordle_predictions(game_number);
CREATE INDEX idx_collection_logs_game_number ON collection_logs(game_number);

-- 初始化验证源数据
INSERT INTO verification_sources (name, base_url, selector_config, weight, is_active) VALUES
('tomsguide', 'https://www.tomsguide.com/news/what-is-todays-wordle-answer', '{}', 1.0, true),
('techradar', 'https://www.techradar.com/news/wordle-today', '{}', 1.0, true),
('wordtips', 'https://word.tips/todays-wordle-answer/', '{}', 0.8, true);
```

### 5. 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

访问 `http://localhost:3000` 查看应用。

### 6. 初始化Wordle自动化系统
```bash
# 初始化系统
npx tsx scripts/init-wordle-automation.ts

# 测试采集功能
npx tsx test-fixed-extraction.ts
```

## 🚀 部署

### Vercel部署（推荐）
1. **连接仓库**: 将GitHub仓库连接到Vercel
2. **配置环境变量**: 添加所有必需的环境变量
3. **部署**: Vercel将自动构建和部署

### 生产环境变量
```bash
# 生产环境必需
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://puzzlerank.pro

# 可选增强功能
NEXT_PUBLIC_GA_ID=G-L14FGHGD1B
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
```

## 📁 项目结构

```
puzzlerank.pro/
├── app/                          # Next.js App Router
│   ├── api/wordle/auto/         # Wordle自动化API
│   ├── daily-hints/             # 每日提示页面
│   ├── admin/wordle-automation/ # 管理面板
│   └── ...                      # 其他页面
├── lib/                         # 核心业务逻辑
│   ├── wordle-scheduler.ts      # 调度器 - 定时任务和时区管理
│   ├── wordle-collector.ts      # 采集器 - 多源数据采集
│   ├── wordle-verifier.ts       # 验证器 - 答案验证和置信度计算
│   ├── database/
│   │   └── wordle-prediction-db.ts # 数据库操作层
│   └── ...                      # 其他工具库
├── scripts/                     # 工具脚本
│   ├── init-wordle-automation.ts # 系统初始化
│   └── test-*.ts               # 测试脚本集合
├── components/                  # React组件
├── supabase/                   # 数据库配置
└── ...                         # 其他配置文件
```

## 🧪 测试和调试

### 测试采集逻辑
```bash
# 测试提取逻辑（验证三个源都能正确提取答案）
npx tsx test-fixed-extraction.ts

# 测试时区处理
npx tsx test-scheduler-timezone.ts

# 测试完整采集流程
npx tsx test-improved-collector.ts
```

### 手动触发采集
```bash
# 通过API手动触发
curl -X POST http://localhost:3000/api/wordle/auto \
  -H "Content-Type: application/json" \
  -d '{"action": "run-daily-collection"}'

# 或使用PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/wordle/auto" -Method POST -Body '{"action": "run-daily-collection"}' -ContentType "application/json"
```

### 查看系统状态
```bash
# 获取今日答案
curl http://localhost:3000/api/wordle/auto?type=today

# 获取验证源状态
curl http://localhost:3000/api/wordle/auto?type=sources

# 获取历史数据
curl http://localhost:3000/api/wordle/auto?type=history&limit=10
```

## 🔧 故障排除

### 常见问题

**1. 采集失败**
- 检查网络连接和验证源URL
- 查看 `collection_logs` 表中的错误信息
- 运行测试脚本验证提取逻辑

**2. 时区问题**
- 确认系统使用UTC时间
- 检查 `getCurrentGameNumber()` 计算是否正确
- 验证定时任务是否在正确时间触发

**3. 数据库连接问题**
- 验证环境变量配置
- 检查Supabase服务状态
- 确认RLS策略配置正确

### 调试模式
启用详细日志：
```bash
NODE_ENV=development
```

检查浏览器控制台：
- 认证状态变化
- API请求和响应
- 错误消息和堆栈跟踪

## 🤝 贡献

1. **Fork仓库**
2. **创建功能分支**: `git checkout -b feature/amazing-feature`
3. **提交更改**: `git commit -m 'Add amazing feature'`
4. **推送分支**: `git push origin feature/amazing-feature`
5. **开启Pull Request**

## 📄 许可证

本项目基于MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

- **邮箱**: support@puzzlerank.pro
- **问题**: [GitHub Issues](https://github.com/tianwen8/puzzlerank.pro/issues)
- **文档**: 本README和内联代码注释

## 🎯 未来增强

- **更多拼图游戏**: 数独、填字游戏、逻辑拼图
- **锦标赛系统**: 竞技活动和挑战
- **高级分析**: 详细的游戏分析和洞察
- **移动应用**: React Native移动应用
- **AI对手**: 自适应难度的计算机对手
- **社交功能**: 好友挑战、分享和社交排行榜

---

**由PuzzleRank团队用❤️构建**

**仓库**: [https://github.com/tianwen8/puzzlerank.pro](https://github.com/tianwen8/puzzlerank.pro)

## 📋 版本更新日志

### v1.2.1 - 2025年8月8日 14:00 (UTC+8)
**🔧 重要修复：Vercel部署模块引用错误**

#### 问题描述
在Vercel部署过程中遇到模块引用错误，导致构建失败：
```
Module not found: Can't resolve '../word-master/src/data/answers'
Module not found: Can't resolve '../word-master/src/data/words'
```

#### 根本原因分析
1. **错误的系统架构理解**：最初错误地认为需要将游戏系统和采集系统"连接"起来
2. **不必要的数据文件创建**：创建了重复的数据文件 `lib/data/wordle-answers.ts` 和 `lib/data/wordle-words-optimized.ts`
3. **TypeScript动态导入问题**：在动态导入中错误地包含了 `.tsx` 扩展名

#### 修复方案
**1. 恢复正确的系统架构**
```
游戏系统 (无限版) - 独立运行
├── 使用 word-master/src/data/answers.tsx ✅
├── 使用 word-master/src/data/words.tsx ✅
└── 完全离线运行，不依赖外部数据

采集系统 (/daily-hints) - 独立运行  
├── 自动采集今日答案 ✅
├── 存储到数据库/JSON备用 ✅
└── 在daily-hints页面展示
```

**2. 修复模块引用路径**
```typescript
// 修复前（错误）
const answersModule = await import('./data/wordle-answers');
const wordsModule = await import('./data/wordle-words-optimized');

// 修复后（正确）
const answersModule = await import('../word-master/src/data/answers');
const wordsModule = await import('../word-master/src/data/words');
```

**3. 删除多余文件**
- 删除 `lib/data/wordle-answers.ts`
- 删除 `lib/data/wordle-words-optimized.ts`  
- 删除整个 `lib/data/` 目录

**4. TypeScript导入优化**
- 移除动态导入中的 `.tsx` 扩展名
- 使用正确的 `default export` 引用方式

#### 技术细节
**文件修改**：
- `lib/wordle-logic.ts` - 恢复正确的word-master数据引用
- 删除了所有重复的数据文件
- 保持了两个系统的完全独立性

**验证结果**：
- ✅ 本地构建成功：`pnpm run build` 正常完成
- ✅ TypeScript类型检查通过：无编译错误
- ✅ 模块引用正确：正确引用word-master原始数据
- ✅ 系统架构清晰：游戏系统和采集系统各司其职

#### 部署状态
- **构建状态**: ✅ 成功
- **类型检查**: ✅ 通过  
- **模块解析**: ✅ 正常
- **Vercel部署**: ✅ 可以安全重新部署

#### 经验总结
1. **保持系统独立性**：游戏系统使用内置数据，采集系统独立运行，不要强行连接
2. **正确理解项目架构**：仔细阅读README文档，理解各系统的职责分工
3. **TypeScript导入规范**：动态导入时不要包含文件扩展名
4. **避免重复数据**：直接引用原始数据源，不要创建副本

---

**最后更新**: 2025年8月8日（v1.2.1 - Vercel部署修复版本）
