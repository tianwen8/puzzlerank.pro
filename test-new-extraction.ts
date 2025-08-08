#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testExtraction() {
  console.log('🧪 测试新的提取逻辑...')
  
  // 测试Tom's Guide
  console.log('\n📰 测试 Tom\'s Guide:')
  try {
    const response = await fetch('https://www.tomsguide.com/news/what-is-todays-wordle-answer', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const html = await response.text()
    
    const patterns = [
      /Drumroll[^a-zA-Z]*please[^a-zA-Z]*[—–-][^a-zA-Z]*it's[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      /Drumroll[^a-zA-Z]*please[^a-zA-Z]*[—–-][^a-zA-Z]*it's[^a-zA-Z]*([A-Z]{5})\./i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        console.log(`✅ 找到答案: ${match[1]}`)
        break
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
    
    const patterns = [
      /Today's\s*Wordle\s*answer[^a-zA-Z]*game[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        console.log(`✅ 找到答案: ${match[1]}`)
        break
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
      /The\s*answer\s*for\s*today's\s*Wordle\s*on[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
      /answer[^a-zA-Z]*for[^a-zA-Z]*today's[^a-zA-Z]*Wordle[^a-zA-Z]*on[^a-zA-Z]*\w+[^a-zA-Z]*\d+[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i
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
      // 查找页面中是否有其他线索
      const allWords = html.match(/\b[A-Z]{5}\b/gi) || []
      const uniqueWords = [...new Set(allWords.map(w => w.toUpperCase()))]
      console.log(`页面中的5字母单词: ${uniqueWords.slice(0, 10).join(', ')}...`)
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`)
  }
}

testExtraction()