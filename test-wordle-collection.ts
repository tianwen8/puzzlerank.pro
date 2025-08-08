#!/usr/bin/env tsx
import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getWordleCollector } from './lib/wordle-collector'
import { getWordleVerifier } from './lib/wordle-verifier'

async function testCollection() {
  console.log('🧪 测试Wordle采集功能...')
  
  try {
    // 测试采集今日答案 (Wordle #1511)
    const collector = getWordleCollector()
    const results = await collector.collectTodayAnswer(1511)
    
    console.log('\n📊 采集结果:')
    results.forEach(result => {
      console.log(`  ${result.source}: ${result.success ? '✅' : '❌'} ${result.word || result.error} (${result.responseTime}ms)`)
    })
    
    // 测试验证逻辑
    console.log('\n🔍 测试验证逻辑...')
    const verifier = getWordleVerifier()
    const verificationResult = await verifier.verifyTodayAnswer(1511)
    
    console.log('\n📋 验证结果:')
    console.log(`  共识答案: ${verificationResult.consensusWord || '未找到'}`)
    console.log(`  置信度: ${Math.round(verificationResult.confidence * 100)}%`)
    console.log(`  状态: ${verificationResult.status}`)
    console.log(`  成功源数量: ${verificationResult.sources.filter(s => s.success).length}/${verificationResult.sources.length}`)
    
    verificationResult.sources.forEach(source => {
      console.log(`    ${source.name}: ${source.success ? '✅' : '❌'} ${source.word || '失败'} (权重: ${source.weight})`)
    })
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

testCollection()