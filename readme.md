# PuzzleRank Pro - 智能拼图游戏平台

一个集成了2048和Wordle游戏的现代化Web应用，具备自动化数据采集、实时排行榜和智能提示系统。

## 🚀 项目特性

### 核心功能
- **多游戏支持**: 2048滑块游戏 + Wordle猜词游戏
- **实时排行榜**: 基于Supabase的全球玩家排名系统
- **智能提示系统**: AI驱动的Wordle每日提示和策略建议
- **自动化数据采集**: 每日自动获取和验证Wordle答案
- **SEO优化**: 完整的搜索引擎优化和结构化数据
- **响应式设计**: 支持桌面端和移动端完美体验

### 技术亮点
- **Next.js 14**: 使用App Router和最新特性
- **TypeScript**: 完整的类型安全保障
- **Supabase**: 实时数据库和用户认证
- **Tailwind CSS**: 现代化UI设计系统
- **Vercel部署**: 自动化CI/CD和边缘计算
- **自动化Cron**: 定时任务和数据同步

## 📋 技术栈

### 前端技术
```json
{
  "framework": "Next.js 14.2.16",
  "language": "TypeScript 5.x",
  "styling": "Tailwind CSS 3.x",
  "ui_components": "Radix UI + shadcn/ui",
  "state_management": "React Context + Hooks",
  "animations": "Framer Motion",
  "icons": "Lucide React"
}
```

### 后端技术
```json
{
  "database": "Supabase (PostgreSQL)",
  "authentication": "Supabase Auth",
  "api": "Next.js API Routes",
  "cron_jobs": "Vercel Cron",
  "data_collection": "NYT Official API + HTML解析",
  "storage": "Supabase Storage"
}
```

### 部署和运维
```json
{
  "hosting": "Vercel",
  "domain": "puzzlerank.pro",
  "ssl": "自动HTTPS",
  "cdn": "Vercel Edge Network",
  "monitoring": "Vercel Analytics",
  "error_tracking": "内置错误处理"
}
```

## 🛠️ 环境配置

### 必需环境变量
```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cron任务安全密钥
CRON_SECRET=your_cron_secret_key

# 可选：外部API密钥
OPENAI_API_KEY=your_openai_key (用于AI提示生成)
```

### Supabase数据库表结构

#### 1. wordle_predictions表
```sql
CREATE TABLE wordle_predictions (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  predicted_word VARCHAR(5),
  verified_word VARCHAR(5),
  status VARCHAR(20) CHECK (status IN ('candidate', 'verified', 'rejected')),
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  verification_sources TEXT[] DEFAULT '{}',
  hints JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. game_sessions表
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  score INTEGER NOT NULL,
  moves_count INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  is_won BOOLEAN NOT NULL,
  highest_tile INTEGER NOT NULL,
  game_board JSONB,
  game_type VARCHAR(20) DEFAULT '2048',
  game_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. player_stats表
```sql
CREATE TABLE player_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(50),
  email VARCHAR(255),
  avatar_url TEXT,
  best_score INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_moves INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  highest_tile_achieved INTEGER DEFAULT 0,
  wordle_games_played INTEGER DEFAULT 0,
  wordle_games_won INTEGER DEFAULT 0,
  wordle_current_streak INTEGER DEFAULT 0,
  wordle_best_streak INTEGER DEFAULT 0,
  wordle_average_guesses DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 安装和运行

### 1. 克隆项目
```bash
git clone https://github.com/tianwen8/puzzlerank.pro.git
cd puzzlerank.pro
```

### 2. 安装依赖
```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install

# 或使用yarn
yarn install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

### 4. 数据库初始化
```bash
# 在Supabase控制台执行SQL脚本
# 或使用提供的初始化脚本
node scripts/init-database.js
```

### 5. 启动开发服务器
```bash
pnpm dev
# 访问 http://localhost:3000
```

## 📦 项目结构

```
puzzlerank.pro/
├── app/                          # Next.js App Router
│   ├── api/                      # API路由
│   │   ├── wordle/              # Wordle相关API
│   │   │   ├── route.ts         # 基础Wordle API
│   │   │   ├── auto/route.ts    # 自动采集API
│   │   │   └── update/route.ts  # 数据更新API
│   │   └── seo/                 # SEO相关API
│   ├── admin/                   # 管理员页面
│   │   ├── collection/          # 数据采集管理
│   │   ├── seo/                 # SEO管理
│   │   └── wordle-automation/   # Wordle自动化管理
│   ├── wordle/                  # Wordle游戏页面
│   │   ├── [id]/               # 动态游戏页面
│   │   ├── today/              # 今日游戏
│   │   └── history/            # 历史记录
│   └── daily-hints/            # 每日提示页面
├── components/                  # React组件
│   ├── ui/                     # 基础UI组件
│   ├── games/                  # 游戏组件
│   └── shared/                 # 共享组件
├── lib/                        # 核心库文件
│   ├── database/               # 数据库操作
│   │   ├── wordle-prediction-db.ts      # Supabase数据库操作
│   │   ├── wordle-prediction-db-fallback.ts # JSON备用数据库
│   │   └── wordle-data.json    # 备用数据文件
│   ├── supabase/              # Supabase配置
│   │   ├── client.ts          # 客户端配置
│   │   └── types.ts           # 类型定义
│   ├── seo/                   # SEO优化
│   ├── nyt-official-collector.ts        # NYT官方API采集器
│   ├── wordle-collector.ts              # 多源数据采集器
│   ├── wordle-updater.ts                # 数据更新系统
│   ├── wordle-scheduler.ts              # 定时任务调度
│   └── answer-hint-generator.ts         # AI提示生成器
├── scripts/                    # 工具脚本
│   ├── init-database.js       # 数据库初始化
│   ├── test-collection.js     # 采集测试
│   └── deployment-check.js    # 部署检查
├── public/                     # 静态资源
├── styles/                     # 样式文件
└── vercel.json                # Vercel配置
```

## 🤖 自动化系统

### Wordle数据采集系统

#### 1. 数据源配置
```typescript
// 主要数据源：NYT官方API (最高优先级)
const NYT_API_URL = 'https://www.nytimes.com/svc/wordle/v2/{gameNumber}.json'

