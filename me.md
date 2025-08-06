完整的整合方案
📋 核心设计思路
多游戏架构：将当前的单一游戏项目改造成多游戏平台
统一的数据层：扩展 Supabase 数据库支持多个游戏类型
共享的 UI 组件：复用现有的认证、统计、排行榜组件
游戏切换机制：通过导航栏切换不同游戏
Wordle 作为默认首页：符合您的要求
🗄️ 数据库设计
1. 扩展现有表结构
-- 添加游戏类型枚举
CREATE TYPE game_type AS ENUM ('2048', 'wordle');

-- 扩展 game_sessions 表
ALTER TABLE game_sessions 
ADD COLUMN game_type game_type DEFAULT '2048',
ADD COLUMN game_data JSONB; -- 存储游戏特定数据

-- 扩展 player_stats 表
ALTER TABLE player_stats 
ADD COLUMN wordle_games_played INTEGER DEFAULT 0,
ADD COLUMN wordle_games_won INTEGER DEFAULT 0,
ADD COLUMN wordle_current_streak INTEGER DEFAULT 0,
ADD COLUMN wordle_best_streak INTEGER DEFAULT 0,
ADD COLUMN wordle_average_guesses DECIMAL(3,1) DEFAULT 0.0;
2. Wordle 游戏数据结构
interface WordleGameData {
  answer: string;
  guesses: string[];
  currentRow: number;
  isWon: boolean;
  guessCount: number;
  difficulty: 'easy' | 'normal' | 'hard';
}
🎮 游戏架构重构
1. 创建通用游戏上下文
// contexts/multi-game-context.tsx
interface MultiGameContextType {
  currentGame: 'wordle' | '2048';
  setCurrentGame: (game: 'wordle' | '2048') => void;
  wordleState: WordleGameState;
  game2048State: Game2048State;
  // ... 其他共享状态
}
2. 游戏组件结构
components/
├── games/
│   ├── wordle/
│   │   ├── wordle-board.tsx
│   │   ├── wordle-keyboard.tsx
│   │   ├── wordle-game-controls.tsx
│   │   └── wordle-end-modal.tsx
│   └── 2048/
│       ├── game-board.tsx (现有)
│       ├── game-controls.tsx (现有)
│       └── ...
├── shared/
│   ├── game-stats.tsx (统一的统计组件)
│   ├── game-leaderboard.tsx (支持多游戏)
│   └── game-navigation.tsx (游戏切换)
└── ...
🎨 UI 设计统一
1. 保持 word-master 的 UI 风格
色彩方案：使用 word-master 的配色（绿色、黄色、灰色）
布局：保持三栏布局（左侧统计、中间游戏、右侧排行榜）
动画：复用现有的平滑过渡效果
2. 统一的数据显示组件
// components/shared/game-stats.tsx
interface GameStatsProps {
  gameType: 'wordle' | '2048';
  playerStats: PlayerStats;
  currentGameStats: CurrentGameStats;
}
🔧 实现步骤
第一阶段：数据库和核心架构
扩展数据库表结构
创建 Wordle 游戏逻辑
重构游戏上下文管理
第二阶段：Wordle 游戏实现
移植 word-master 核心逻辑
适配 Supabase 数据存储
实现三个难度级别
添加无限模式和练习模式
第三阶段：UI 整合
统一设计系统
实现游戏切换导航
统一统计显示
实现多游戏排行榜
第四阶段：功能增强
添加游戏特定统计
实现跨游戏成就系统
优化性能和体验
🎯 Wordle 游戏特色功能
1. 相比原版的增强
无限模式：每日可以玩无限次
练习模式：不计入统计的练习
三个难度：Easy(任意5字母)、Normal(有效单词)、Hard(必须使用提示)
实时统计：连胜记录、平均猜测次数
全球排行榜：基于连胜和平均猜测次数
2. 统计维度
连胜记录：当前连胜 vs 最佳连胜
平均猜测次数：整体表现指标
胜率：完成率统计
每日挑战：特殊模式统计
🏆 统一的成就系统
跨游戏成就
多面手：在两个游戏中都达到一定成就
每日玩家：连续登录天数
挑战者：完成特定难度挑战
📱 移动端优化
响应式设计：适配手机和平板
触控优化：完美的触控体验
性能优化：流畅的动画和交互
🤔 我的建议
保持现有架构优势：不破坏现有的认证和数据系统
渐进式集成：先实现核心功能，再逐步完善
用户体验优先：确保游戏切换流畅自然
数据统一性：所有游戏数据都通过统一的接口管理