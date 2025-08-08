import { getWordleVerifier } from './wordle-verifier'
import { WordlePredictionDB } from './database/wordle-prediction-db'

// 调度任务类型
type ScheduleTask = 'daily_collection' | 'hourly_verification' | 'historical_backfill'

// 任务执行结果
interface TaskResult {
  task: ScheduleTask
  success: boolean
  gameNumber?: number
  message: string
  executionTime: number
  timestamp: string
}

// Wordle调度器
export class WordleScheduler {
  private isRunning = false
  private taskHistory: TaskResult[] = []
  
  // 获取当前游戏编号（基于UTC时间）
  private getCurrentGameNumber(): number {
    // 手动校正：2025-08-08 应该是 #1511 (IMBUE)
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    if (todayStr === '2025-08-08') {
      return 1511
    }
    
    // 基于 2025-08-08 = #1511 计算其他日期
    const baseDate = new Date('2025-08-08')
    const baseGameNumber = 1511
    const daysDiff = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return baseGameNumber + daysDiff
  }
  
  // 每日采集任务（每天 00:01 执行）
  async runDailyCollection(): Promise<TaskResult> {
    const startTime = Date.now()
    const gameNumber = this.getCurrentGameNumber()
    
    console.log(`🕐 开始执行每日采集任务 - Wordle #${gameNumber}`)
    
    try {
      // 检查今日是否已有记录
      const existing = await WordlePredictionDB.getTodayPrediction()
      
      if (existing && existing.status === 'verified') {
        return {
          task: 'daily_collection',
          success: true,
          gameNumber,
          message: '今日答案已验证，跳过采集',
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }
      
      // 执行验证（带重试机制）
      const result = await this.executeWithRetry(
        () => getWordleVerifier().verifyTodayAnswer(gameNumber),
        3, // 最多重试3次
        30000 // 每次重试间隔30秒
      )
      
      // 更新数据库
      const updated = await getWordleVerifier().updatePredictionInDatabase(result)
      
      if (!updated) {
        throw new Error('更新数据库失败')
      }
      
      const taskResult: TaskResult = {
        task: 'daily_collection',
        success: true,
        gameNumber,
        message: `采集完成: ${result.consensusWord || '未找到'} (${result.status}, ${Math.round(result.confidence * 100)}%)`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      this.taskHistory.push(taskResult)
      console.log(`✅ 每日采集任务完成:`, taskResult.message)
      
      return taskResult
      
    } catch (error) {
      console.error(`❌ 每日采集任务失败:`, error)
      
      // 采集失败时的容错处理
      await this.handleCollectionFailure(gameNumber, error as Error)
      
      const taskResult: TaskResult = {
        task: 'daily_collection',
        success: false,
        gameNumber,
        message: `采集失败: ${(error as Error).message}`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      this.taskHistory.push(taskResult)
      return taskResult
    }
  }
  
  // 每小时验证任务
  async runHourlyVerification(): Promise<TaskResult> {
    const startTime = Date.now()
    const gameNumber = this.getCurrentGameNumber()
    
    console.log(`🕐 开始执行每小时验证任务 - Wordle #${gameNumber}`)
    
    try {
      const existing = await WordlePredictionDB.getTodayPrediction()
      
      // 如果已经验证，跳过
      if (existing && existing.status === 'verified') {
        return {
          task: 'hourly_verification',
          success: true,
          gameNumber,
          message: '今日答案已验证，跳过验证',
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      }
      
      // 重新验证
      const result = await getWordleVerifier().verifyTodayAnswer(gameNumber)
      
      // 如果状态有变化，更新数据库
      if (!existing || existing.status !== result.status || existing.confidence_score !== result.confidence) {
        await getWordleVerifier().updatePredictionInDatabase(result)
      }
      
      const taskResult: TaskResult = {
        task: 'hourly_verification',
        success: true,
        gameNumber,
        message: `验证完成: ${result.consensusWord || '未找到'} (${result.status}, ${Math.round(result.confidence * 100)}%)`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      this.taskHistory.push(taskResult)
      console.log(`✅ 每小时验证任务完成:`, taskResult.message)
      
      return taskResult
      
    } catch (error) {
      const taskResult: TaskResult = {
        task: 'hourly_verification',
        success: false,
        gameNumber,
        message: `验证失败: ${(error as Error).message}`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      this.taskHistory.push(taskResult)
      console.error(`❌ 每小时验证任务失败:`, error)
      
      return taskResult
    }
  }
  
  // 历史数据回填任务
  async runHistoricalBackfill(startGameNumber?: number, endGameNumber?: number): Promise<TaskResult> {
    const startTime = Date.now()
    
    // 默认回填最近30天
    const currentGame = this.getCurrentGameNumber()
    const start = startGameNumber || Math.max(1, currentGame - 30)
    const end = endGameNumber || currentGame - 1
    
    console.log(`🕐 开始执行历史数据回填任务 - #${start} 到 #${end}`)
    
    try {
      let successCount = 0
      let failCount = 0
      
      for (let gameNumber = start; gameNumber <= end; gameNumber++) {
        try {
          // 检查是否已存在
          const existing = await WordlePredictionDB.getTodayPrediction()
          if (existing && existing.game_number === gameNumber && existing.status === 'verified') {
            continue
          }
          
          // 验证答案
          const result = await getWordleVerifier().verifyTodayAnswer(gameNumber)
          
          // 更新数据库
          await getWordleVerifier().updatePredictionInDatabase(result)
          
          if (result.status === 'verified') {
            successCount++
          } else {
            failCount++
          }
          
          // 避免请求过于频繁
          await this.delay(3000)
          
        } catch (error) {
          console.error(`回填 #${gameNumber} 失败:`, error)
          failCount++
        }
      }
      
      const taskResult: TaskResult = {
        task: 'historical_backfill',
        success: true,
        message: `回填完成: 成功 ${successCount}, 失败 ${failCount}`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      this.taskHistory.push(taskResult)
      console.log(`✅ 历史数据回填任务完成:`, taskResult.message)
      
      return taskResult
      
    } catch (error) {
      const taskResult: TaskResult = {
        task: 'historical_backfill',
        success: false,
        message: `回填失败: ${(error as Error).message}`,
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
      
      this.taskHistory.push(taskResult)
      console.error(`❌ 历史数据回填任务失败:`, error)
      
      return taskResult
    }
  }
  
  // 启动定时调度
  async startScheduler(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ 调度器已在运行中')
      return
    }
    
    this.isRunning = true
    console.log('🚀 Wordle调度器启动')
    
    // 立即执行一次每日采集
    await this.runDailyCollection()
    
    // 设置定时任务
    this.setupCronJobs()
  }
  
  // 停止调度器
  stopScheduler(): void {
    this.isRunning = false
    console.log('🛑 Wordle调度器已停止')
  }
  
  // 设置定时任务
  private setupCronJobs(): void {
    // 每日 00:01 执行采集任务
    setInterval(async () => {
      if (!this.isRunning) return
      
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 1) {
        await this.runDailyCollection()
      }
    }, 60000) // 每分钟检查一次
    
    // 每小时执行验证任务
    setInterval(async () => {
      if (!this.isRunning) return
      
      const now = new Date()
      if (now.getMinutes() === 0) { // 整点执行
        await this.runHourlyVerification()
      }
    }, 60000) // 每分钟检查一次
  }
  
  // 获取任务历史
  getTaskHistory(limit = 10): TaskResult[] {
    return this.taskHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }
  
  // 获取调度器状态
  getStatus(): {
    isRunning: boolean
    currentGameNumber: number
    lastTask?: TaskResult
    totalTasks: number
  } {
    return {
      isRunning: this.isRunning,
      currentGameNumber: this.getCurrentGameNumber(),
      lastTask: this.taskHistory[this.taskHistory.length - 1],
      totalTasks: this.taskHistory.length
    }
  }
  
  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // 带重试机制的执行
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    delay: number
  ): Promise<T> {
    let lastError: Error
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries) {
          console.log(`重试 ${i + 1}/${maxRetries} 失败，${delay}ms后重试...`)
          await this.delay(delay)
        }
      }
    }
    
    throw lastError!
  }
  
  // 处理采集失败的容错逻辑
  private async handleCollectionFailure(gameNumber: number, error: Error): Promise<void> {
    console.log(`处理采集失败的容错逻辑 #${gameNumber}:`, error.message)
    
    // 创建一个候选预测记录
    try {
      await WordlePredictionDB.upsertPrediction({
        game_number: gameNumber,
        date: new Date().toISOString().split('T')[0],
        predicted_word: undefined,
        status: 'rejected' as const,
        confidence_score: 0,
        verification_sources: [],
        hints: {
          category: '采集失败',
          difficulty: '未知',
          clues: [`采集失败: ${error.message}`],
          letterHints: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } catch (dbError) {
      console.error('创建失败记录时出错:', dbError)
    }
  }
}

// 导出单例
// 延迟初始化的单例
let wordleSchedulerInstance: WordleScheduler | null = null

export function getWordleScheduler(): WordleScheduler {
  if (!wordleSchedulerInstance) {
    wordleSchedulerInstance = new WordleScheduler()
  }
  return wordleSchedulerInstance
}

// 为了向后兼容，也导出一个getter
export const wordleScheduler = {
  get instance() {
    return getWordleScheduler()
  }
}
