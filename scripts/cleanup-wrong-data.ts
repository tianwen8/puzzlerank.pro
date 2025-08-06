#!/usr/bin/env tsx
import dotenv from 'dotenv'
import path from 'path'

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { getSupabaseClient } from '../lib/database/wordle-prediction-db'

async function cleanupWrongData() {
  console.log('🧹 清理错误数据...')
  
  try {
    const supabase = getSupabaseClient()
    
    // 删除错误的 #1510 数据
    const { error } = await supabase
      .from('wordle_predictions')
      .delete()
      .eq('game_number', 1510)
    
    if (error) {
      console.error('删除错误数据失败:', error)
    } else {
      console.log('✅ 成功删除错误的 #1510 数据')
    }
    
    // 检查当前数据
    const { data: allData } = await supabase
      .from('wordle_predictions')
      .select('*')
      .eq('date', '2025-08-06')
    
    console.log('📊 当前今日数据:', allData)
    
  } catch (error) {
    console.error('❌ 清理失败:', error)
  }
}

cleanupWrongData()