/**
 * SEO通知服务 - 自动通知搜索引擎新内容更新
 */

interface SearchEngineConfig {
  name: string
  submitUrl: string
  enabled: boolean
}

class SEONotificationService {
  private searchEngines: SearchEngineConfig[] = [
    {
      name: 'Google',
      submitUrl: 'https://www.google.com/ping?sitemap=',
      enabled: true
    },
    {
      name: 'Bing',
      submitUrl: 'https://www.bing.com/ping?sitemap=',
      enabled: true
    },
    {
      name: 'Yandex',
      submitUrl: 'https://webmaster.yandex.com/ping?sitemap=',
      enabled: false // 可选启用
    }
  ]

  private baseUrl = 'https://puzzlerank.pro'
  private sitemapUrl = `${this.baseUrl}/sitemap.xml`

  /**
   * 通知所有搜索引擎sitemap已更新
   */
  async notifySitemapUpdate(): Promise<{ success: boolean; results: any[] }> {
    const results = []
    let hasSuccess = false

    for (const engine of this.searchEngines) {
      if (!engine.enabled) continue

      try {
        const result = await this.notifySearchEngine(engine)
        results.push({
          engine: engine.name,
          success: result.success,
          status: result.status,
          message: result.message
        })
        
        if (result.success) {
          hasSuccess = true
        }
      } catch (error) {
        results.push({
          engine: engine.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      success: hasSuccess,
      results
    }
  }

  /**
   * 通知特定搜索引擎
   */
  private async notifySearchEngine(engine: SearchEngineConfig): Promise<{
    success: boolean
    status?: number
    message?: string
  }> {
    const url = `${engine.submitUrl}${encodeURIComponent(this.sitemapUrl)}`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'PuzzleRank Pro SEO Bot/1.0'
        },
        // 设置超时
        signal: AbortSignal.timeout(10000)
      })

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Sitemap submitted successfully' : `HTTP ${response.status}`
      }
    } catch (error) {
      console.error(`Failed to notify ${engine.name}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  /**
   * 通知新页面URL
   */
  async notifyNewUrl(url: string): Promise<{ success: boolean; results: any[] }> {
    // 对于Google，可以使用IndexNow API（如果配置了API密钥）
    // 这里先实现基础的sitemap通知
    return this.notifySitemapUpdate()
  }

  /**
   * 批量通知多个新URL
   */
  async notifyNewUrls(urls: string[]): Promise<{ success: boolean; results: any[] }> {
    // 批量通知时，通常更新sitemap然后通知搜索引擎
    console.log(`Notifying search engines about ${urls.length} new URLs:`, urls)
    return this.notifySitemapUpdate()
  }

  /**
   * 检查是否需要通知（避免频繁通知）
   */
  shouldNotify(lastNotification?: Date): boolean {
    if (!lastNotification) return true
    
    // 至少间隔1小时才通知
    const hoursSinceLastNotification = (Date.now() - lastNotification.getTime()) / (1000 * 60 * 60)
    return hoursSinceLastNotification >= 1
  }

  /**
   * 获取搜索引擎配置
   */
  getSearchEngines(): SearchEngineConfig[] {
    return this.searchEngines
  }

  /**
   * 更新搜索引擎配置
   */
  updateSearchEngineConfig(name: string, config: Partial<SearchEngineConfig>): void {
    const engine = this.searchEngines.find(e => e.name === name)
    if (engine) {
      Object.assign(engine, config)
    }
  }
}

// 单例实例
export const seoNotificationService = new SEONotificationService()

// 便捷函数
export async function notifySearchEngines(): Promise<{ success: boolean; results: any[] }> {
  return seoNotificationService.notifySitemapUpdate()
}

export async function notifyNewWordleAnswer(gameNumber: number): Promise<{ success: boolean; results: any[] }> {
  const urls = [
    `https://puzzlerank.pro/wordle-${gameNumber}`,
    'https://puzzlerank.pro/wordle-today',
    'https://puzzlerank.pro/todays-wordle-answer'
  ]
  
  return seoNotificationService.notifyNewUrls(urls)
}

export { SEONotificationService }