#!/usr/bin/env tsx
import dotenv from 'dotenv'
import path from 'path'

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { WordlePredictionDB } from '../lib/database/wordle-prediction-db'

async function fixTodayData() {
  console.log('🔧 修复今日数据...')
  
  try {
    // 创建正确的今日预测数据
    const todayPrediction = {
      game_number: 1509,
      date: '2025-08-06',
      predicted_word: 'GROAN',
      verified_word: 'GROAN',
      status: 'verified' as const,
      confidence_score: 1.0,
      verification_sources: ['tomsguide', 'techradar'],
      hints: {
        category: 'Emotions',
        difficulty: 'Medium',
        clues: [
          'Today\'s Wordle answer is GROAN',
          'An expression of pain or displeasure',
          'Starts with "G" and ends with "N"'
        ],
        letterHints: [
          'Starts with "G"',
          'Ends with "N"'
        ]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // 插入或更新今日预测
    const result = await WordlePredictionDB.upsertPrediction(todayPrediction)
    
    if (result) {
      console.log('✅ 今日数据修复成功: #1509 GROAN')
    } else {
      console.log('❌ 今日数据修复失败')
    }

    // 检查结果
    const todayData = await WordlePredictionDB.getTodayPrediction()
    console.log('📊 当前今日数据:', todayData)

  } catch (error) {
    console.error('❌ 修复失败:', error)
  }
}

fixTodayData()