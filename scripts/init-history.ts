#!/usr/bin/env tsx
import dotenv from 'dotenv'
import path from 'path'

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getSupabaseWordleDB } from '../lib/supabase/wordle-client'

async function initHistory() {
  console.log('🚀 开始初始化历史数据...')
  
  try {
    const db = getSupabaseWordleDB()
    await db.initializeHistoricalData()
    console.log('✅ 历史数据初始化完成')
  } catch (error) {
    console.error('❌ 历史数据初始化失败:', error)
  }
}

initHistory()