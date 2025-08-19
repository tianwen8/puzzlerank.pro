import { googleSearchConsole } from './google-search-console'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'

interface SchedulerConfig {
  enableAutoSubmission: boolean
  submissionInterval: number // 小时
  maxUrlsPerBatch: number
  retryAttempts: number
}

export class SitemapScheduler {
  private config: SchedulerConfig
  private isRunning: boolean = false

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = {
      enableAutoSubmission: true,
      submissionInterval: 24, // 每24小时提交一次
      maxUrlsPerBatch: 100,
      retryAttempts: 3,
      ...config
    }
  }

  /**
   * 启动自动sitemap提交调度器
   */
  async startScheduler(): Promise<void> {
    if (this.isRunning) {
      console.log('📅 Sitemap scheduler is already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting sitemap scheduler...')

    // 立即执行一次
    await this.executeSitemapSubmission()

    // 设置定时执行
    setInterval(async () => {
      if (this.config.enableAutoSubmission) {
        await this.executeSitemapSubmission()
      }
    }, this.config.submissionInterval * 60 * 60 * 1000) // 转换为毫秒
  }

  /**
   * 停止调度器
   */
  stopScheduler(): void {
    this.isRunning = false
    console.log('⏹️ Sitemap scheduler stopped')
  }

  /**
   * 执行sitemap提交
   */
  private async executeSitemapSubmission(): Promise<void> {
    try {
      console.log('📤 Executing sitemap submission...')

      // 1. 提交主sitemap
      const sitemapResult = await googleSearchConsole.submitSitemap()
      
      if (sitemapResult.success) {
        console.log('✅ Main sitemap submitted successfully')
        
        // 2. 获取最新的Wordle游戏URL并请求索引
        await this.submitNewWordlePages()
        
        // 3. 记录提交日志
        await this.logSubmission(sitemapResult)
      } else {
        console.error('❌ Failed to submit main sitemap:', sitemapResult.message)
      }

    } catch (error) {
      console.error('❌ Error in sitemap submission:', error)
    }
  }

  /**
   * 提交新的Wordle页面进行索引
   */
  private async submitNewWordlePages(): Promise<void> {
    try {
      // 获取最近7天的游戏
      const recentGames = await this.getRecentWordleGames(7)
      
      if (recentGames.length === 0) {
        console.log('📝 No recent Wordle games to submit')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
      const urls = recentGames.map(game => `${baseUrl}/wordle/${game.game_number}`)

      // 分批提交URL进行索引
      const batches = this.chunkArray(urls, this.config.maxUrlsPerBatch)
      
      for (const batch of batches) {
        const result = await googleSearchConsole.requestIndexing(batch)
        
        if (result.success) {
          console.log(`✅ Requested indexing for ${result.indexedUrls?.length} URLs`)
        } else {
          console.error('❌ Failed to request indexing:', result.message)
        }

        // 避免API限制，批次间等待
        await this.delay(2000)
      }

    } catch (error) {
      console.error('❌ Error submitting new Wordle pages:', error)
    }
  }

  /**
   * 获取最近的Wordle游戏
   */
  private async getRecentWordleGames(days: number): Promise<any[]> {
    try {
      const allGames = await WordlePredictionDB.getAllGames()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      return allGames.filter(game => {
        const gameDate = new Date(game.date)
        return gameDate >= cutoffDate
      })
    } catch (error) {
      console.error('❌ Error getting recent Wordle games:', error)
      return []
    }
  }

  /**
   * 记录提交日志
   */
  private async logSubmission(result: any): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: 'sitemap_submission',
        success: result.success,
        message: result.message,
        submittedAt: result.submittedAt
      }

      // 这里可以保存到数据库或文件
      console.log('📋 Submission logged:', logEntry)
    } catch (error) {
      console.error('❌ Error logging submission:', error)
    }
  }

  /**
   * 数组分块工具函数
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 延迟工具函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 手动触发sitemap提交
   */
  async manualSubmission(): Promise<void> {
    console.log('🔧 Manual sitemap submission triggered')
    await this.executeSitemapSubmission()
  }

  /**
   * 获取调度器状态
   */
  getStatus(): { isRunning: boolean; config: SchedulerConfig } {
    return {
      isRunning: this.isRunning,
      config: this.config
    }
  }
}

// 导出单例实例
export const sitemapScheduler = new SitemapScheduler()