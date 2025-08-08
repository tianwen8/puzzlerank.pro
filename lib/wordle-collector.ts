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
  
  // Extract word from HTML
  private extractWordFromHtml(html: string, sourceName: string): string | null {
    try {
      // 根据不同源使用不同的提取策略
      const sourceSpecificPatterns = this.getSourceSpecificPatterns(sourceName)
      
      // 尝试源特定的模式
      for (const pattern of sourceSpecificPatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          const word = match[1].toUpperCase()
          if (this.isValidWordleWord(word)) {
            console.log(`Found answer using ${sourceName} pattern: ${word}`)
            return word
          }
        }
      }
      
      // 通用提取模式
      const patterns = [
        /answer[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
        /solution[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
        /today's[^a-zA-Z]*wordle[^a-zA-Z]*answer[^a-zA-Z]*([A-Z]{5})/i,
        /wordle[^a-zA-Z]*#\d+[^a-zA-Z]*answer[^a-zA-Z]*([A-Z]{5})/i
      ]
      
      // 首先尝试精确模式匹配
      for (const pattern of patterns) {
        const matches = html.match(pattern)
        if (matches && matches[1]) {
          const word = matches[1].toUpperCase()
          if (this.isValidWordleWord(word)) {
            console.log(`Found answer using pattern: ${word}`)
            return word
          }
        }
      }
      
      // 如果精确匹配失败，查找所有5字母单词，但更严格地验证
      const allWords = html.match(/\b[A-Z]{5}\b/gi) || []
      const validWords = []
      
      for (const word of allWords) {
        const upperWord = word.toUpperCase()
        if (this.isValidWordleWord(upperWord)) {
          validWords.push(upperWord)
        }
      }
      
      // 如果只找到一个有效单词，返回它
      if (validWords.length === 1) {
        console.log(`Found single valid word: ${validWords[0]}`)
        return validWords[0]
      }
      
      // 如果找到多个，尝试根据上下文选择最可能的答案
      if (validWords.length > 1) {
        console.log(`Found multiple valid words: ${validWords.join(', ')}`)
        
        // 查找最接近"answer"关键词的单词
        for (const word of validWords) {
          const wordIndex = html.toUpperCase().indexOf(word)
          const beforeText = html.substring(Math.max(0, wordIndex - 100), wordIndex).toLowerCase()
          const afterText = html.substring(wordIndex, wordIndex + 100).toLowerCase()
          
          if (beforeText.includes('answer') || beforeText.includes('solution') || 
              afterText.includes('answer') || afterText.includes('solution')) {
            console.log(`Selected word based on context: ${word}`)
            return word
          }
        }
        
        // 如果没有明确的上下文，返回第一个
        return validWords[0]
      }
      
      return null
      
    } catch (error) {
      console.error('Error extracting answer:', error)
      return null
    }
  }
  
  // 获取针对特定源的提取模式
  private getSourceSpecificPatterns(sourceName: string): RegExp[] {
    switch (sourceName.toLowerCase()) {
      case 'tomsguide':
        return [
          /Drumroll[^a-zA-Z]*please[^a-zA-Z]*[—-][^a-zA-Z]*it's[^a-zA-Z]*([A-Z]{5})/i,
          /So[^a-zA-Z]*what[^a-zA-Z]*is[^a-zA-Z]*today's[^a-zA-Z]*Wordle[^a-zA-Z]*answer[^a-zA-Z]*for[^a-zA-Z]*game[^a-zA-Z]*#\d+[^a-zA-Z]*Drumroll[^a-zA-Z]*please[^a-zA-Z]*[—-][^a-zA-Z]*it's[^a-zA-Z]*([A-Z]{5})/i
        ]
        
      case 'techradar':
        return [
          /Today's\s*Wordle\s*answer[^a-zA-Z]*game[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
          /wordle\s*answer[^a-zA-Z]*game[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i
        ]
        
      case 'wordtips':
        return [
          /The\s*answer\s*for\s*today's\s*Wordle\s*on[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
          /answer[^a-zA-Z]*for[^a-zA-Z]*today's[^a-zA-Z]*Wordle[^a-zA-Z]*on[^a-zA-Z]*\w+[^a-zA-Z]*\d+[^a-zA-Z]*#\d+[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i
        ]
        
      default:
        return [
          /answer[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i,
          /solution[^a-zA-Z]*is[^a-zA-Z]*([A-Z]{5})/i
        ]
    }
  }

  // 验证是否为有效的Wordle单词
  private isValidWordleWord(word: string): boolean {
    if (!word || word.length !== 5) return false
    
    // 检查是否只包含字母
    if (!/^[A-Z]+$/.test(word)) return false
    
    // 排除一些明显不是答案的词
    const excludeWords = ['TODAY', 'WORDLE', 'ANSWER', 'GUESS', 'HINTS', 'CLUES', 'GAMES', 'WORDS', 'TILES', 'SCORE']
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