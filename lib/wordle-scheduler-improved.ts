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

// 改进的Wordle调度器 - 支持UTC时区和准确的游戏编号计算
export class WordleSchedulerImproved {
  private isRunning = false
  private taskHistory: TaskResult[] = []
  private lastCollectionDate: string | null = null
  
  // 获取当前游戏编号（基于UTC时间，准确计算）
  private getCurrentGameNumber(): number {
    // 使用UTC时间确保全球一致性
    const now = new Date()
    const utcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    const todayStr = utcDate.toISOString().split('T')[0]
    
    // 手动校正：2025-08-08 应该是 #1511 (IMBUE)
    if (todayStr === '2025-08-08') {
      return 1511
    }
    
    // 基于 2025-08-08 = #1511 计算其他日期
    const baseDate = new Date('2025-08-08T00:00:00.000Z')
    const baseGameNumber = 1511
    const daysDiff = Math.floor((utcDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return baseGameNumber + daysDiff
  }
  
  // 检查是否应该执行每日采集（基于UTC时间）
  private shouldRunDailyCollection(): boolean {
    const now = new Date()
    const utcDate = now.toISOString().split('T')[0]
    
    // 如果今天还没有采集过，且当前时间已过UTC 00:01
    if (this.lastCollectionDate !== utcDate) {
      const utcHours = now.getUTCHours()
      const utcMinutes = now.getUTCMinutes()
      
      // UTC 00:01 之后可以开始采集
      return utcHours > 0 || (utcHours === 0 && utcMinutes >= 1)
    }
    
    return false
  }
  
  // 每日采集任务（在UTC 00:01后执行）
  async runDailyCollection(): Promise<TaskResult> {
    const startTime = Date.now()
    const gameNumber = this.getCurrentGameNumber()
    const utcDate = new Date().toISOString().split('T')[0]
    
    console.log(`🕐 开始执行每日采集任务 - Wordle #${gameNumber} (UTC: ${utcDate})`)
    
    try {
      // 检查今日是否已有记录
      const existing = await WordlePredictionDB.getTodayPrediction()
      
      if (existing && existing.status === 'verified' && existing.game_number === gameNumber) {
        this.lastCollectionDate = utcDate
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
      
      // 标记今日已采集
      this.lastCollectionDate = utcDate
      
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
      if (existing && existing.status === 'verified' && existing.game_number === gameNumber) {
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
    console.log('🚀 改进版Wordle调度器启动 (基于UTC时区)')
    
    // 检查是否需要立即执行每日采集
    if (this.shouldRunDailyCollection()) {
      console.log('🎯 检测到需要执行每日采集，立即开始...')
      await this.runDailyCollection()
    }
    
    // 设置定时任务
    this.setupCronJobs()
  }
  
  // 停止调度器
  stopScheduler(): void {
    this.isRunning = false
    console.log('🛑 改进版Wordle调度器已停止')
  }
  
  // 设置定时任务（基于UTC时间）
  private setupCronJobs(): void {
    console.log('⏰ 设置基于UTC时区的定时任务')
    
    // 每分钟检查是否需要执行每日采集
    setInterval(async () => {
      if (!this.isRunning) return
      
      if (this.shouldRunDailyCollection()) {
        console.log('🎯 UTC时间检测：开始每日采集')
        await this.runDailyCollection()
      }
    }, 60000) // 每分钟检查一次
    
    // 每小时执行验证任务（UTC整点）
    setInterval(async () => {
      if (!this.isRunning) return
      
      const now = new Date()
      const utcMinutes = now.getUTCMinutes()
      
      if (utcMinutes === 0) { // UTC整点执行
        console.log('🎯 UTC整点：开始每小时验证')
        await this.runHourlyVerification()
      }
    }, 60000) // 每分钟检查一次
    
    console.log('📅 定时任务设置完成:')
    console.log('  - 每日采集: UTC 00:01 后自动执行')
    console.log('  - 每小时验证: UTC 整点执行')
    console.log('  - 当前UTC时间:', new Date().toISOString())
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
    utcTime: string
    lastCollectionDate: string | null
    shouldCollectToday: boolean
    lastTask?: TaskResult
    totalTasks: number
  } {
    return {
      isRunning: this.isRunning,
      currentGameNumber: this.getCurrentGameNumber(),
      utcTime: new Date().toISOString(),
      lastCollectionDate: this.lastCollectionDate,
      shouldCollectToday: this.shouldRunDailyCollection(),
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
        predicted_word: null,
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

// 导出改进版单例
let wordleSchedulerImprovedInstance: WordleSchedulerImproved | null = null

export function getWordleSchedulerImproved(): WordleSchedulerImproved {
  if (!wordleSchedulerImprovedInstance) {
    wordleSchedulerImprovedInstance = new WordleSchedulerImproved()
  }
  return wordleSchedulerImprovedInstance
}