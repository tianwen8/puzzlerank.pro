#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testExtraction() {
  console.log('🧪 测试改进的提取逻辑...')
  
  // 测试Tom's Guide
  console.log('\n📰 测试 Tom\'s Guide:')
  try {
    const response = await fetch('https://www.tomsguide.com/news/what-is-todays-wordle-answer', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const html = await response.text()
    
    // 更精确的模式
    const patterns = [
      /Drumroll[^a-zA-Z]*please[^a-zA-Z]*[—–-][^a-zA-Z]*it's[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      /Drumroll[^a-zA-Z]*please[^a-zA-Z]*[—–-][^a-zA-Z]*it's[^a-zA-Z]*([A-Z]{5})\./i,
      /it's[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
    ]
    
    let found = false
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        console.log(`✅ 找到答案: ${match[1]}`)
        found = true
        break
      }
    }
    
    if (!found) {
      console.log('❌ 未找到答案')
      // 显示包含"IMBUE"的上下文
      const imbueMatch = html.match(/.{0,100}IMBUE.{0,100}/gi)
      if (imbueMatch) {
        console.log('包含IMBUE的上下文:', imbueMatch[0])
      }
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`)
  }
  
  // 测试TechRadar
  console.log('\n📰 测试 TechRadar:')
  try {
    const response = await fetch('https://www.techradar.com/news/wordle-today', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const html = await response.text()
    
    // 更精确的模式
    const patterns = [
      /Today's\s*Wordle\s*answer[^a-zA-Z]*game[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      /Today's\s*Wordle\s*answer[^a-zA-Z]*game[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})\./i,
      /answer[^a-zA-Z]*game[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
    ]
    
    let found = false
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        console.log(`✅ 找到答案: ${match[1]}`)
        found = true
        break
      }
    }
    
    if (!found) {
      console.log('❌ 未找到答案')
      // 显示包含"IMBUE"的上下文
      const imbueMatch = html.match(/.{0,100}IMBUE.{0,100}/gi)
      if (imbueMatch) {
        console.log('包含IMBUE的上下文:', imbueMatch[0])
      }
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`)
  }
  
  // 测试Word.tips
  console.log('\n📰 测试 Word.tips:')
  try {
    const response = await fetch('https://word.tips/todays-wordle-answer/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const html = await response.text()
    
    // 查找可能的答案模式
    const patterns = [
      /The\s*answer\s*for\s*today's\s*Wordle[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
      /answer[^a-zA-Z]*for[^a-zA-Z]*today's[^a-zA-Z]*Wordle[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
      /Wordle[^a-zA-Z]*#\d+[^a-zA-Z]*answer[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
    ]
    
    let found = false
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        console.log(`✅ 找到答案: ${match[1]}`)
        found = true
        break
      }
    }
    
    if (!found) {
      console.log('⚠️ 答案可能是隐藏的，需要JavaScript交互')
      // 显示包含"IMBUE"的上下文
      const imbueMatch = html.match(/.{0,100}IMBUE.{0,100}/gi)
      if (imbueMatch) {
        console.log('包含IMBUE的上下文:', imbueMatch[0])
      }
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`)
  }
}

testExtraction()