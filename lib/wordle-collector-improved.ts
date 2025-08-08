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
export class WordleCollectorImproved {
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
      console.log(`Collecting from ${source.name}...`)
      
      // 构建请求URL
      const url = this.buildUrl(source.base_url, gameNumber)
      
      // 发送请求
      const response = await this.fetchWithTimeout(url, this.timeout)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      const word = this.extractWordFromHtml(html, source.name)
      
      const responseTime = Date.now() - startTime
      
      if (word) {
        console.log(`✅ ${source.name}: Success - ${word} (${responseTime}ms)`)
        return {
          source: source.name,
          word: word.toUpperCase(),
          success: true,
          responseTime,
          rawData: { url, htmlLength: html.length }
        }
      } else {
        throw new Error('Unable to extract answer from page')
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.log(`❌ ${source.name}: Failed - ${error instanceof Error ? error.message : String(error)} (${responseTime}ms)`)
      
      return {
        source: source.name,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
  
  // 构建请求URL
  private buildUrl(baseUrl: string, gameNumber: number): string {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    
    return baseUrl
      .replace('{gameNumber}', gameNumber.toString())
      .replace('{date}', dateStr)
  }
  
  // Fetch with timeout
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
  
  // 改进的提取逻辑 - 根据不同源使用不同策略
  private extractWordFromHtml(html: string, sourceName: string): string | null {
    try {
      switch (sourceName) {
        case 'tomsguide':
          return this.extractFromTomsGuide(html)
        case 'techradar':
          return this.extractFromTechRadar(html)
        case 'wordtips':
          return this.extractFromWordTips(html)
        default:
          return this.extractGeneric(html)
      }
    } catch (error) {
      console.error(`Error extracting answer from ${sourceName}:`, error)
      return null
    }
  }
  
  // Tom's Guide 特定提取逻辑
  private extractFromTomsGuide(html: string): string | null {
    const patterns = [
      // 精确匹配 "Drumroll please &mdash; it's <strong>IMBUE</strong>"
      /Drumroll\s*please\s*&mdash;\s*it's\s*<strong>([A-Z]{5})<\/strong>/i,
      /Drumroll\s*please\s*—\s*it's\s*<strong>([A-Z]{5})<\/strong>/i,
      /it's\s*<strong>([A-Z]{5})<\/strong>/i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && this.isValidWordleWord(match[1])) {
        console.log(`Found answer using Tom's Guide pattern: ${match[1]}`)
        return match[1].toUpperCase()
      }
    }
    
    return null
  }
  
  // TechRadar 特定提取逻辑
  private extractFromTechRadar(html: string): string | null {
    const patterns = [
      // 匹配 "Today's Wordle answer (game #1511) is… <strong>IMBUE</strong>."
      /Today's\s*Wordle\s*answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      /answer[^a-zA-Z]*game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      /game\s*#\d+[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && this.isValidWordleWord(match[1])) {
        console.log(`Found answer using TechRadar pattern: ${match[1]}`)
        return match[1].toUpperCase()
      }
    }
    
    return null
  }
  
  // Word.tips 特定提取逻辑
  private extractFromWordTips(html: string): string | null {
    const patterns = [
      // 从JavaScript数据中提取 answer:"IMBUE"
      /answer:"([A-Z]{5})"/i,
      /"answer"\s*:\s*"([A-Z]{5})"/i,
      /solutions:\[{[^}]*answer:"([A-Z]{5})"/i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && this.isValidWordleWord(match[1])) {
        console.log(`Found answer using Word.tips pattern: ${match[1]}`)
        return match[1].toUpperCase()
      }
    }
    
    return null
  }
  
  // 通用提取逻辑（作为后备）
  private extractGeneric(html: string): string | null {
    const patterns = [
      // 通用答案模式
      /answer[^a-zA-Z]*is[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      /today[^a-zA-Z]*answer[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
      /wordle[^a-zA-Z]*answer[^a-zA-Z]*<strong>([A-Z]{5})<\/strong>/i,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && this.isValidWordleWord(match[1])) {
        console.log(`Found answer using generic pattern: ${match[1]}`)
        return match[1].toUpperCase()
      }
    }
    
    return null
  }
  
  // 验证是否为有效的Wordle单词
  private isValidWordleWord(word: string): boolean {
    if (!word || word.length !== 5) return false
    
    // 检查是否只包含字母
    if (!/^[A-Z]+$/.test(word)) return false
    
    // 排除一些明显不是答案的词
    const excludeWords = ['TODAY', 'WORDLE', 'ANSWER', 'GUESS', 'HINTS', 'CLUES', 'HELLI']
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

// 导出改进版本的实例
let wordleCollectorImprovedInstance: WordleCollectorImproved | null = null

export function getWordleCollectorImproved(): WordleCollectorImproved {
  if (!wordleCollectorImprovedInstance) {
    wordleCollectorImprovedInstance = new WordleCollectorImproved()
  }
  return wordleCollectorImprovedInstance
}