import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
  const currentDate = new Date()
  
  return [
    // 首页 - 最高优先级
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Today's Wordle Answer - 核心功能页面，最高优先级
    {
      url: `${baseUrl}/todays-wordle-answer`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    
    // Legacy daily-hints redirect
    {
      url: `${baseUrl}/daily-hints`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    
    // 策略页面
    {
      url: `${baseUrl}/strategy`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    
    // 游戏指南页面
    {
      url: `${baseUrl}/guide/how-to-play`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // 排名指南页面
    {
      url: `${baseUrl}/guide/rankings`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // 统计指南页面
    {
      url: `${baseUrl}/guide/stats`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // 关于页面
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // 隐私政策
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    
    // 服务条款
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
