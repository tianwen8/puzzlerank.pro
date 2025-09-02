// Wordle API 缓存系统
// 减少数据库查询，提高响应性能

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class WordleCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5分钟默认缓存时间
  
  // 今日预测缓存时间较长（30分钟），因为今日答案相对稳定
  private readonly TODAY_TTL = 30 * 60 * 1000
  
  // 历史数据缓存时间更长（1小时），因为历史数据不会改变
  private readonly HISTORY_TTL = 60 * 60 * 1000

  /**
   * 获取缓存数据
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  /**
   * 设置缓存数据
   */
  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.DEFAULT_TTL
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * 删除特定缓存
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取今日预测（带缓存）
   */
  getTodayPredictionTTL(): number {
    return this.TODAY_TTL
  }

  /**
   * 获取历史数据TTL
   */
  getHistoryTTL(): number {
    return this.HISTORY_TTL
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 全局缓存实例
export const wordleCache = new WordleCache()

// 定期清理过期缓存（每10分钟）
if (typeof window === 'undefined') { // 只在服务端运行
  setInterval(() => {
    wordleCache.cleanup()
  }, 10 * 60 * 1000)
}

// 缓存键常量
export const CACHE_KEYS = {
  TODAY_PREDICTION: 'today_prediction',
  HISTORY_PREDICTIONS: 'history_predictions',
  CANDIDATES: 'candidates',
  SYSTEM_STATUS: 'system_status'
} as const