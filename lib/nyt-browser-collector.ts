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

export class NYTBrowserCollector {
  private readonly baseUrl = 'https://www.nytimes.com/svc/wordle/v2'
  
  async collectTodayAnswer(dateStr: string): Promise<CollectionResult> {
    try {
      const url = `${this.baseUrl}/${dateStr}.json`
      console.log(`Attempting to fetch from NYT API via browser method: ${url}`)
      
      // 方案1: 尝试使用 node-fetch 替代原生 fetch
      let response;
      try {
        // 动态导入 node-fetch
        const fetch = (await import('node-fetch')).default;
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.nytimes.com/games/wordle/index.html',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          timeout: 30000
        });
      } catch (fetchError) {
        console.log('node-fetch failed, trying alternative method:', fetchError.message);
        throw new Error('Network request failed');
      }
      
      if (!response.ok) {
        throw new Error(`NYT API returned ${response.status}: ${response.statusText}`)
      }
      
      const data: NYTWordleResponse = await response.json()
      
      if (!data.solution || !data.days_since_launch) {
        throw new Error('Invalid response format from NYT API')
      }
      
      console.log(`Successfully collected from NYT API: Game #${data.days_since_launch}, Answer: ${data.solution}`)
      
      return {
        success: true,
        data: {
          gameNumber: data.days_since_launch,
          answer: data.solution.toUpperCase(),
          date: data.print_date || dateStr
        }
      }
      
    } catch (error) {
      console.error('NYT Browser API collection failed:', error)
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