// 备用数据源：HTML解析
const BACKUP_SOURCES = [
  'https://www.tomsguide.com/news/what-is-todays-wordle-answer',
  'https://www.wordtips.com/wordle-today/',
  // 更多备用源...
]
```

#### 2. 游戏编号计算
```typescript
// 基准日期：2025-08-07 = 游戏编号 #1510
function calculateGameNumber(date: string): number {
  const baseDate = new Date('2025-08-07');
  const baseGameNumber = 1510;
  const targetDate = new Date(date);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  return baseGameNumber + diffDays;
}
```

#### 3. Vercel Cron配置
```json
{
  "crons": [
    {
      "path": "/api/wordle/auto",
      "schedule": "2 12 * * *"
    },
    {
      "path": "/api/wordle/auto",
      "schedule": "0 13 * * *"
    }
  ]
}
```

### 数据验证流程

#### 1. 多源验证
```typescript
interface UpdateResult {
  success: boolean;
  gameNumber: number;
  word: string;
  verified: boolean;
  sources: string[];
  message: string;
}
```

#### 2. 置信度评分
```typescript
// 置信度计算规则
const confidenceScore = Math.min(1.0, (sourceWeight * 0.05 + sourceCount * 0.1));
const isVerified = sourceCount >= 2 || sourceWeight >= 15;
```

## 🔐 安全配置

### API安全
```typescript
// Cron任务认证
const CRON_SECRET = process.env.CRON_SECRET;
if (request.headers.get('Authorization') !== `Bearer ${CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 数据库安全
```sql
-- RLS (Row Level Security) 策略
ALTER TABLE wordle_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own stats" ON player_stats
  FOR SELECT USING (auth.uid() = user_id);
```

## 🚀 部署指南

### Vercel部署
1. **连接GitHub仓库**
   ```bash
   # 推送代码到GitHub
   git push origin main
   ```

2. **配置环境变量**
   - 在Vercel控制台设置所有必需的环境变量
   - 确保CRON_SECRET的安全性

3. **域名配置**
   ```bash
   # 在Vercel中添加自定义域名
   Domain: puzzlerank.pro
   SSL: 自动配置
   ```

### Supabase配置
1. **创建项目**
   - 在Supabase控制台创建新项目
   - 获取URL和API密钥

2. **执行数据库迁移**
   ```sql
   -- 执行scripts/目录下的SQL文件
   -- 按顺序执行所有迁移脚本
   ```

3. **配置认证**
   ```sql
   -- 启用邮箱认证
   -- 配置OAuth提供商（可选）
   ```

## 🐛 故障排除

### 常见问题

#### 1. 数据采集失败
```bash
# 检查Cron任务状态
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://puzzlerank.pro/api/wordle/auto

# 查看采集日志
# 访问 /admin/collection 页面
```

#### 2. 数据库连接问题
```typescript
// 检查环境变量
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗');
```

#### 3. TypeScript编译错误
```bash
# 检查类型定义
pnpm type-check

# 修复常见类型错误
# 确保所有数据库字段类型匹配
```

### 修复历史记录

#### 最近修复的问题 (2025-08-22)
1. **数据库系统迁移**: 从旧的wordle-db迁移到Supabase WordlePredictionDB
2. **TypeScript类型错误**: 修复所有类型不匹配问题
3. **NYT官方API集成**: 修复URL格式和游戏编号计算
4. **数据采集逻辑**: 修复getTodayPrediction查询逻辑
5. **状态字段修正**: 使用正确的'candidate'|'verified'|'rejected'状态值

#### 提交历史
```bash
840278c - fix: 一次性修复所有TypeScript类型错误 - 使用正确的status值
4b33030 - fix: 修复verified_word字段类型 - 使用undefined替代null
cb91e1a - fix: 修复TypeScript const断言错误
121c70b - fix: 修复collectTodayAnswer方法缺少日期参数
1a689e3 - fix: 修复TypeScript类型错误 - word字段可能为undefined
bd0ff28 - fix: 修复wordle-updater使用新的Supabase数据库系统
```

## 📊 监控和分析

### 性能监控
- **Vercel Analytics**: 页面性能和用户行为分析
- **Core Web Vitals**: LCP, FID, CLS指标监控
- **错误追踪**: 自动错误收集和报告

### 数据分析
```sql
-- 获取系统统计
SELECT 
  COUNT(*) as total_predictions,
  COUNT(*) FILTER (WHERE status = 'verified') as verified_count,
  AVG(confidence_score) as avg_confidence
FROM wordle_predictions;
```

## 🤝 贡献指南

### 开发流程
1. Fork项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

### 代码规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 编写单元测试覆盖核心功能
- 更新相关文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- **生产环境**: https://puzzlerank.pro
- **GitHub仓库**: https://github.com/tianwen8/puzzlerank.pro
- **问题反馈**: https://github.com/tianwen8/puzzlerank.pro/issues
- **技术文档**: 查看docs/目录下的详细文档

---

**最后更新**: 2025-08-22
**版本**: 2.4.0
**维护者**: tianwen8

如有任何问题或建议，欢迎提交Issue或Pull Request！