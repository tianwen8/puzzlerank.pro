import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🗺️ Starting sitemap update and submission...')

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://puzzlerank.pro'
    const sitemapUrl = `${baseUrl}/sitemap.xml`

    // First, trigger a cache refresh by fetching our own sitemap
    console.log('📄 Refreshing sitemap cache...')
    const sitemapResponse = await fetch(sitemapUrl, {
      cache: 'no-store', // Force fresh generation
      headers: {
        'User-Agent': 'PuzzleRank-SitemapBot/1.0'
      }
    })

    if (!sitemapResponse.ok) {
      throw new Error(`Failed to refresh sitemap: ${sitemapResponse.status}`)
    }

    const sitemapContent = await sitemapResponse.text()
    const urlCount = (sitemapContent.match(/<url>/g) || []).length

    console.log(`✅ Sitemap refreshed with ${urlCount} URLs`)

    // Submit to search engines
    const submissionResults = {
      google: { status: 'not_attempted', error: null as string | null },
      bing: { status: 'not_attempted', error: null as string | null }
    }

    // Submit to Google (using IndexNow API or Google Search Console ping)
    try {
      console.log('🔍 Submitting to Google...')

      // Method 1: Google Search Console Ping (if URL is publicly accessible)
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      const googleResponse = await fetch(googlePingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'PuzzleRank-SitemapBot/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (googleResponse.ok) {
        submissionResults.google.status = 'success'
        console.log('✅ Google submission successful')
      } else {
        submissionResults.google.status = 'failed'
        submissionResults.google.error = `HTTP ${googleResponse.status}`
        console.log(`⚠️ Google submission failed: ${googleResponse.status}`)
      }
    } catch (error) {
      submissionResults.google.status = 'failed'
      submissionResults.google.error = error instanceof Error ? error.message : 'Unknown error'
      console.log(`❌ Google submission error: ${error}`)
    }

    // Submit to Bing
    try {
      console.log('🔍 Submitting to Bing...')

      const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      const bingResponse = await fetch(bingPingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'PuzzleRank-SitemapBot/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (bingResponse.ok) {
        submissionResults.bing.status = 'success'
        console.log('✅ Bing submission successful')
      } else {
        submissionResults.bing.status = 'failed'
        submissionResults.bing.error = `HTTP ${bingResponse.status}`
        console.log(`⚠️ Bing submission failed: ${bingResponse.status}`)
      }
    } catch (error) {
      submissionResults.bing.status = 'failed'
      submissionResults.bing.error = error instanceof Error ? error.message : 'Unknown error'
      console.log(`❌ Bing submission error: ${error}`)
    }

    // IndexNow submission (if API key is available)
    if (process.env.INDEXNOW_API_KEY) {
      try {
        console.log('⚡ Submitting via IndexNow...')

        const indexNowPayload = {
          host: new URL(baseUrl).hostname,
          key: process.env.INDEXNOW_API_KEY,
          keyLocation: `${baseUrl}/indexnow-${process.env.INDEXNOW_API_KEY}.txt`,
          urlList: [sitemapUrl]
        }

        const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(indexNowPayload),
          signal: AbortSignal.timeout(10000)
        })

        if (indexNowResponse.ok) {
          console.log('✅ IndexNow submission successful')
        } else {
          console.log(`⚠️ IndexNow submission failed: ${indexNowResponse.status}`)
        }
      } catch (error) {
        console.log(`❌ IndexNow submission error: ${error}`)
      }
    }

    const successCount = Object.values(submissionResults).filter(r => r.status === 'success').length
    const totalAttempts = Object.values(submissionResults).length

    return NextResponse.json({
      success: true,
      message: `Sitemap updated and submitted to ${successCount}/${totalAttempts} search engines`,
      data: {
        sitemapUrl,
        urlCount,
        submissions: submissionResults,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Sitemap update error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}