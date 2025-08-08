#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// 修复后的提取逻辑
function extractFromTomsGuide(html: string): string | null {
  const patterns = [
    // 精确匹配 "Drumroll please &mdash; it's <strong>IMBUE.</strong>"
    /Drumroll\s*please\s*&mdash;\s*it's\s*<strong>([A-Z]{5})\.<\/strong>/i,
    /Drumroll\s*please\s*—\s*it's\s*<strong>([A-Z]{5})\.<\/strong>/i,
    /it's\s*<strong>([A-Z]{5})\.<\/strong>/i,
  ]
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && isValidWordleWord(match[1])) {
      console.log(`Found answer using Tom's Guide pattern: ${match[1]}`)
      return match[1].toUpperCase()
    }
  }
  
  return null
}

function extractFromTechRadar(html: string): string | null {
  const patterns = [
    // 匹配 "Today's Wordle answer (game #1511) is&hellip; <strong>IMBUE</strong>."
    /Today's\s*Wordle\s*answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is&hellip;\s*<strong>([A-Z]{5})<\/strong>/i,
    /answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is&hellip;\s*<strong>([A-Z]{5})<\/strong>/i,
    /game\s*#\d+[^a-zA-Z]*is&hellip;\s*<strong>([A-Z]{5})<\/strong>/i,
  ]
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && isValidWordleWord(match[1])) {
      console.log(`Found answer using TechRadar pattern: ${match[1]}`)
      return match[1].toUpperCase()
    }
  }
  
  return null
}

function extractFromWordTips(html: string): string | null {
  const patterns = [
    // 从JavaScript数据中提取 answer:"IMBUE"
    /answer:"([A-Z]{5})"/i,
    /"answer"\s*:\s*"([A-Z]{5})"/i,
    /solutions:\[{[^}]*answer:"([A-Z]{5})"/i,
  ]
  
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && isValidWordleWord(match[1])) {
      console.log(`Found answer using Word.tips pattern: ${match[1]}`)
      return match[1].toUpperCase()
    }
  }
  
  return null
}

function isValidWordleWord(word: string): boolean {
  if (!word || word.length !== 5) return false
  if (!/^[A-Z]+$/.test(word)) return false
  
  const excludeWords = ['TODAY', 'WORDLE', 'ANSWER', 'GUESS', 'HINTS', 'CLUES', 'HELLI']
  if (excludeWords.includes(word)) return false
  
  return true
}

async function testFixedExtraction() {
  console.log('🎯 测试修复后的提取逻辑...')
  
  const sources = [
    { name: 'tomsguide', url: 'https://www.tomsguide.com/news/what-is-todays-wordle-answer', extractor: extractFromTomsGuide },
    { name: 'techradar', url: 'https://www.techradar.com/news/wordle-today', extractor: extractFromTechRadar },
    { name: 'wordtips', url: 'https://word.tips/todays-wordle-answer/', extractor: extractFromWordTips }
  ]
  
  const results = []
  
  for (const source of sources) {
    console.log(`\n📰 测试 ${source.name}:`)
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (!response.ok) {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`)
        results.push({ source: source.name, success: false, error: `HTTP ${response.status}` })
        continue
      }
      
      const html = await response.text()
      const word = source.extractor(html)
      
      if (word) {
        console.log(`✅ ${source.name}: ${word}`)
        results.push({ source: source.name, success: true, word })
      } else {
        console.log(`❌ ${source.name}: 未找到答案`)
        results.push({ source: source.name, success: false, error: '未找到答案' })
      }
      
    } catch (error) {
      console.log(`❌ ${source.name}: ${error.message}`)
      results.push({ source: source.name, success: false, error: error.message })
    }
  }
  
  // 汇总结果
  console.log('\n📊 最终结果汇总:')
  const successResults = results.filter(r => r.success)
  const answers = successResults.map(r => r.word)
  const uniqueAnswers = [...new Set(answers)]
  
  console.log(`成功率: ${successResults.length}/${results.length}`)
  
  if (uniqueAnswers.length > 0) {
    console.log(`采集到的答案: ${uniqueAnswers.join(', ')}`)
    
    if (uniqueAnswers.length === 1) {
      console.log(`🎉 所有源一致，今日答案为: ${uniqueAnswers[0]}`)
    } else {
      console.log(`⚠️ 答案不一致，需要进一步验证`)
    }
  } else {
    console.log(`❌ 未采集到任何答案`)
  }
}

testFixedExtraction()