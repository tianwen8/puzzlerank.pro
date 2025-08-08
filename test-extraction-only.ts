#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// 模拟改进的提取逻辑
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
    // 匹配 "Today's Wordle answer (game #1511) is… <strong>IMBUE</strong>."
    /Today's\s*Wordle\s*answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
    /answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
    /game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
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

async function testExtractionOnly() {
  console.log('🧪 测试纯提取逻辑...')
  
  const sources = [
    { name: 'tomsguide', url: 'https://www.tomsguide.com/news/what-is-todays-wordle-answer', extractor: extractFromTomsGuide },
    { name: 'techradar', url: 'https://www.techradar.com/news/wordle-today', extractor: extractFromTechRadar },
    { name: 'wordtips', url: 'https://word.tips/todays-wordle-answer/', extractor: extractFromWordTips }
  ]
  
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
        continue
      }
      
      const html = await response.text()
      const word = source.extractor(html)
      
      if (word) {
        console.log(`✅ ${source.name}: ${word}`)
      } else {
        console.log(`❌ ${source.name}: 未找到答案`)
        
        // 显示包含IMBUE的上下文（如果有）
        const imbueMatch = html.match(/.{0,100}IMBUE.{0,100}/gi)
        if (imbueMatch) {
          console.log(`💡 包含IMBUE的上下文: ${imbueMatch[0]}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ ${source.name}: ${error.message}`)
    }
  }
}

testExtractionOnly()