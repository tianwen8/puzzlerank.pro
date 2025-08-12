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

export class NYTOfficialCollectorFixed {
  private readonly baseUrl = 'https://www.nytimes.com/svc/wordle/v2'
  
  private async makeRequest(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url)
      
      // 配置 HTTPS 选项，解决 TLS 问题
      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: 'GET',
        headers: {
          // 完全模拟浏览器请求头
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
        // 重要：配置 TLS 选项
        rejectUnauthorized: true,
        secureProtocol: 'TLSv1_2_method',
        ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384',
        timeout: 30000
      }
      
      console.log(`Making HTTPS request to: ${url}`)
      console.log(`Request options:`, {
        hostname: options.hostname,
        path: options.path,
        headers: options.headers
      })
      
      const req = https.request(options, (res) => {
        let data = ''
        
        console.log(`Response status: ${res.statusCode}`)
        console.log(`Response headers:`, res.headers)
        
        // 处理 gzip 压缩
        let stream = res
        if (res.headers['content-encoding'] === 'gzip') {
          const zlib = require('zlib')
          stream = res.pipe(zlib.createGunzip())
        }
        
        stream.on('data', (chunk) => {
          data += chunk
        })
        
        stream.on('end', () => {
          try {
            if (res.statusCode === 200) {
              console.log(`Raw response data: ${data}`)
              const jsonData = JSON.parse(data)
              console.log(`Parsed JSON:`, jsonData)
              resolve(jsonData)
            } else {
              console.log(`HTTP Error ${res.statusCode}: ${data}`)
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
            }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.log(`JSON Parse Error: ${errorMessage}`)
          console.log(`Raw data: ${data}`)
          reject(new Error(`Failed to parse JSON: ${errorMessage}`))
        }
        })
        
        stream.on('error', (error) => {
          console.log(`Stream Error: ${error.message}`)
          reject(error)
        })
      })
      
      req.on('error', (error) => {
        console.log(`Request Error: ${error.message}`)
        console.log(`Error code: ${(error as any).code || 'unknown'}`)
        reject(error)
      })
      
      req.on('timeout', () => {
        console.log('Request timeout')
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
      console.log(`Starting NYT API collection for date: ${dateStr}`)
      
      const data: NYTWordleResponse = await this.makeRequest(url)
      
      if (!data.solution || typeof data.days_since_launch !== 'number') {
        throw new Error('Invalid response format from NYT API')
      }
      
      console.log(`✅ Successfully collected from NYT API:`)
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
      console.error('❌ NYT API collection failed:', error)
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