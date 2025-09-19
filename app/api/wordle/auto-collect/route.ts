import { NextRequest, NextResponse } from 'next/server'
import { NYTProxyCollector } from '@/lib/nyt-proxy-collector'
import { AnswerHintGenerator } from '@/lib/answer-hint-generator'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting automatic Wordle collection...')
    
    // Get current times for different timezones
    const utcTime = new Date()
    const beijingTime = new Date(utcTime.getTime() + 8 * 60 * 60 * 1000)
    const beijingHour = beijingTime.getHours()
    const beijingMinute = beijingTime.getMinutes()
    
    // Calculate New Zealand time (NZST=UTC+12 in winter, NZDT=UTC+13 in summer)
    // September is spring/summer in NZ, so UTC+13 (NZDT)
    const nzTime = new Date(utcTime.getTime() + 13 * 60 * 60 * 1000)
    
    // Use New Zealand date as target date since Wordle releases at NZ midnight
    let targetDate = new Date(nzTime)
    const dateStr = targetDate.toISOString().split('T')[0]
    
    console.log(`⏰ Beijing Time: ${beijingTime.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})} (${beijingHour}:${beijingMinute.toString().padStart(2, '0')})`)
    console.log(`🇳🇿 New Zealand Time: ${nzTime.toLocaleString('en-NZ', {timeZone: 'Pacific/Auckland'})}`)
    console.log(`🎯 Target collection date: ${dateStr} (based on NZ date)`)
    
    // Initialize Supabase client first to check existing data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Calculate expected game number based on target date
    const launchDate = new Date('2021-06-19') // Wordle launch date
    const timeDiff = targetDate.getTime() - launchDate.getTime()
    const expectedGameNumber = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1
    
    // Check if we already have verified data for this game
    const { data: existingGame } = await supabase
      .from('wordle_predictions')
      .select('*')
      .eq('game_number', expectedGameNumber)
      .eq('status', 'verified')
      .single()
    
    if (existingGame && existingGame.verified_word) {
      console.log(`✅ Game #${expectedGameNumber} already verified with answer: ${existingGame.verified_word}`)
      return NextResponse.json({
        success: true,
        data: {
          gameNumber: expectedGameNumber,
          answer: existingGame.verified_word,
          date: dateStr,
          hints: existingGame.hints,
          action: 'already_verified',
          source: 'Database Cache'
        },
        message: `Game #${expectedGameNumber} already verified - skipping collection`
      })
    }
    
    // Initialize collectors
    const nytCollector = new NYTProxyCollector()
    const hintGenerator = new AnswerHintGenerator()
    
    // Attempt to collect from NYT Official API
    console.log('🔍 Attempting to collect from NYT Official API...')
    const collectionResult = await nytCollector.collectTodayAnswer(dateStr)
    
    if (!collectionResult.success) {
      console.log(`❌ Collection failed: ${collectionResult.error}`)

      return NextResponse.json({
        success: false,
        error: 'Failed to collect from NYT Official API',
        details: collectionResult.error,
        nzTime: nzTime.toLocaleString('en-NZ', {timeZone: 'Pacific/Auckland'}),
        beijingTime: `${beijingHour}:${beijingMinute.toString().padStart(2, '0')}`
      }, { status: 500 })
    }
    
    console.log('✅ Successfully collected from NYT Official API:', collectionResult.data)
    
    const { gameNumber, answer, date } = collectionResult.data!
    
    // Validate that the collected game number matches our expectation
    if (Math.abs(gameNumber - expectedGameNumber) > 1) {
      console.warn(`⚠️ Game number mismatch: expected ~${expectedGameNumber}, got ${gameNumber}`)
    }
    
    // Generate hints for the answer
    const hints = hintGenerator.generateHints(answer)
    
    // Check if this specific game already exists in database
    const { data: gameExists } = await supabase
      .from('wordle_predictions')
      .select('*')
      .eq('game_number', gameNumber)
      .single()
    
    if (gameExists) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('wordle_predictions')
        .update({
          verified_word: answer,
          status: 'verified',
          confidence_score: 1.0,
          verification_sources: ['NYT Official API'],
          hints: hints,
          updated_at: new Date().toISOString()
        })
        .eq('game_number', gameNumber)
      
      if (updateError) {
        throw new Error(`Failed to update existing game: ${updateError.message}`)
      }
      
      console.log(`📝 Updated existing game #${gameNumber} with answer: ${answer}`)
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('wordle_predictions')
        .insert({
          game_number: gameNumber,
          date: date,
          predicted_word: answer,
          verified_word: answer,
          status: 'verified',
          confidence_score: 1.0,
          verification_sources: ['NYT Official API'],
          hints: hints,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) {
        throw new Error(`Failed to insert new game: ${insertError.message}`)
      }
      
      console.log(`➕ Inserted new game #${gameNumber} with answer: ${answer}`)
    }
    
    // Trigger page regeneration and sitemap update for new data
    const isNewData = !gameExists
    if (isNewData) {
      try {
        console.log('🔄 Triggering page regeneration for new data...')

        // Trigger cache revalidation for key pages
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.url.split('/api')[0]
        await fetch(`${baseUrl}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameNumber,
            all: true // Revalidate all important pages
          })
        }).catch(error => {
          console.warn('⚠️ Failed to trigger cache revalidation:', error.message)
        })

        // Trigger sitemap update
        await fetch(`${baseUrl}/api/sitemap/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(error => {
          console.warn('⚠️ Failed to trigger sitemap update:', error.message)
        })

        console.log('✅ Page regeneration and sitemap update triggered')
      } catch (error) {
        console.warn('⚠️ Post-collection tasks failed:', error)
        // Don't fail the main collection process for these
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        gameNumber,
        answer,
        date,
        hints,
        action: gameExists ? 'updated' : 'inserted',
        source: 'NYT Official API',
        beijingTime: `${beijingHour}:${beijingMinute.toString().padStart(2, '0')}`,
        regenerationTriggered: isNewData
      },
      message: `🎉 Successfully collected and stored Wordle #${gameNumber} from NYT Official API`
    })
    
  } catch (error) {
    console.error('💥 Auto-collection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// Allow manual trigger via POST
export async function POST(request: NextRequest) {
  return GET(request)
}