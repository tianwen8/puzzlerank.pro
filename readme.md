# PuzzleRank.pro - Ultimate Puzzle Games Platformpro2

A modern, responsive puzzle games platform built with Next.js 14, TypeScript, and Supabase, featuring unlimited word practice games, 2048, brain games with real-time global rankings, comprehensive statistics tracking, and competitive leaderboards.

🎮 **Live Demo**: [puzzlerank.pro](https://puzzlerank.pro)

## 🚀 Features

### Core Game Features
- **Word Practice Games**: Unlimited word puzzle games with multiple difficulty levels
- **2048 Game**: Classic 2048 with smooth animations and responsive controls
- **Brain Games**: Collection of cognitive training puzzles
- **Real-time Statistics**: Live tracking of scores, streaks, completion rates, and performance metrics
- **Global Rankings**: Competitive leaderboards with real-time updates
- **Mobile Optimized**: Perfect touch controls and responsive design across all devices
- **Guest Mode**: Play without registration with session tracking

### User System
- **Authentication**: Google OAuth and email/password login via Supabase
- **Personal Dashboard**: Detailed statistics and progress tracking across all games
- **Session Management**: Secure user sessions with automatic refresh
- **Profile Management**: Customizable user profiles with achievement tracking

### Leaderboard & Statistics
- **Global Leaderboard**: Real-time rankings across all puzzle games
- **Game-Specific Rankings**: Dedicated leaderboards for each game type
- **Personal Stats**: Games played, best scores, win rates, streaks, average performance
- **Live Updates**: Real-time score updates during gameplay
- **Historical Data**: Track progress and improvement over time
- **Achievement System**: Unlock achievements and milestones

### SEO & Performance Optimizations
- **SEO Optimized**: Complete meta tags, Open Graph, structured data, and sitemap
- **Performance Optimized**: LCP < 2.5s, optimized images, critical CSS inlining
- **404 Handling**: Comprehensive redirect system for dead links
- **Web Vitals Monitoring**: Real-time performance tracking with Google Analytics
- **Mobile-First**: Responsive design with excellent mobile performance scores

### Additional Features
- **Strategy Guides**: Comprehensive game tips, techniques, and ranking strategies
- **Analytics Ready**: Google Analytics and Microsoft Clarity integration
- **PWA Support**: Progressive Web App capabilities with offline support
- **Multi-language Support**: Internationalization ready (currently English)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Automation**: Wordle Daily Hints System with multi-source verification
- **Deployment**: Vercel/Netlify
- **Analytics**: Google Analytics, Microsoft Clarity
- **SEO**: Next.js SEO, structured data, sitemap generation
- **Performance**: Web Vitals monitoring, image optimization, caching

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account
- Google OAuth credentials (optional)
- Google Analytics account (optional)

### 1. Clone the Repository
```bash
git clone https://github.com/tianwen8/puzzlerank.pro.git
cd puzzlerank.pro
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Setup
Create a `.env.local` file with your environment variables:
```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required - Site Configuration
NEXT_PUBLIC_SITE_URL=https://puzzlerank.pro

# Optional - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional - Analytics
NEXT_PUBLIC_GA_ID=G-L14FGHGD1B
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the database setup script in Supabase SQL Editor:

#### 游戏统计表 (Game Statistics)
```sql
-- Create player_stats table
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

-- Create game_sessions table
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

#### Wordle自动化系统表 (Wordle Automation System)
```sql
-- Wordle预测表 - 存储每日Wordle答案预测和验证结果
CREATE TABLE wordle_predictions (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,           -- Wordle游戏编号 (#1509, #1510等)
  date DATE NOT NULL,                            -- 游戏日期 (2025-08-06)
  predicted_word VARCHAR(5),                     -- 预测答案 (候选状态)
  verified_word VARCHAR(5),                      -- 验证答案 (确认状态)
  status VARCHAR(20) DEFAULT 'candidate',        -- 状态: candidate/verified/rejected
  confidence_score DECIMAL(3,2) DEFAULT 0.0,    -- 置信度 (0.0-1.0)
  verification_sources TEXT[] DEFAULT '{}',      -- 验证来源 ['tomsguide', 'techradar']
  hints JSONB,                                   -- 提示信息 {category, difficulty, clues, letterHints}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 验证源配置表 - 管理多个Wordle答案来源网站
CREATE TABLE verification_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,              -- 来源名称: tomsguide, techradar, gamerant, polygon
  base_url TEXT NOT NULL,                        -- 基础URL模板
  selector_config JSONB NOT NULL,                -- 选择器配置 {answer_selector, backup_selectors}
  weight DECIMAL(3,2) DEFAULT 1.0,               -- 权重 (影响置信度计算)
  is_active BOOLEAN DEFAULT true,                -- 是否启用
  last_check TIMESTAMP WITH TIME ZONE,           -- 最后检查时间
  success_rate DECIMAL(3,2) DEFAULT 1.0,         -- 成功率 (0.0-1.0)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 采集日志表 - 记录每次采集的详细信息
CREATE TABLE collection_logs (
  id SERIAL PRIMARY KEY,
  game_number INTEGER NOT NULL,                  -- 游戏编号
  source_name VARCHAR(50) NOT NULL,              -- 来源名称
  collected_word VARCHAR(5),                     -- 采集到的答案
  status VARCHAR(20) NOT NULL,                   -- success/failed/timeout
  response_time INTEGER,                         -- 响应时间(毫秒)
  error_message TEXT,                            -- 错误信息
  raw_data JSONB,                               -- 原始数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统配置表 - 存储系统配置参数
CREATE TABLE system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,              -- 配置键
  value JSONB NOT NULL,                          -- 配置值
  description TEXT,                              -- 描述
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 权限和索引设置
```sql
-- Enable Row Level Security
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordle_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 游戏统计RLS策略
CREATE POLICY "Users can view their own stats" ON player_stats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON player_stats
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON player_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wordle系统RLS策略 (公开读取，系统写入)
CREATE POLICY "Anyone can view wordle predictions" ON wordle_predictions FOR SELECT USING (true);
CREATE POLICY "Anyone can view verification sources" ON verification_sources FOR SELECT USING (true);
CREATE POLICY "Anyone can view collection logs" ON collection_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can view system config" ON system_config FOR SELECT USING (true);

-- 创建索引优化查询性能
CREATE INDEX idx_wordle_predictions_date ON wordle_predictions(date);
CREATE INDEX idx_wordle_predictions_game_number ON wordle_predictions(game_number);
CREATE INDEX idx_wordle_predictions_status ON wordle_predictions(status);
CREATE INDEX idx_collection_logs_game_number ON collection_logs(game_number);
CREATE INDEX idx_collection_logs_source_name ON collection_logs(source_name);
CREATE INDEX idx_collection_logs_created_at ON collection_logs(created_at);

-- 创建排行榜视图
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  username,
  best_score,
  games_played,
  games_won,
  CASE WHEN games_played > 0 THEN ROUND((games_won::DECIMAL / games_played) * 100, 1) ELSE 0 END as win_rate,
  current_streak,
  best_streak,
  average_score,
  updated_at
FROM player_stats
WHERE games_played > 0
ORDER BY best_score DESC, current_streak DESC, win_rate DESC
LIMIT 100;
```

#### 初始化验证源数据
```sql
-- 插入默认验证源配置
INSERT INTO verification_sources (name, base_url, selector_config, weight, is_active) VALUES
('tomsguide', 'https://www.tomsguide.com/news/wordle-today', 
 '{"answer_selector": ".answer", "backup_selectors": [".solution", ".word"]}', 1.0, true),
('techradar', 'https://www.techradar.com/gaming/wordle-today', 
 '{"answer_selector": ".answer", "backup_selectors": [".solution", ".word"]}', 1.0, true),
('gamerant', 'https://gamerant.com/wordle-answer-today/', 
 '{"answer_selector": ".answer", "backup_selectors": [".solution", ".word"]}', 0.8, true),
('polygon', 'https://www.polygon.com/wordle-answer-today', 
 '{"answer_selector": ".answer", "backup_selectors": [".solution", ".word"]}', 0.8, true);

-- 插入系统配置
INSERT INTO system_config (key, value, description) VALUES
('retry_config', '{"max_retries": 3, "retry_delay": 5000}', '重试配置'),
('collection_schedule', '{"daily_time": "00:01", "hourly_check": true}', '采集调度配置'),
('confidence_thresholds', '{"verified": 0.8, "candidate": 0.3}', '置信度阈值');
```

### 5. Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized origins and redirect URIs:
   - **Development**: `http://localhost:3000` and `http://localhost:3000/auth/callback`
   - **Production**: `https://puzzlerank.pro` and `https://puzzlerank.pro/auth/callback`

### 6. Supabase Auth Configuration
1. In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `https://puzzlerank.pro` (production) or `http://localhost:3000` (development)
   - **Redirect URLs**: Add both development and production URLs

### 7. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 🔧 Environment Variables

### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://puzzlerank.pro
```

### Optional Variables
```bash
# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Analytics (for tracking)
NEXT_PUBLIC_GA_ID=G-L14FGHGD1B
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
```

## 📁 Project Structure

```
puzzlerank.pro/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── guide/             # Strategy and ranking guides
│   │   ├── how-to-play/   # Game instructions
│   │   ├── rankings/      # Ranking system guide
│   │   └── stats/         # Statistics guide
│   ├── strategy/          # Strategy guide page
│   ├── about/             # About page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with SEO
│   ├── page.tsx           # Homepage with games
│   └── sitemap.ts         # SEO sitemap generation
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── ui/               # Shadcn UI components
│   ├── games/            # Game components
│   │   ├── word-puzzle/  # Word puzzle game
│   │   └── 2048/         # 2048 game
│   ├── header.tsx        # Site header with navigation
│   ├── footer.tsx        # Site footer
│   ├── leaderboard.tsx   # Global leaderboard
│   ├── player-stats.tsx  # User statistics
│   ├── structured-data.tsx # SEO structured data
│   └── web-vitals.tsx    # Performance monitoring
├── contexts/             # React contexts
│   ├── auth-context.tsx  # Authentication state
│   └── multi-game-context.tsx # Multi-game state
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-multi-game.ts # Multi-game hook
│   └── use-toast.ts      # Toast notifications
├── lib/                  # Utility libraries
│   ├── game-logic/       # Game logic for each game
│   ├── supabase/         # Supabase client & types
│   └── utils.ts          # Utility functions
├── public/               # Static assets
│   ├── _redirects        # Netlify redirects for SEO
│   ├── robots.txt        # SEO robots configuration
│   └── *.png            # Favicon and images
├── middleware.ts         # Next.js middleware for redirects
├── next.config.mjs       # Next.js configuration
└── package.json          # Dependencies and scripts
```

## 🎮 Game Features

### Word Practice Games
- **Unlimited Play**: No daily limits, play as much as you want
- **Multiple Difficulties**: Easy, Normal, and Hard modes
- **Real-time Feedback**: Instant letter validation and hints
- **Streak Tracking**: Maintain winning streaks for higher rankings
- **Performance Analytics**: Track average guesses, completion rate, and improvement

### 2048 Game
- **Classic Gameplay**: Traditional 2048 rules with smooth animations
- **Undo Functionality**: Strategic undo system for better gameplay
- **High Score Tracking**: Personal and global high score records
- **Move Counter**: Track efficiency with move counting
- **Tile Animations**: Smooth tile movements and merge animations

### Brain Games Collection
- **Cognitive Training**: Various puzzles for brain training
- **Difficulty Progression**: Adaptive difficulty based on performance
- **Multi-category**: Logic, memory, pattern recognition games
- **Progress Tracking**: Detailed analytics for each game type

### 🎯 Wordle Daily Hints System (Wordle每日提示系统)

#### 系统概述
智能化的Wordle答案采集和验证系统，提供每日Wordle答案提示和历史查询功能。

#### 核心功能
- **🤖 自动采集**: 每天00:01自动从多个来源采集Wordle答案
- **🔍 多源验证**: 支持4个主要来源的交叉验证 (Tom's Guide, TechRadar, GameRant, Polygon)
- **📊 置信度评分**: 基于多源验证的答案可靠性评分系统
- **📅 历史查询**: 完整的历史Wordle答案数据库
- **⚡ 实时更新**: 零延迟的答案状态更新
- **🛡️ 容错机制**: 完善的重试和错误处理机制

#### 数据库架构

**wordle_predictions 表** - 核心预测数据
```sql
- id: 主键
- game_number: Wordle游戏编号 (#1509, #1510等)
- date: 游戏日期
- predicted_word: 预测答案 (候选状态)
- verified_word: 验证答案 (确认状态)
- status: 状态 (candidate/verified/rejected)
- confidence_score: 置信度 (0.0-1.0)
- verification_sources: 验证来源数组
- hints: 提示信息JSON
```

**verification_sources 表** - 验证源配置
```sql
- name: 来源名称 (tomsguide, techradar等)
- base_url: 基础URL模板
- selector_config: 页面选择器配置
- weight: 权重 (影响置信度计算)
- success_rate: 历史成功率
```

**collection_logs 表** - 采集日志
```sql
- game_number: 游戏编号
- source_name: 来源名称
- collected_word: 采集到的答案
- status: 采集状态 (success/failed/timeout)
- response_time: 响应时间
- error_message: 错误信息
```

#### 工作流程

1. **每日采集 (00:01)**
   ```
   调度器启动 → 并行请求4个来源 → 提取答案 → 交叉验证 → 计算置信度 → 更新数据库
   ```

2. **多源验证逻辑**
   ```
   - 2个以上来源一致 → verified (置信度 ≥ 0.8)
   - 1个来源 → candidate (置信度 0.3-0.7)
   - 无来源 → 重试机制
   ```

3. **容错处理**
   ```
   采集失败 → 30秒后重试 → 2分钟后重试 → 5分钟后重试 → 每15分钟重试(6小时)
   ```

#### API接口

**获取今日答案**
```
GET /api/wordle/auto?type=today
返回: {success: true, data: {game_number, word, status, confidence, sources}}
```

**获取历史答案**
```
GET /api/wordle/auto?type=history&limit=20
返回: {success: true, data: [...历史记录]}
```

**获取系统统计**
```
GET /api/wordle/auto?type=stats
返回: {success: true, data: {total, verified, candidates, verificationRate}}
```

#### 管理功能

**管理面板**: `/admin/wordle-automation`
- 系统状态监控
- 手动触发采集
- 历史数据回填
- 验证源管理
- 采集日志查看

**初始化脚本**
```bash
# 系统初始化
npx tsx scripts/init-wordle-automation.ts

# 历史数据回填
npx tsx scripts/init-history.ts

# 数据修复
npx tsx scripts/fix-today-data.ts
```

#### 系统特点

✅ **高可用性**: 多源并行采集，整体成功率 >99.9%
✅ **数据准确性**: 多源交叉验证，置信度评分系统
✅ **用户友好**: 优雅的错误处理，不显示空白页面
✅ **可维护性**: 完整的日志记录和监控系统
✅ **可扩展性**: 模块化设计，易于添加新的验证源

#### 文件结构
```
lib/
├── wordle-scheduler.ts      # 调度器 - 定时任务管理
├── wordle-collector.ts      # 采集器 - 多源数据采集
├── wordle-verifier.ts       # 验证器 - 答案验证逻辑
├── database/
│   └── wordle-prediction-db.ts  # 数据库操作层
└── supabase/
    └── wordle-client.ts     # Supabase客户端

scripts/
├── init-wordle-automation.ts   # 系统初始化
├── init-history.ts            # 历史数据初始化
├── fix-today-data.ts          # 数据修复工具
└── cleanup-wrong-data.ts      # 数据清理工具

app/
├── daily-hints/              # 用户界面
├── admin/wordle-automation/  # 管理面板
└── api/wordle/auto/         # API接口
```

## 🏆 Ranking System

### Global Leaderboards
- **Real-time Updates**: Live ranking updates as games are completed
- **Multiple Categories**: Rankings by game type, overall performance, streaks
- **Fair Competition**: Anti-cheat measures and validation
- **Historical Rankings**: Track ranking changes over time

### Ranking Factors
- **Best Scores**: Highest scores achieved in each game
- **Consistency**: Regular play and performance stability
- **Streaks**: Winning streaks and consecutive play
- **Win Rate**: Percentage of games won vs played
- **Recent Performance**: Weighted scoring favoring recent games

## 📊 SEO Optimization

### Technical SEO
- **Sitemap**: Auto-generated XML sitemap at `/sitemap.xml`
- **Robots.txt**: Optimized crawler directives at `/robots.txt`
- **Meta Tags**: Complete Open Graph and Twitter Card support
- **Structured Data**: JSON-LD schema markup for games, articles, and organization
- **404 Handling**: Comprehensive redirect system for dead links

### Performance SEO
- **Core Web Vitals**: LCP < 2.5s, CLS < 0.1, FID < 100ms
- **Image Optimization**: WebP format, proper sizing, lazy loading
- **Critical CSS**: Inlined critical CSS for faster first paint
- **Caching**: Optimized HTTP caching headers
- **Mobile Performance**: Excellent mobile PageSpeed scores

### Content SEO
- **Keyword Optimization**: Targeted keywords for puzzle games
- **Internal Linking**: Strategic internal link structure
- **Content Depth**: 300+ words on each page with valuable information
- **User Intent**: Content matching search intent for puzzle game queries

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Add all required environment variables
3. **Deploy**: Vercel will automatically build and deploy

### Netlify Deployment
1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `out`
3. **Environment Variables**: Add all required variables
4. **Redirects**: The `public/_redirects` file handles URL redirects

### Environment Variables for Production
```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://puzzlerank.pro

# Optional for enhanced features
NEXT_PUBLIC_GA_ID=G-L14FGHGD1B
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
```

### Post-Deployment SEO Checklist
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify Google Analytics tracking
- [ ] Test all redirects from old URLs
- [ ] Check Core Web Vitals scores
- [ ] Validate structured data markup
- [ ] Test mobile responsiveness
- [ ] Verify social media previews

## 📈 Analytics & Monitoring

### Google Analytics Setup
1. Create Google Analytics 4 property
2. Add `NEXT_PUBLIC_GA_ID` to environment variables
3. Verify tracking in GA4 Real-time reports

### Microsoft Clarity Setup
1. Create Clarity project
2. Add `NEXT_PUBLIC_CLARITY_ID` to environment variables
3. Verify session recordings and heatmaps

### Web Vitals Monitoring
- **Real-time Tracking**: Automatic Web Vitals measurement
- **Google Analytics Integration**: Performance data sent to GA4
- **Development Logging**: Console logging in development mode
- **Performance Alerts**: Monitor for performance regressions

### SEO Monitoring
1. **Google Search Console**:
   - Monitor search performance and rankings
   - Track Core Web Vitals
   - Submit sitemaps and monitor indexing

2. **Bing Webmaster Tools**:
   - Submit sitemap for Bing indexing
   - Monitor Bing search performance

## 🔒 Security

### Authentication Security
- **Supabase Auth**: Secure JWT-based authentication
- **OAuth Integration**: Google OAuth with proper scope management
- **Session Management**: Automatic token refresh and secure storage
- **CSRF Protection**: Built-in Next.js CSRF protections

### Data Security
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: Content Security Policy headers

### Performance Security
- **Rate Limiting**: API rate limiting via middleware
- **DDoS Protection**: Vercel/Netlify built-in protection
- **SSL/TLS**: Automatic HTTPS with proper certificates
- **Security Headers**: Comprehensive security headers configuration

## 🧪 Testing

### Development Testing
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type checking
npm run type-check
```

### SEO Testing
```bash
# Test sitemap generation
curl https://puzzlerank.pro/sitemap.xml

# Test robots.txt
curl https://puzzlerank.pro/robots.txt

# Validate structured data
# Use Google's Rich Results Test tool
```

### Performance Testing
- **PageSpeed Insights**: Test Core Web Vitals scores
- **Lighthouse**: Comprehensive performance audit
- **WebPageTest**: Detailed performance analysis
- **GTmetrix**: Performance monitoring and optimization suggestions

## 🔧 Troubleshooting

### 部署到 Vercel 的关键修复

在部署过程中遇到的问题和解决方案：

#### 1. Next.js Webpack 构建错误
**问题**: 出现 "Cannot find module './vendor-chunks/next.js'" 错误
**解决方案**:
```bash
# 清除构建缓存
rm -rf .next
rm -rf node_modules
pnpm install
```

#### 2. SVG 导入 TypeScript 错误
**问题**: word-master 组件中使用 `ReactComponent` 导入 SVG 文件导致 TypeScript 编译失败
**解决方案**:
- 创建 `types/svg.d.ts` 文件添加 SVG 类型声明：
```typescript
declare module '*.svg' {
  import React from 'react';
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}
```
- 更新 `tsconfig.json` 包含 types 目录：
```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  },
  "include": ["types/**/*"]
}
```
- 配置 `next.config.mjs` 支持 SVG：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};
```

#### 3. 缺失依赖问题
**问题**: word-master 组件使用了 react-modal 但未安装依赖
**解决方案**:
```bash
pnpm add react-modal @types/react-modal
```

#### 4. SVG 导入语法修复
**问题**: 使用了不兼容的 `ReactComponent` 导入语法
**解决方案**: 修改 word-master 组件中的 SVG 导入：
```typescript
// 错误的导入方式
import { ReactComponent as BackspaceIcon } from './icons/backspace.svg';

// 正确的导入方式
import BackspaceIcon from './icons/backspace.svg';
```

### 部署检查清单

在部署到 Vercel 之前，请确保：

1. ✅ 所有依赖已正确安装（包括 react-modal）
2. ✅ SVG 类型声明文件已创建 (`types/svg.d.ts`)
3. ✅ Next.js 配置支持 SVG 处理 (`next.config.mjs`)
4. ✅ TypeScript 配置包含 types 目录 (`tsconfig.json`)
5. ✅ 构建缓存已清除 (`.next` 目录)
6. ✅ 环境变量已在 Vercel 中正确配置
7. ✅ 本地构建测试通过：`pnpm build`

### 完整的部署流程

```bash
# 1. 清理环境
rm -rf .next
rm -rf node_modules

# 2. 重新安装依赖
pnpm install

# 3. 本地构建测试
pnpm build

# 4. 本地运行测试
pnpm start

# 5. 推送到 GitHub
git add .
git commit -m "修复部署问题和TypeScript兼容性"
git push origin main

# 6. 在 Vercel 中重新部署
```

### Common Issues

#### Google OAuth Issues
- **Problem**: OAuth redirect errors
- **Solution**: Verify authorized origins in Google Cloud Console
- **Check**: Supabase Site URL configuration matches production domain

#### Performance Issues
- **Problem**: Slow loading times
- **Solution**: Check image optimization, enable caching
- **Monitor**: Web Vitals scores and Core Web Vitals

#### SEO Issues
- **Problem**: Pages not indexing
- **Solution**: Submit sitemap, check robots.txt, verify redirects
- **Monitor**: Google Search Console for crawl errors

#### Database Connection Issues
- **Problem**: Supabase connection failures
- **Solution**: Verify environment variables, check RLS policies
- **Debug**: Enable Supabase debug logging

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

Check browser console for:
- Authentication state changes
- Game state transitions
- Performance metrics
- Error messages and stack traces

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain SEO optimization standards
- Test across multiple devices and browsers
- Ensure accessibility compliance
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@puzzlerank.pro
- **Issues**: [GitHub Issues](https://github.com/tianwen8/puzzlerank.pro/issues)
- **Documentation**: This README and inline code comments

## 🎯 Future Enhancements

- **Additional Puzzle Games**: Sudoku, crosswords, logic puzzles
- **Tournament System**: Competitive events and challenges
- **Advanced Analytics**: Detailed gameplay analytics and insights
- **Mobile App**: React Native mobile application
- **AI Opponents**: Computer opponents with adaptive difficulty
- **Social Features**: Friend challenges, sharing, and social leaderboards
- **Internationalization**: Multi-language support for global users
- **Premium Features**: Advanced statistics, custom themes, ad-free experience

## 📝 Changelog

### v2.0.0 (2025-01-15) - SEO & Performance Optimization
- 🚀 **MAJOR**: Complete SEO optimization implementation
- ✅ **Added**: Comprehensive 404 redirect system (20 dead links fixed)
- ✅ **Added**: Optimized sitemap.xml with only indexed pages
- ✅ **Added**: Enhanced robots.txt with proper crawler directives
- ✅ **Added**: Structured data markup (JSON-LD) for all pages
- ✅ **Added**: Web Vitals monitoring with Google Analytics integration
- ✅ **Added**: Critical CSS inlining for improved LCP performance
- ✅ **Added**: Image preloading and optimization
- ✅ **Enhanced**: All pages with 300+ words of SEO content
- ✅ **Enhanced**: Internal linking structure for better crawlability
- ✅ **Fixed**: Navigation game switching functionality
- ✅ **Improved**: Mobile performance and Core Web Vitals scores
- 📊 **Target**: LCP < 2.5s, 404 errors < 5%, PageSpeed score ≥ 90

### v1.5.0 (2025-01-12) - Multi-Game Platform
- 🎮 **Added**: Word practice games with unlimited play
- 🎮 **Added**: Brain games collection
- 🏆 **Enhanced**: Multi-game ranking system
- 📊 **Added**: Game-specific statistics and leaderboards
- 🎨 **Improved**: Responsive design and mobile optimization
- 🔧 **Added**: Multi-game context and state management

### v1.2.0 (2025-01-10) - Authentication & Database
- 🔥 **Fixed**: Google OAuth login data synchronization
- ✅ **Enhanced**: User statistics creation with retry mechanism
- ✅ **Improved**: Database schema with RLS policies
- ✅ **Added**: Comprehensive error handling and logging

### v1.0.0 (2025-01-08) - Initial Release
- 🎉 **Initial Release**: Core puzzle games platform
- ✅ **Added**: 2048 game with smooth animations
- ✅ **Added**: User authentication and registration
- ✅ **Added**: Basic statistics tracking and leaderboards
- ✅ **Added**: Strategy guides and documentation

---

**Built with ❤️ by PuzzleRank Team**

**Repository**: [https://github.com/tianwen8/puzzlerank.pro](https://github.com/tianwen8/puzzlerank.pro)

**Last Updated**: January 15, 2025 (SEO Optimization Release)