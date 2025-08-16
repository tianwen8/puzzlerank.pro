import { DateTime } from 'luxon'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

export class NYTDirectCollector {
  private readonly baseUrl = 'https://www.nytimes.com/svc/wordle/v2'

  private getCandidateDates(): string[] {
    // Get New Zealand date (earliest timezone) and US Eastern date as fallback
    const nzDate = DateTime.now().setZone('Pacific/Auckland').toISODate()!
    const usDate = DateTime.now().setZone('America/New_York').toISODate()!
    
    // Return unique dates, NZ first (priority)
    return Array.from(new Set([nzDate, usDate]))
  }

  private async fetchNYTDirect(dateStr: string): Promise<NYTWordleResponse> {
    const url = `${this.baseUrl}/${dateStr}.json`
    
    console.log(`🌐 Direct fetch from NYT API: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Referer': 'https://www.nytimes.com/games/wordle/index.html',
        'Origin': 'https://www.nytimes.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`NYT API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.solution || typeof data.id !== 'number') {
      throw new Error('Invalid response format from NYT API')
    }

    return data
  }

  private async fetchViaProxy(dateStr: string): Promise<NYTWordleResponse> {
    const originalUrl = `${this.baseUrl}/${dateStr}.json?_=${Date.now()}`
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(originalUrl)}`
    
    console.log(`🔄 Proxy fetch via AllOrigins: ${proxyUrl}`)
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Proxy service returned ${response.status}`)
    }

    const proxyResponse = await response.json()
    
    if (!proxyResponse.status || proxyResponse.status.http_code !== 200) {
      throw new Error(`Proxy request failed: ${proxyResponse.status?.http_code || 'unknown'}`)
    }

    const data = JSON.parse(proxyResponse.contents)
    
    if (!data.solution || typeof data.id !== 'number') {
      throw new Error('Invalid response format from proxied NYT API')
    }

    return data
  }

  private async fetchWordle(dateStr: string): Promise<NYTWordleResponse> {
    try {
      // Try direct connection first
      return await this.fetchNYTDirect(dateStr)
    } catch (directError) {
      console.log(`❌ Direct fetch failed: ${directError instanceof Error ? directError.message : 'Unknown error'}`)
      
      try {
        // Fallback to proxy
        return await this.fetchViaProxy(dateStr)
      } catch (proxyError) {
        console.log(`❌ Proxy fetch failed: ${proxyError instanceof Error ? proxyError.message : 'Unknown error'}`)
        throw new Error(`Both direct and proxy fetch failed. Direct: ${directError instanceof Error ? directError.message : 'Unknown'}. Proxy: ${proxyError instanceof Error ? proxyError.message : 'Unknown'}`)
      }
    }
  }

  async collectTodayAnswer(forcedDate?: string): Promise<CollectionResult> {
    const candidates = forcedDate ? [forcedDate] : this.getCandidateDates()
    
    console.log(`🎯 Attempting collection for dates: ${candidates.join(', ')}`)
    
    for (const dateStr of candidates) {
      try {
        console.log(`📅 Trying date: ${dateStr}`)
        
        const data = await this.fetchWordle(dateStr)
        
        console.log(`✅ Successfully collected from NYT API:`)
        console.log(`   Game Number: ${data.id}`)
        console.log(`   Answer: ${data.solution}`)
        console.log(`   Date: ${data.print_date}`)
        console.log(`   Editor: ${data.editor || 'N/A'}`)
        
        return {
          success: true,
          data: {
            gameNumber: data.days_since_launch,
            answer: data.solution.toUpperCase(),
            date: data.print_date || dateStr
          }
        }
        
      } catch (error) {
        console.log(`❌ Failed to collect for date ${dateStr}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        continue
      }
    }
    
    return {
      success: false,
      error: `Failed to collect from all candidate dates: ${candidates.join(', ')}`
    }
  }

  async collectHistoricalAnswer(dateStr: string): Promise<CollectionResult> {
    return this.collectTodayAnswer(dateStr)
  }
}