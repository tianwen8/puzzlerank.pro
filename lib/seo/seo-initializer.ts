import { sitemapScheduler } from './sitemap-scheduler'

/**
 * SEO系统初始化器
 * 在应用启动时自动启动SEO相关服务
 */
export class SEOInitializer {
  private static instance: SEOInitializer
  private initialized = false

  private constructor() {}

  static getInstance(): SEOInitializer {
    if (!SEOInitializer.instance) {
      SEOInitializer.instance = new SEOInitializer()
    }
    return SEOInitializer.instance
  }

  /**
   * 初始化SEO系统
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🔄 SEO system already initialized')
      return
    }

    try {
      console.log('🚀 Initializing SEO system...')

      // 检查环境变量
      const hasGoogleCredentials = this.checkGoogleCredentials()
      
      if (hasGoogleCredentials) {
        // 启动sitemap调度器
        await sitemapScheduler.startScheduler()
        console.log('✅ Sitemap scheduler started')
      } else {
        console.warn('⚠️ Google API credentials not found, SEO automation disabled')
        console.log('💡 To enable SEO automation, set these environment variables:')
        console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL')
        console.log('   - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
        console.log('   - GOOGLE_PROJECT_ID')
      }

      this.initialized = true
      console.log('✅ SEO system initialized successfully')

    } catch (error) {
      console.error('❌ Failed to initialize SEO system:', error)
    }
  }

  /**
   * 检查Google API凭据
   */
  private checkGoogleCredentials(): boolean {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    const projectId = process.env.GOOGLE_PROJECT_ID

    return !!(email && privateKey && projectId)
  }

  /**
   * 停止SEO系统
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return
    }

    try {
      console.log('🛑 Shutting down SEO system...')
      
      sitemapScheduler.stopScheduler()
      
      this.initialized = false
      console.log('✅ SEO system shutdown complete')
    } catch (error) {
      console.error('❌ Error during SEO system shutdown:', error)
    }
  }

  /**
   * 获取系统状态
   */
  getStatus(): {
    initialized: boolean
    hasGoogleCredentials: boolean
    schedulerStatus: any
  } {
    return {
      initialized: this.initialized,
      hasGoogleCredentials: this.checkGoogleCredentials(),
      schedulerStatus: sitemapScheduler.getStatus()
    }
  }
}

// 导出单例实例
export const seoInitializer = SEOInitializer.getInstance()

// 在服务器启动时自动初始化（仅在服务器端）
if (typeof window === 'undefined') {
  // 延迟初始化，避免阻塞应用启动
  setTimeout(() => {
    seoInitializer.initialize().catch(console.error)
  }, 5000)
}