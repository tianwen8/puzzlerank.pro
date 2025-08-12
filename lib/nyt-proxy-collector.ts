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

export class NYTProxyCollector {
  private readonly baseUrl = 'https://www.nytimes.com/svc/wordle/v2'
  
  // 使用公共代理服务来绕过网络限制
  private async fetchViaProxy(url: string): Promise<any> {
    // 方案1: 使用 CORS 代理服务
    const proxyUrls = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ]
    
    for (const proxyUrl of proxyUrls) {
      try {
        console.log(`🔄 Trying proxy: ${proxyUrl}`)
        
        const result = await this.makeHttpsRequest(proxyUrl, {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://puzzlerank.pro'
        })
        
        // 处理不同代理服务的响应格式
        if (proxyUrl.includes('allorigins.win')) {
          const proxyResponse = JSON.parse(result)
          if (proxyResponse.status && proxyResponse.status.http_code === 200) {
            return JSON.parse(proxyResponse.contents)
          }
        } else if (proxyUrl.includes('codetabs.com')) {
          return JSON.parse(result)
        } else {
          return JSON.parse(result)
        }
        
      } catch (error) {
        console.log(`❌ Proxy ${proxyUrl} failed:`, error.message)
        continue
      }
    }
    
    throw new Error('All proxy services failed')
  }
  
  private async makeHttpsRequest(url: string, headers: Record<string, string>): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url)
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers,
        timeout: 30000
      }
      
      const req = https.request(options, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
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
      console.log(`🌐 Attempting to fetch from NYT API via proxy: ${url}`)
      
      const data: NYTWordleResponse = await this.fetchViaProxy(url)
      
      if (!data.solution || typeof data.days_since_launch !== 'number') {
        throw new Error('Invalid response format from NYT API')
      }
      
      console.log(`✅ Successfully collected from NYT API via proxy:`)
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
      console.error('❌ NYT Proxy API collection failed:', error)
      
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