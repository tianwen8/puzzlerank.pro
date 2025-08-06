import { WordlePredictionDB, VerificationSource } from './database/wordle-prediction-db'

// 采集结果接口
interface CollectionResult {
  source: string
  word?: string
  success: boolean
  responseTime: number
  error?: string
  rawData?: any
}

// Wordle答案采集器
export class WordleCollector {
  private sources: VerificationSource[] = []
  private maxRetries = 3
  private retryDelay = 5000
  private timeout = 10000
  
  constructor() {
    this.loadConfig()
  }
  
  // 加载配置
  private async loadConfig() {
    this.sources = await WordlePredictionDB.getVerificationSources()
    
    const retryConfig = await WordlePredictionDB.getSystemConfig('retry_config')
    if (retryConfig) {
      this.maxRetries = retryConfig.max_retries || 3
      this.retryDelay = retryConfig.retry_delay || 5000
    }
  }
  
  // 采集今日答案
  async collectTodayAnswer(gameNumber: number): Promise<CollectionResult[]> {
    console.log(`开始采集 Wordle #${gameNumber} 答案...`)
    
    if (this.sources.length === 0) {
      await this.loadConfig()
    }
    
    const results: CollectionResult[] = []
    
    // 并行采集所有源
    const promises = this.sources.map(source => 
      this.collectFromSource(source, gameNumber)
    )
    
    const collectionResults = await Promise.allSettled(promises)
    
    collectionResults.forEach((result, index) => {
      const source = this.sources[index]
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        results.push({
          source: source.name,
          success: false,
          responseTime: 0,
          error: result.reason?.message || '未知错误'
        })
      }
    })
    
    // 记录采集日志
    await this.logResults(gameNumber, results)
    
    return results
  }
  
  // 从单个源采集
  private async collectFromSource(source: VerificationSource, gameNumber: number): Promise<CollectionResult> {
    const startTime = Date.now()
    
    try {
      console.log(`正在从 ${source.name} 采集...`)
      
      // 构建请求URL
      const url = this.buildUrl(source.base_url, gameNumber)
      
      // 发送请求
      const response = await this.fetchWithTimeout(url, this.timeout)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      const word = this.extractWordFromHtml(html, source.selector_config)
      
      const responseTime = Date.now() - startTime
      
      if (word) {
        console.log(`✅ ${source.name}: 采集成功 - ${word} (${responseTime}ms)`)
        return {
          source: source.name,
          word: word.toUpperCase(),
          success: true,
          responseTime,
          rawData: { url, htmlLength: html.length }
        }
      } else {
        throw new Error('未能从页面中提取到答案')
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.log(`❌ ${source.name}: 采集失败 - ${error.message} (${responseTime}ms)`)
      
      return {
        source: source.name,
        success: false,
        responseTime,
        error: error.message
      }
    }
  }
  
  // 构建请求URL
  private buildUrl(baseUrl: string, gameNumber: number): string {
    // 大多数网站的URL都包含日期或游戏编号
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    
    return baseUrl
      .replace('{gameNumber}', gameNumber.toString())
      .replace('{date}', dateStr)
  }
  
  // 带超时的fetch
  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      })
      
      clearTimeout(timeoutId)
      return response
      
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
  
  // 从HTML中提取答案
  private extractWordFromHtml(html: string, config: any): string | null {
    try {
      // 简单的文本匹配方法（在服务器端环境中）
      const patterns = [
        // 常见的答案模式
        /answer[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
        /today[^a-zA-Z]*answer[^a-zA-Z]*([A-Z]{5})/i,
        /wordle[^a-zA-Z]*answer[^a-zA-Z]*([A-Z]{5})/i,
        /solution[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
        // 直接匹配5个大写字母
        /\b([A-Z]{5})\b/g
      ]
      
      for (const pattern of patterns) {
        const matches = html.match(pattern)
        if (matches) {
          const word = matches[1]?.toUpperCase()
          if (word && this.isValidWordleWord(word)) {
            return word
          }
        }
      }
      
      // 如果没有找到，尝试提取所有5字母单词
      const allWords = html.match(/\b[A-Z]{5}\b/gi) || []
      for (const word of allWords) {
        if (this.isValidWordleWord(word.toUpperCase())) {
          return word.toUpperCase()
        }
      }
      
      return null
      
    } catch (error) {
      console.error('提取答案时出错:', error)
      return null
    }
  }
  
  // 验证是否为有效的Wordle单词
  private isValidWordleWord(word: string): boolean {
    if (!word || word.length !== 5) return false
    
    // 检查是否只包含字母
    if (!/^[A-Z]+$/.test(word)) return false
    
    // 排除一些明显不是答案的词
    const excludeWords = ['TODAY', 'WORDLE', 'ANSWER', 'GUESS', 'HINTS', 'CLUES']
    if (excludeWords.includes(word)) return false
    
    return true
  }
  
  // 记录采集结果
  private async logResults(gameNumber: number, results: CollectionResult[]) {
    for (const result of results) {
      await WordlePredictionDB.logCollection({
        game_number: gameNumber,
        source_name: result.source,
        collected_word: result.word,
        status: result.success ? 'success' : 'failed',
        response_time: result.responseTime,
        error_message: result.error,
        raw_data: result.rawData
      })
    }
  }
}

// 导出单例
// 延迟初始化的单例
let wordleCollectorInstance: WordleCollector | null = null

export function getWordleCollector(): WordleCollector {
  if (!wordleCollectorInstance) {
    wordleCollectorInstance = new WordleCollector()
  }
  return wordleCollectorInstance
}

// 为了向后兼容，也导出一个getter
export const wordleCollector = {
  get instance() {
    return getWordleCollector()
  }
}
