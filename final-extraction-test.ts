#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testFinalExtraction() {
  console.log('🎯 测试最终提取逻辑...')
  
  // 测试Tom's Guide
  console.log('\n📰 测试 Tom\'s Guide:')
  try {
    const response = await fetch('https://www.tomsguide.com/news/what-is-todays-wordle-answer', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const html = await response.text()
    
    // 处理HTML实体的精确模式
    const patterns = [
      /Drumroll\s*please\s*&mdash;\s*it's\s*<strong>([A-Z]{5})<\/strong>/i,
      /Drumroll\s*please\s*—\s*it's\s*<strong>([A-Z]{5})<\/strong>/i,
      /it's\s*<strong>([A-Z]{5})<\/strong>/i,
    ]
    
    let found = false
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        console.log(`✅ Tom's Guide 答案: ${match[1]}`)
        found = true
        break
      }
    }
    
    if (!found) {
      console.log('❌ Tom\'s Guide 未找到答案')
    }
  } catch (error) {
    console.log(`❌ Tom's Guide 错误: ${error.message}`)
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
    
    // 查找包含IMBUE的上下文来理解结构
    const imbueMatch = html.match(/.{0,200}IMBUE.{0,200}/gi)
    if (imbueMatch) {
      console.log('TechRadar IMBUE上下文:', imbueMatch[0])
      
      // 基于上下文创建精确模式
      const patterns = [
        /Today's\s*Wordle\s*answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
        /answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
        /game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      ]
      
      let found = false
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) {
          console.log(`✅ TechRadar 答案: ${match[1]}`)
          found = true
          break
        }
      }
      
      if (!found) {
        console.log('❌ TechRadar 未找到答案')
      }
    } else {
      console.log('❌ TechRadar 页面中未找到IMBUE')
    }
  } catch (error) {
    console.log(`❌ TechRadar 错误: ${error.message}`)
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
    
    // 从JavaScript数据中提取答案
    const patterns = [
      /answer:"([A-Z]{5})"/i,
      /"answer"\s*:\s*"([A-Z]{5})"/i,
      /solutions:\[{[^}]*answer:"([A-Z]{5})"/i,
    ]
    
    let found = false
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        console.log(`✅ Word.tips 答案: ${match[1]}`)
        found = true
        break
      }
    }
    
    if (!found) {
      console.log('❌ Word.tips 未找到答案')
    }
  } catch (error) {
    console.log(`❌ Word.tips 错误: ${error.message}`)
  }
  
  console.log('\n🎉 测试完成！')
}

testFinalExtraction()