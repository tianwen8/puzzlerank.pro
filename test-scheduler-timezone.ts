#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getWordleSchedulerImproved } from './lib/wordle-scheduler-improved'

async function testSchedulerTimezone() {
  console.log('🌍 测试改进版调度器的时区处理...')
  
  const scheduler = getWordleSchedulerImproved()
  
  // 显示当前时区信息
  const now = new Date()
  console.log('\n⏰ 时区信息:')
  console.log(`  本地时间: ${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })} (北京时间)`)
  console.log(`  UTC时间: ${now.toISOString()}`)
  console.log(`  UTC小时: ${now.getUTCHours()}`)
  console.log(`  UTC分钟: ${now.getUTCMinutes()}`)
  
  // 获取调度器状态
  const status = scheduler.getStatus()
  console.log('\n📊 调度器状态:')
  console.log(`  当前游戏编号: #${status.currentGameNumber}`)
  console.log(`  UTC时间: ${status.utcTime}`)
  console.log(`  上次采集日期: ${status.lastCollectionDate || '未采集'}`)
  console.log(`  今日是否需要采集: ${status.shouldCollectToday ? '是' : '否'}`)
  console.log(`  调度器运行状态: ${status.isRunning ? '运行中' : '已停止'}`)
  
  // 计算距离下次采集的时间
  const utcHours = now.getUTCHours()
  const utcMinutes = now.getUTCMinutes()
  
  let nextCollectionTime: string
  if (utcHours === 0 && utcMinutes < 1) {
    const remainingMinutes = 1 - utcMinutes
    nextCollectionTime = `${remainingMinutes}分钟后 (今日)`
  } else if (utcHours < 24) {
    const remainingHours = 24 - utcHours
    const remainingMinutes = 60 - utcMinutes
    nextCollectionTime = `${remainingHours}小时${remainingMinutes}分钟后 (明日UTC 00:01)`
  } else {
    nextCollectionTime = '计算错误'
  }
  
  console.log(`  距离下次自动采集: ${nextCollectionTime}`)
  
  // 显示全球时区对比
  console.log('\n🌏 全球时区对比 (当UTC为00:01时):')
  console.log('  新西兰 (UTC+13): 13:01 ⭐ 最早更新')
  console.log('  澳大利亚悉尼 (UTC+11): 11:01')
  console.log('  日本东京 (UTC+9): 09:01')
  console.log('  中国北京 (UTC+8): 08:01')
  console.log('  美国纽约 (UTC-5): 19:01 (前一天)')
  console.log('  美国洛杉矶 (UTC-8): 16:01 (前一天)')
  
  console.log('\n✅ 优势说明:')
  console.log('  - 使用UTC时间确保全球一致性')
  console.log('  - 在全球最早时区更新后立即采集')
  console.log('  - 比北京时间提前8小时获取答案')
  console.log('  - 自动适应游戏编号变化 (#1511 → #1512...)')
  
  // 测试手动触发采集
  if (status.shouldCollectToday) {
    console.log('\n🎯 检测到今日需要采集，开始测试...')
    try {
      const result = await scheduler.runDailyCollection()
      console.log('📊 采集结果:', result)
    } catch (error) {
      console.log('❌ 采集测试失败:', error.message)
    }
  } else {
    console.log('\n💡 今日已采集或时间未到，跳过测试')
  }
}

testSchedulerTimezone()