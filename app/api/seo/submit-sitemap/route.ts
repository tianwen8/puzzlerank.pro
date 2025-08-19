import { NextRequest, NextResponse } from 'next/server'
import { googleSearchConsole } from '@/lib/seo/google-search-console'
import { sitemapScheduler } from '@/lib/seo/sitemap-scheduler'

export async function POST(request: NextRequest) {
  try {
    const { action, sitemapUrl } = await request.json()

    switch (action) {
      case 'submit':
        const result = await googleSearchConsole.submitSitemap(sitemapUrl)
        return NextResponse.json(result)

      case 'status':
        const status = await googleSearchConsole.getSitemapStatus()
        return NextResponse.json(status)

      case 'manual':
        await sitemapScheduler.manualSubmission()
        return NextResponse.json({ 
          success: true, 
          message: 'Manual sitemap submission triggered' 
        })

      case 'scheduler-status':
        const schedulerStatus = sitemapScheduler.getStatus()
        return NextResponse.json(schedulerStatus)

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('SEO API error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        const status = await googleSearchConsole.getSitemapStatus()
        return NextResponse.json(status)

      case 'analytics':
        const startDate = searchParams.get('startDate') || '2024-01-01'
        const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
        const analytics = await googleSearchConsole.getSearchAnalytics(startDate, endDate)
        return NextResponse.json(analytics)

      case 'scheduler':
        const schedulerStatus = sitemapScheduler.getStatus()
        return NextResponse.json(schedulerStatus)

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('SEO API error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}