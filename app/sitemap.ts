import { MetadataRoute } from 'next'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
  const currentDate = new Date()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Today's Wordle Answer - core functionality page, highest priority
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
    
    // Strategy page
    {
      url: `${baseUrl}/strategy`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    
    // Guide pages
    {
      url: `${baseUrl}/guide/how-to-play`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // Rankings guide page
    {
      url: `${baseUrl}/guide/rankings`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // Stats guide page
    {
      url: `${baseUrl}/guide/stats`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // About page
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // Privacy policy
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    
    // Terms of service
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    
    // 动态生成所有Wordle游戏期数页面
    ...(await generateWordleGamePages(baseUrl)),
  ]

  // Dynamic Wordle game pages
  let gamePages: MetadataRoute.Sitemap = []
  
  try {
    // Get all games from database
    const games = await WordlePredictionDB.getAllGames()
    const today = new Date().toDateString()
    
    gamePages = games.map((game) => {
      const gameDate = new Date(game.date)
      const isToday = gameDate.toDateString() === today
      
      return {
        url: `${baseUrl}/wordle/${game.game_number}`,
        lastModified: gameDate,
        changeFrequency: 'daily' as const,
        priority: isToday ? 0.95 : 0.85,
      }
    })
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error)
    // Fallback: generate entries for recent games
    const fallbackGames = []
    const startGame = Math.max(1, new Date().getTime() / (1000 * 60 * 60 * 24) - 18262 - 30) // Last 30 days approx
    const endGame = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24) - 18262) // Today approx
    
    for (let i = Math.floor(startGame); i <= endGame; i++) {
      const gameDate = new Date()
      gameDate.setDate(gameDate.getDate() - (endGame - i))
      
      fallbackGames.push({
        url: `${baseUrl}/wordle/${i}`,
        lastModified: gameDate,
        changeFrequency: 'daily' as const,
        priority: i === endGame ? 0.95 : 0.85,
      })
    }
    
    gamePages = fallbackGames
  }

  return [...staticPages, ...gamePages]
}

// 生成所有Wordle游戏期数页面的sitemap条目
async function generateWordleGamePages(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  try {
    // 获取所有已验证的Wordle预测数据
    const predictions = await WordlePredictionDB.getHistoryPredictions(1000) // 获取最近1000个
    
    return predictions
      .filter(p => p.verified_word && p.status === 'verified')
      .map(p => {
        const isRecent = new Date(p.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
        const isToday = new Date(p.date).toDateString() === new Date().toDateString()
        
        return {
          url: `${baseUrl}/wordle-${p.game_number}`,
          lastModified: new Date(p.updated_at || p.date),
          changeFrequency: isToday ? 'hourly' as const : isRecent ? 'daily' as const : 'weekly' as const,
          priority: isToday ? 0.95 : isRecent ? 0.85 : 0.75,
        }
      })
      .sort((a, b) => {
        // 按游戏期数降序排列（最新的在前）
        const gameNumberA = parseInt(a.url.split('/wordle-')[1])
        const gameNumberB = parseInt(b.url.split('/wordle-')[1])
        return gameNumberB - gameNumberA
      })
  } catch (error) {
    console.error('生成Wordle游戏页面sitemap失败:', error)
    return []
  }
}
