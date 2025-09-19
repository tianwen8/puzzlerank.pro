import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting cache revalidation...')

    // Get the request body to understand what needs to be revalidated
    const body = await request.json().catch(() => ({}))
    const { paths, gameNumber, all = false } = body

    const revalidatedPaths: string[] = []

    if (all || !paths) {
      // Revalidate all important pages
      const allPaths = [
        '/', // Homepage
        '/todays-wordle-answer', // Today's answer
        '/wordle-archive', // Archive page
        '/sitemap.xml' // Sitemap
      ]

      for (const path of allPaths) {
        try {
          revalidatePath(path)
          revalidatedPaths.push(path)
          console.log(`✅ Revalidated: ${path}`)
        } catch (error) {
          console.error(`❌ Failed to revalidate ${path}:`, error)
        }
      }

      // If a specific game number is provided, also revalidate that page
      if (gameNumber) {
        try {
          revalidatePath(`/wordle/${gameNumber}`)
          revalidatedPaths.push(`/wordle/${gameNumber}`)
          console.log(`✅ Revalidated: /wordle/${gameNumber}`)
        } catch (error) {
          console.error(`❌ Failed to revalidate /wordle/${gameNumber}:`, error)
        }
      }
    } else if (Array.isArray(paths)) {
      // Revalidate specific paths
      for (const path of paths) {
        try {
          revalidatePath(path)
          revalidatedPaths.push(path)
          console.log(`✅ Revalidated: ${path}`)
        } catch (error) {
          console.error(`❌ Failed to revalidate ${path}:`, error)
        }
      }
    }

    // Also revalidate any cache tags if needed
    try {
      revalidateTag('wordle-data')
      console.log('✅ Revalidated cache tag: wordle-data')
    } catch (error) {
      console.error('❌ Failed to revalidate cache tag:', error)
    }

    console.log(`🎉 Cache revalidation completed for ${revalidatedPaths.length} paths`)

    return NextResponse.json({
      success: true,
      message: `Successfully revalidated ${revalidatedPaths.length} paths`,
      data: {
        revalidatedPaths,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Cache revalidation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  const gameNumber = searchParams.get('gameNumber')

  // Convert query params to body format
  const body = {
    paths: path ? [path] : undefined,
    gameNumber: gameNumber ? parseInt(gameNumber) : undefined,
    all: searchParams.get('all') === 'true'
  }

  // Create a new request with the body
  const mockRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  return POST(mockRequest as NextRequest)
}