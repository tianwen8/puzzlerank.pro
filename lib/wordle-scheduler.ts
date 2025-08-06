import { wordleVerifier } from './wordle-verifier'
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
  
  // 获取当前游戏编号
  private getCurrentGameNumber(): number {
    const startDate = new Date('2021-06-19') // Wordle #1 的日期
    const today = new Date()
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
        () => wordleVerifier.verifyTodayAnswer(gameNumber),
        3, // 最多重试3次
        30000 // 每次重试间隔30秒
      )
      
      // 更新数据库
      const updated = await wordleVerifier.updatePredictionInDatabase(result)
      
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
      await this.handleCollectionFailure(gameNumber, error)
      
      const taskResult: TaskResult = {
        task: 'daily_collection',
        success: false,
        gameNumber,
        message: `采集失败: ${error.message}`,
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
      const result = await wordleVerifier.verifyTodayAnswer(gameNumber)
      
      // 如果状态有变化，更新数据库
      if (!existing || existing.status !== result.status || existing.confidence_score !== result.confidence) {
        await wordleVerifier.updatePredictionInDatabase(result)
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
        message: `验证失败: ${error.message}`,
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
          const result = await wordleVerifier.verifyTodayAnswer(gameNumber)
          
          // 更新数据库
          await wordleVerifier.updatePredictionInDatabase(result)
          
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
        message: `回填失败: ${error.message}`,
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
