# 🤖 Wordle自动化预测验证系统使用指南

## 📋 系统概述

这是一个完全自动化的Wordle答案采集和验证系统，能够：
- 🕷️ **自动采集** - 从多个权威网站采集每日Wordle答案
- 🔍 **智能验证** - 多源对比验证，确保答案准确性
- ⏰ **定时运行** - 每日自动采集，每小时验证更新
- 📊 **实时数据** - 用户看到最新的验证结果
- 🛡️ **系统保护** - 不影响现有的游戏功能和排行榜

## 🚀 快速开始

### 1. 数据库初始化

首先运行数据库迁移脚本：
```bash
# 应用数据库迁移
supabase db push

# 或者手动执行SQL文件
psql -f supabase/migrations/002_create_wordle_prediction_system.sql
```

### 2. 环境变量配置

确保以下环境变量已配置：
```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 启动自动化系统

```bash
# 运行初始化脚本
npm run tsx scripts/init-wordle-automation.ts

# 或者通过API启动
curl -X POST http://localhost:3000/api/wordle/auto \
  -H "Content-Type: application/json" \
  -d '{"action": "start-scheduler"}'
```

## 🎛️ 管理面板

访问管理面板：`http://localhost:3000/admin/wordle-automation`

### 功能模块：

#### 📊 **控制面板**
- 调度器启动/停止
- 手动执行采集任务
- 系统状态监控

#### 📝 **任务历史**
- 查看最近执行的任务
- 任务成功率统计
- 执行时间分析

#### 💾 **数据管理**
- 数据库操作
- 数据导出功能
- 清理无效数据

#### ⚙️ **系统设置**
- 验证阈值配置
- 调度时间设置
- 验证源管理

## 🔌 API接口

### GET 接口

#### 获取今日预测
```bash
GET /api/wordle/auto?type=today
```

#### 获取历史数据
```bash
GET /api/wordle/auto?type=history&limit=20
```

#### 获取候选预测
```bash
GET /api/wordle/auto?type=candidates&limit=10
```

#### 获取系统统计
```bash
GET /api/wordle/auto?type=stats
```

#### 获取调度器状态
```bash
GET /api/wordle/auto?type=scheduler-status
```

### POST 接口

#### 执行每日采集
```bash
POST /api/wordle/auto
Content-Type: application/json

{
  "action": "run-daily-collection"
}
```

#### 执行验证任务
```bash
POST /api/wordle/auto
Content-Type: application/json

{
  "action": "run-hourly-verification"
}
```

#### 历史数据回填
```bash
POST /api/wordle/auto
Content-Type: application/json

{
  "action": "run-historical-backfill",
  "params": {
    "startGameNumber": 1500,
    "endGameNumber": 1510
  }
}
```

#### 验证特定游戏
```bash
POST /api/wordle/auto
Content-Type: application/json

{
  "action": "verify-specific-game",
  "params": {
    "gameNumber": 1509
  }
}
```

## 🕐 自动化调度

### 默认调度规则：

- **每日 00:01** - 自动采集今日答案
- **每小时整点** - 验证答案准确性
- **实时更新** - 用户访问时获取最新数据

### 验证流程：

1. **多源采集** - 从Tom's Guide、TechRadar等网站采集
2. **一致性检查** - 对比不同来源的答案
3. **置信度计算** - 基于来源权重和一致性
4. **状态更新** - 达到阈值自动标记为"已验证"

## 📊 数据库结构

### 核心表：

#### `wordle_predictions` - 预测数据表
```sql
- id: 主键
- game_number: 游戏编号
- date: 日期
- predicted_word: 预测答案
- verified_word: 验证答案
- status: 状态 (candidate/verified/rejected)
- confidence_score: 置信度 (0-1)
- verification_sources: 验证来源 (JSON数组)
- hints: 提示信息 (JSON对象)
```

#### `verification_sources` - 验证源配置表
```sql
- id: 主键
- name: 来源名称
- base_url: 基础URL
- selector_config: 选择器配置 (JSON)
- weight: 权重 (0-1)
- is_active: 是否启用
```

#### `collection_logs` - 采集日志表
```sql
- id: 主键
- game_number: 游戏编号
- source_name: 来源名称
- collected_word: 采集到的答案
- status: 状态 (success/failed/timeout)
- response_time: 响应时间
- error_message: 错误信息
```

## 🔧 故障排除

### 常见问题：

#### 1. 数据库连接失败
```bash
# 检查环境变量
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 测试连接
curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/wordle_predictions?select=*&limit=1"
```

#### 2. 采集失败
- 检查网络连接
- 验证目标网站是否可访问
- 查看采集日志表中的错误信息

#### 3. 调度器未启动
```bash
# 通过API检查状态
curl http://localhost:3000/api/wordle/auto?type=scheduler-status

# 手动启动
curl -X POST http://localhost:3000/api/wordle/auto \
     -H "Content-Type: application/json" \
     -d '{"action": "start-scheduler"}'
```

#### 4. 验证源配置错误
- 检查 `verification_sources` 表中的配置
- 测试选择器是否正确
- 更新权重和状态

### 日志查看：

```bash
# 查看采集日志
SELECT * FROM collection_logs 
ORDER BY created_at DESC 
LIMIT 10;

# 查看预测状态
SELECT game_number, date, status, confidence_score 
FROM wordle_predictions 
ORDER BY date DESC 
LIMIT 10;
```

## 🔄 系统维护

### 定期维护任务：

#### 1. 清理旧日志
```sql
DELETE FROM collection_logs 
WHERE created_at < NOW() - INTERVAL '30 days';
```

#### 2. 更新验证源权重
```sql
UPDATE verification_sources 
SET weight = 0.9, success_rate = 0.95 
WHERE name = 'tomsguide';
```

#### 3. 备份重要数据
```bash
pg_dump -t wordle_predictions > wordle_backup.sql
```

## 📈 性能优化

### 建议配置：

1. **数据库索引** - 已自动创建必要索引
2. **缓存策略** - API响应缓存1小时
3. **并发控制** - 限制同时采集的源数量
4. **错误重试** - 最多重试3次，间隔5秒

### 监控指标：

- 验证成功率 > 85%
- 平均响应时间 < 5秒
- 每日采集成功率 > 90%
- 数据库查询时间 < 100ms

## 🛡️ 安全考虑

1. **API访问控制** - 管理面板需要认证
2. **数据验证** - 输入参数严格验证
3. **错误处理** - 不暴露敏感信息
4. **访问频率限制** - 防止过度请求目标网站

## 📞 技术支持

如遇到问题，请：

1. 查看管理面板中的任务历史
2. 检查数据库日志表
3. 确认系统配置正确
4. 联系技术团队获取支持

---

**系统版本**: v1.0.0  
**最后更新**: 2025年8月6日  
**维护团队**: PuzzleRank开发团队