import { NextRequest, NextResponse } from 'next/server'
import { getWordleScheduler } from '@/lib/wordle-scheduler'

// Vercel Cron任务入口点
export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Vercel Cron触发自动采集任务')
    
    // 验证请求来源（Vercel Cron会带有特殊的header）
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.log('❌ 未授权的cron请求', { authHeader, expected: `Bearer ${cronSecret}` })
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ CRON_SECRET 未设置，跳过认证检查')
    }
    
    // 获取调度器实例
    const scheduler = getWordleScheduler()
    
    // 执行每日采集任务
    const result = await scheduler.runDailyCollection()
    
    console.log('✅ Cron任务执行完成:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Cron任务执行完成',
      result: result
    })
    
  } catch (error) {
    console.error('❌ Cron任务执行失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// POST方法用于手动触发
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 手动触发自动采集任务')
    
    const scheduler = getWordleScheduler()
    const result = await scheduler.runDailyCollection()
    
    return NextResponse.json({
      success: true,
      message: '手动采集任务执行完成',
      result: result
    })
    
  } catch (error) {
    console.error('❌ 手动采集任务失败:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}