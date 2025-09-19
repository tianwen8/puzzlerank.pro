import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
  const currentDate = new Date()

  // Get dynamic Wordle game data
  let gameUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: games } = await supabase
      .from('wordle_predictions')
      .select('game_number, date, updated_at')
      .eq('status', 'verified')
      .order('game_number', { ascending: false })
      .limit(200) // Limit to most recent 200 games for performance

    if (games) {
      gameUrls = games.map(game => ({
        url: `${baseUrl}/wordle/${game.game_number}`,
        lastModified: new Date(game.updated_at || game.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Failed to load games for sitemap:', error)
  }

  const staticUrls: MetadataRoute.Sitemap = [
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

    // Wordle Archive page
    {
      url: `${baseUrl}/wordle-archive`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
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

  // Combine static and dynamic URLs
  return [...staticUrls, ...gameUrls]
}
