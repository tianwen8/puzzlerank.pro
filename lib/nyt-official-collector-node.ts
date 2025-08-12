import https from 'https'
import { URL } from 'url'

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

export class NYTOfficialCollectorNode {
  private readonly baseUrl = 'https://www.nytimes.com/svc/wordle/v2'
  
  private async fetchWithHttps(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url)
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.nytimes.com/games/wordle/index.html',
          'Origin': 'https://www.nytimes.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 30000
      }
      
      const req = https.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
              return
            }
            
            const jsonData = JSON.parse(data)
            resolve(jsonData)
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error}`))
          }
        })
      })
      
      req.on('error', (error) => {
        reject(error)
      })
      
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })
      
      req.setTimeout(30000)
      req.end()
    })
  }
  
  async collectTodayAnswer(dateStr: string): Promise<CollectionResult> {
    try {
      const url = `${this.baseUrl}/${dateStr}.json`
      console.log(`Fetching from NYT API with HTTPS module: ${url}`)
      
      const data: NYTWordleResponse = await this.fetchWithHttps(url)
      
      if (!data.solution || !data.days_since_launch) {
        throw new Error('Invalid response format from NYT API')
      }
      
      console.log(`Successfully collected: Game #${data.days_since_launch}, Answer: ${data.solution}`)
      
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
}