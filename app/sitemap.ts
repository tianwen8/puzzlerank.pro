import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
  
  return [
    // 首页 - 最高优先级
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Wordle Daily Hints - 核心功能页面，高优先级
    {
      url: `${baseUrl}/daily-hints`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // 策略页面
    {
      url: `${baseUrl}/strategy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    
    // 游戏指南页面
    {
      url: `${baseUrl}/guide/how-to-play`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // 排名指南页面
    {
      url: `${baseUrl}/guide/rankings`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // 统计指南页面
    {
      url: `${baseUrl}/guide/stats`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // 关于页面
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
