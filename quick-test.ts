#!/usr/bin/env tsx
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { getWordleCollector } from './lib/wordle-collector'

async function quickTest() {
  const collector = getWordleCollector()
  const results = await collector.collectTodayAnswer(1511)
  
  console.log('采集结果:')
  results.forEach(r => {
    if (r.success) {
      console.log(`✅ ${r.source}: ${r.word}`)
    } else {
      console.log(`❌ ${r.source}: 失败`)
    }
  })
}

quickTest()