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

export class NYTOfficialCollector {
  private readonly baseUrl = 'https://www.nytimes.com/svc/wordle/v2'
  
  async collectTodayAnswer(dateStr: string): Promise<CollectionResult> {
    try {
      const url = `${this.baseUrl}/${dateStr}.json`
      console.log(`Fetching from NYT API: ${url}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.nytimes.com/games/wordle/index.html',
          'Origin': 'https://www.nytimes.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        },
        cache: 'no-cache',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`NYT API returned ${response.status}: ${response.statusText}`)
      }
      
      const data: NYTWordleResponse = await response.json()
      
      if (!data.solution || !data.days_since_launch) {
        throw new Error('Invalid response format from NYT API')
      }
      
      return {
        success: true,
        data: {
          gameNumber: data.days_since_launch,
          answer: data.solution.toUpperCase(),
          date: data.print_date || dateStr
        }
      }
      
    } catch (error) {
      console.error('NYT API collection failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  async collectHistoricalAnswer(dateStr: string): Promise<CollectionResult> {
    return this.collectTodayAnswer(dateStr)
  }
  
  async collectMultipleDates(startDate: string, endDate: string): Promise<CollectionResult[]> {
    const results: CollectionResult[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const result = await this.collectTodayAnswer(dateStr)
      results.push(result)
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return results
  }
}