import { request } from 'undici'

interface NYTWordleResponse {
  id: number
  solution: string
  print_date: string
  days_since_launch: number
  editor: string
}

interface CollectionResult {
  success: boolean
  data?: {
    gameNumber: number
    answer: string
    date: string
  }
  error?: string
}

export class NYTUndiciCollector {
  private readonly baseUrl = 'https://www.nytimes.com/svc/wordle/v2'
  
  async collectTodayAnswer(dateStr: string): Promise<CollectionResult> {
    try {
      const url = `${this.baseUrl}/${dateStr}.json`
      console.log(`🚀 Attempting to fetch from NYT API using Undici: ${url}`)
      
      const { statusCode, headers, body } = await request(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Referer': 'https://www.nytimes.com/games/wordle/index.html',
          'Origin': 'https://www.nytimes.com',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        // Undici 特定配置
        bodyTimeout: 30000,
        headersTimeout: 30000
      })
      
      console.log(`📥 Response Status: ${statusCode}`)
      console.log(`📥 Response Headers:`, headers)
      
      if (statusCode !== 200) {
        throw new Error(`NYT API returned ${statusCode}`)
      }
      
      const responseText = await body.text()
      console.log(`📄 Raw Response: ${responseText}`)
      
      const data: NYTWordleResponse = JSON.parse(responseText)
      
      if (!data.solution || typeof data.days_since_launch !== 'number') {
        throw new Error('Invalid response format from NYT API')
      }
      
      console.log(`✅ Successfully collected from NYT API using Undici:`)
      console.log(`   Game Number: ${data.days_since_launch}`)
      console.log(`   Answer: ${data.solution}`)
      console.log(`   Date: ${data.print_date}`)
      console.log(`   Editor: ${data.editor}`)
      
      return {
        success: true,
        data: {
          gameNumber: data.days_since_launch,
          answer: data.solution.toUpperCase(),
          date: data.print_date || dateStr
        }
      }
      
    } catch (error) {
      console.error('❌ NYT Undici API collection failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code || 'unknown',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  async collectHistoricalAnswer(dateStr: string): Promise<CollectionResult> {
    return this.collectTodayAnswer(dateStr)
  }
}