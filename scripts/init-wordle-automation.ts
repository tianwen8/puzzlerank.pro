#!/usr/bin/env tsx
/**
 * Wordle自动化系统初始化脚本
 * 用于首次启动系统时的数据库初始化和基础数据填充
 */

// 加载环境变量
import dotenv from 'dotenv'
import path from 'path'

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { WordlePredictionDB } from '../lib/database/wordle-prediction-db'
import { wordleScheduler } from '../lib/wordle-scheduler'
import { getWordleScheduler } from '../lib/wordle-scheduler'
import { getWordleVerifier } from '../lib/wordle-verifier'

async function initializeSystem() {
  console.log('🚀 开始初始化Wordle自动化系统...')
  
  try {
    // 1. 检查数据库连接
    console.log('📊 检查数据库连接...')
    const stats = await WordlePredictionDB.getStats()
    console.log('✅ 数据库连接正常', stats)
    
    // 2. 检查验证源配置
    console.log('🔍 检查验证源配置...')
    const sources = await WordlePredictionDB.getVerificationSources()
    console.log(`✅ 找到 ${sources.length} 个验证源:`, sources.map(s => s.name))
    
    // 3. 获取当前游戏编号
    const currentGameNumber = getCurrentGameNumber()
    console.log(`🎮 当前游戏编号: #${currentGameNumber}`)
    
    // 4. 检查今日预测是否存在
    console.log('📅 检查今日预测...')
    const todayPrediction = await WordlePredictionDB.getTodayPrediction()
    
    if (!todayPrediction) {
      console.log('⚠️ 今日预测不存在，开始创建...')
      
      // 执行今日验证
      // 执行今日验证
      const verifier = getWordleVerifier()
      const result = await verifier.verifyTodayAnswer(currentGameNumber)
      const updated = await verifier.updatePredictionInDatabase(result)
      
      if (updated) {
        console.log(`✅ 今日预测创建成功: ${result.consensusWord} (${result.status})`)
      } else {
        console.log('❌ 今日预测创建失败')
      }
    } else {
      console.log(`✅ 今日预测已存在: #${todayPrediction.game_number} ${todayPrediction.verified_word || todayPrediction.predicted_word} (${todayPrediction.status})`)
    }
    
    // 5. 检查历史数据
    console.log('📚 检查历史数据...')
    const historyCount = (await WordlePredictionDB.getHistoryPredictions(100)).length
    console.log(`📊 历史验证数据: ${historyCount} 条`)
    
    if (historyCount < 10) {
      console.log('⚠️ 历史数据较少，建议执行历史回填')
      console.log('💡 可以通过管理面板或API执行历史回填任务')
    }
    
    // 6. 启动调度器
    // 6. 启动调度器
    console.log('⏰ 启动调度器...')
    const scheduler = getWordleScheduler()
    await scheduler.startScheduler()
    
    const status = scheduler.getStatus()
    console.log('✅ 调度器启动成功:', {
      isRunning: status.isRunning,
      currentGameNumber: status.currentGameNumber,
      totalTasks: status.totalTasks
    })
    
    // 7. 显示系统信息
    console.log('\n🎉 系统初始化完成!')
    console.log('📋 系统信息:')
    console.log(`   - 数据库状态: 正常`)
    console.log(`   - 验证源数量: ${sources.length}`)
    console.log(`   - 当前游戏: #${currentGameNumber}`)
    console.log(`   - 历史数据: ${historyCount} 条`)
    console.log(`   - 调度器状态: ${status.isRunning ? '运行中' : '已停止'}`)
    console.log(`   - 管理面板: http://localhost:3000/admin/wordle-automation`)
    
    console.log('\n🔄 自动化任务:')
    console.log('   - 每日 00:01: 自动采集今日答案')
    console.log('   - 每小时: 验证答案准确性')
    console.log('   - 实时更新: 用户看到最新验证结果')
    
  } catch (error) {
    console.error('❌ 系统初始化失败:', error)
    process.exit(1)
  }
}

// 获取当前游戏编号
function getCurrentGameNumber(): number {
  // 手动校正：2025-08-06 应该是 #1509 (GROAN)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  if (todayStr === '2025-08-06') {
    return 1509
  }
  
  // 基于 2025-08-06 = #1509 计算其他日期
  const baseDate = new Date('2025-08-06')
  const baseGameNumber = 1509
  const daysDiff = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return baseGameNumber + daysDiff
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeSystem().catch(console.error)
}

export { initializeSystem }