#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getWordleCollectorImproved } from './lib/wordle-collector-improved'

async function testImprovedCollector() {
  console.log('🚀 测试改进版本的Wordle采集器...')
  
  const collector = getWordleCollectorImproved()
  
  try {
    // 测试采集今日答案
    const results = await collector.collectTodayAnswer(1511)
    
    console.log('\n📊 采集结果汇总:')
    results.forEach(result => {
      if (result.success) {
        console.log(`  ✅ ${result.source}: ${result.word} (${result.responseTime}ms)`)
      } else {
        console.log(`  ❌ ${result.source}: ${result.error} (${result.responseTime}ms)`)
      }
    })
    
    // 统计成功率
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    console.log(`\n📈 成功率: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`)
    
    // 显示采集到的答案
    const answers = results.filter(r => r.success && r.word).map(r => r.word)
    const uniqueAnswers = [...new Set(answers)]
    
    if (uniqueAnswers.length > 0) {
      console.log(`\n🎯 采集到的答案: ${uniqueAnswers.join(', ')}`)
      
      if (uniqueAnswers.length === 1) {
        console.log(`✅ 所有源一致，答案为: ${uniqueAnswers[0]}`)
      } else {
        console.log(`⚠️ 答案不一致，需要进一步验证`)
      }
    } else {
      console.log(`\n❌ 未采集到任何答案`)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

testImprovedCollector()