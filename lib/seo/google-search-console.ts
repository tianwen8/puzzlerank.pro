import { google } from 'googleapis'

interface SitemapSubmissionResult {
  success: boolean
  message: string
  submittedAt?: Date
}

interface IndexingResult {
  success: boolean
  message: string
  indexedUrls?: string[]
  failedUrls?: string[]
}

export class GoogleSearchConsoleAPI {
  private searchConsole: any
  private siteUrl: string

  constructor() {
    this.siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
    
    // 初始化Google API客户端
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: [
        'https://www.googleapis.com/auth/webmasters',
        'https://www.googleapis.com/auth/indexing'
      ],
    })

    this.searchConsole = google.searchconsole({ version: 'v1', auth })
  }

  /**
   * 提交sitemap到Google Search Console
   */
  async submitSitemap(sitemapUrl?: string): Promise<SitemapSubmissionResult> {
    try {
      const sitemap = sitemapUrl || `${this.siteUrl}/sitemap.xml`
      
      await this.searchConsole.sitemaps.submit({
        siteUrl: this.siteUrl,
        feedpath: sitemap,
      })

      console.log(`✅ Sitemap submitted successfully: ${sitemap}`)
      
      return {
        success: true,
        message: `Sitemap submitted successfully: ${sitemap}`,
        submittedAt: new Date()
      }
    } catch (error: any) {
      console.error('❌ Failed to submit sitemap:', error)
      return {
        success: false,
        message: `Failed to submit sitemap: ${error.message}`
      }
    }
  }

  /**
   * 获取sitemap状态
   */
  async getSitemapStatus(): Promise<any> {
    try {
      const response = await this.searchConsole.sitemaps.list({
        siteUrl: this.siteUrl,
      })

      return {
        success: true,
        sitemaps: response.data.sitemap || []
      }
    } catch (error: any) {
      console.error('❌ Failed to get sitemap status:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 请求Google索引特定URL
   */
  async requestIndexing(urls: string[]): Promise<IndexingResult> {
    try {
      const indexing = google.indexing({ version: 'v3', auth: this.searchConsole.auth })
      const results = []
      const failed = []

      for (const url of urls) {
        try {
          await indexing.urlNotifications.publish({
            requestBody: {
              url: url,
              type: 'URL_UPDATED'
            }
          })
          results.push(url)
          console.log(`✅ Requested indexing for: ${url}`)
        } catch (error: any) {
          console.error(`❌ Failed to request indexing for ${url}:`, error.message)
          failed.push(url)
        }
      }

      return {
        success: results.length > 0,
        message: `Requested indexing for ${results.length}/${urls.length} URLs`,
        indexedUrls: results,
        failedUrls: failed
      }
    } catch (error: any) {
      console.error('❌ Failed to request indexing:', error)
      return {
        success: false,
        message: `Failed to request indexing: ${error.message}`
      }
    }
  }

  /**
   * 获取搜索分析数据
   */
  async getSearchAnalytics(startDate: string, endDate: string) {
    try {
      const response = await this.searchConsole.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query', 'page'],
          rowLimit: 1000,
        }
      })

      return {
        success: true,
        data: response.data.rows || []
      }
    } catch (error: any) {
      console.error('❌ Failed to get search analytics:', error)
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 检查URL索引状态
   */
  async checkIndexStatus(url: string) {
    try {
      const response = await this.searchConsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl: this.siteUrl
        }
      })

      return {
        success: true,
        data: response.data
      }
    } catch (error: any) {
      console.error(`❌ Failed to check index status for ${url}:`, error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}

// 导出单例实例
export const googleSearchConsole = new GoogleSearchConsoleAPI()