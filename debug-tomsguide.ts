#!/usr/bin/env tsx
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function debugTomsGuide() {
  console.log('🔍 调试Tom\'s Guide页面内容...')
  
  try {
    const url = 'https://www.tomsguide.com/news/what-is-todays-wordle-answer'
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    // 查找所有5字母单词
    console.log('\n📝 页面中的所有5字母单词:')
    const allWords = html.match(/\b[A-Z]{5}\b/gi) || []
    const uniqueWords = [...new Set(allWords.map(w => w.toUpperCase()))]
    console.log(uniqueWords.join(', '))
    
    // 查找包含"answer"的段落
    console.log('\n📄 包含"answer"的文本片段:')
    const answerMatches = html.match(/.{0,100}answer.{0,100}/gi) || []
    answerMatches.slice(0, 5).forEach((match, i) => {
      console.log(`${i + 1}. ${match.trim()}`)
    })
    
    // 查找包含"IMBUE"的文本片段
    console.log('\n🎯 包含"IMBUE"的文本片段:')
    const imbueMatches = html.match(/.{0,100}IMBUE.{0,100}/gi) || []
    imbueMatches.forEach((match, i) => {
      console.log(`${i + 1}. ${match.trim()}`)
    })
    
    // 查找包含"SHOUL"的文本片段
    console.log('\n❓ 包含"SHOUL"的文本片段:')
    const shoulMatches = html.match(/.{0,100}SHOUL.{0,100}/gi) || []
    shoulMatches.forEach((match, i) => {
      console.log(`${i + 1}. ${match.trim()}`)
    })
    
    // 测试我们的正则表达式
    console.log('\n🧪 测试正则表达式匹配:')
    const patterns = [
      /Drumroll,\s*please\s*[—-]\s*it's\s*([A-Z]{5})/i,
      /today's\s*wordle\s*answer.*?is.*?([A-Z]{5})/i,
      /answer.*?for.*?game.*?#\d+.*?is.*?([A-Z]{5})/i,
    ]
    
    patterns.forEach((pattern, i) => {
      const match = html.match(pattern)
      if (match) {
        console.log(`模式 ${i + 1}: ${pattern} -> ${match[1]}`)
        console.log(`上下文: ${match[0]}`)
      } else {
        console.log(`模式 ${i + 1}: ${pattern} -> 无匹配`)
      }
    })
    
  } catch (error) {
    console.error('❌ 调试失败:', error)
  }
}

debugTomsGuide()