import { NextRequest, NextResponse } from 'next/server'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'
import { wordleScheduler } from '@/lib/wordle-scheduler'
import { wordleVerifier } from '@/lib/wordle-verifier'

// GET - 获取自动化系统数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    switch (type) {
      case 'today':
        // 获取今日预测
        const today = await WordlePredictionDB.getTodayPrediction()
        return NextResponse.json({
          success: true,
          data: today
        })
        
      case 'history':
        // 获取历史记录
        const limit = parseInt(searchParams.get('limit') || '20')
        const history = await WordlePredictionDB.getHistoryPredictions(limit)
        return NextResponse.json({
          success: true,
          data: history
        })
        
      case 'candidates':
        // 获取候选预测
        const candidateLimit = parseInt(searchParams.get('limit') || '10')
        const candidates = await WordlePredictionDB.getCandidatePredictions(candidateLimit)
        return NextResponse.json({
          success: true,
          data: candidates
        })
        
      case 'stats':
        // 获取统计信息
        const stats = await WordlePredictionDB.getStats()
        return NextResponse.json({
          success: true,
          data: stats
        })
        
      case 'scheduler-status':
        // 获取调度器状态
        const status = wordleScheduler.getStatus()
        const taskHistory = wordleScheduler.getTaskHistory(5)
        return NextResponse.json({
          success: true,
          data: {
            ...status,
            recentTasks: taskHistory
          }
        })
        
      case 'sources':
        // 获取验证源配置
        const sources = await WordlePredictionDB.getVerificationSources()
        return NextResponse.json({
          success: true,
          data: sources
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: '无效的请求类型'
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器内部错误'
    }, { status: 500 })
  }
}

// POST - 执行自动化任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params = {} } = body
    
    switch (action) {
      case 'run-daily-collection':
        // 手动执行每日采集
        const dailyResult = await wordleScheduler.runDailyCollection()
        return NextResponse.json({
          success: true,
          data: dailyResult
        })
        
      case 'run-hourly-verification':
        // 手动执行每小时验证
        const hourlyResult = await wordleScheduler.runHourlyVerification()
        return NextResponse.json({
          success: true,
          data: hourlyResult
        })
        
      case 'run-historical-backfill':
        // 手动执行历史回填
        const { startGameNumber, endGameNumber } = params
        const backfillResult = await wordleScheduler.runHistoricalBackfill(
          startGameNumber, 
          endGameNumber
        )
        return NextResponse.json({
          success: true,
          data: backfillResult
        })
        
      case 'verify-specific-game':
        // 验证特定游戏
        const { gameNumber } = params
        if (!gameNumber) {
          return NextResponse.json({
            success: false,
            error: '缺少游戏编号参数'
          }, { status: 400 })
        }
        
        const verifyResult = await wordleVerifier.verifyTodayAnswer(gameNumber)
        const updated = await wordleVerifier.updatePredictionInDatabase(verifyResult)
        
        return NextResponse.json({
          success: true,
          data: {
            ...verifyResult,
            databaseUpdated: updated
          }
        })
        
      case 'start-scheduler':
        // 启动调度器
        await wordleScheduler.startScheduler()
        return NextResponse.json({
          success: true,
          message: '调度器已启动'
        })
        
      case 'stop-scheduler':
        // 停止调度器
        wordleScheduler.stopScheduler()
        return NextResponse.json({
          success: true,
          message: '调度器已停止'
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: '无效的操作类型'
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器内部错误'
    }, { status: 500 })
  }
}

// PUT - 更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    switch (type) {
      case 'update-prediction':
        // 手动更新预测
        const { gameNumber, word, status, confidence, sources } = data
        const success = await WordlePredictionDB.updatePredictionStatus(
          gameNumber,
          status,
          word,
          confidence,
          sources
        )
        
        return NextResponse.json({
          success,
          message: success ? '更新成功' : '更新失败'
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: '无效的更新类型'
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '服务器内部错误'
    }, { status: 500 })
  }
}