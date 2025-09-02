import { NextRequest, NextResponse } from 'next/server'
import { notifySearchEngines, notifyNewWordleAnswer } from '@/lib/seo-notification'

/**
 * POST /api/seo/notify
 * 通知搜索引擎sitemap更新或新内容
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, gameNumber, urls } = body

    let result

    switch (type) {
      case 'sitemap':
        // 通知sitemap更新
        result = await notifySearchEngines()
        break
        
      case 'new-wordle-answer':
        // 通知新的Wordle答案
        if (!gameNumber) {
          return NextResponse.json(
            { error: 'Game number is required for new-wordle-answer type' },
            { status: 400 }
          )
        }
        result = await notifyNewWordleAnswer(gameNumber)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid notification type. Use "sitemap" or "new-wordle-answer"' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Search engines notified successfully' : 'Some notifications failed',
      results: result.results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('SEO notification error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/seo/notify
 * 获取SEO通知服务状态
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: 'active',
      endpoints: {
        notify_sitemap: 'POST /api/seo/notify with {"type": "sitemap"}',
        notify_new_answer: 'POST /api/seo/notify with {"type": "new-wordle-answer", "gameNumber": 1536}'
      },
      search_engines: [
        { name: 'Google', enabled: true },
        { name: 'Bing', enabled: true },
        { name: 'Yandex', enabled: false }
      ],
      last_check: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get service status' },
      { status: 500 }
    )
  }
}