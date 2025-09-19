import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Lightbulb, History, Play, TrendingUp, Users, Target, BookOpen } from 'lucide-react'
import WordleHintsStructuredData from '@/components/wordle-hints-structured-data'
import WordleAnswerHints from '@/components/wordle-answer-hints'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// This is a server component - no "use client"
async function getWordleData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get today's data
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]

  // Get the most recent verified answer
  const { data: todayData } = await supabase
    .from('wordle_predictions')
    .select('*')
    .eq('status', 'verified')
    .order('game_number', { ascending: false })
    .limit(1)
    .single()

  // Get recent history (last 10 games)
  const { data: historyData } = await supabase
    .from('wordle_predictions')
    .select('*')
    .eq('status', 'verified')
    .order('game_number', { ascending: false })
    .limit(10)

  return { todayData, historyData }
}

export async function generateMetadata(): Promise<Metadata> {
  const { todayData } = await getWordleData()

  if (!todayData) {
    return {
      title: 'Today\'s Wordle Answer - Daily Solution & Hints',
      description: 'Get today\'s Wordle answer with hints and strategies. Updated daily with verified solutions.',
    }
  }

  const date = new Date(todayData.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return {
    title: `Wordle Answer Today ${date} - Game #${todayData.game_number} Solution`,
    description: `Today's Wordle answer for ${date} is ${todayData.verified_word}. Get hints, tips, and strategies for Wordle #${todayData.game_number}.`,
    openGraph: {
      title: `Wordle #${todayData.game_number} Answer - ${date}`,
      description: `Find today's Wordle answer with hints and tips. Solution for puzzle #${todayData.game_number}.`,
      type: 'article',
      publishedTime: todayData.created_at,
      modifiedTime: todayData.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Wordle #${todayData.game_number} Answer`,
      description: `Today's Wordle solution with hints and strategies`,
    },
    alternates: {
      canonical: '/todays-wordle-answer',
    },
  }
}

export default async function TodaysWordleAnswerPage() {
  const { todayData, historyData } = await getWordleData()

  if (!todayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No Wordle data available yet. Please check back later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const answer = todayData.verified_word || todayData.predicted_word || 'UNKNOWN'
  const gameDate = new Date(todayData.date)
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Ensure hints have proper structure
  const hints = todayData.hints || {
    firstLetter: answer[0],
    length: answer.length,
    vowels: answer.split('').filter((char: string) => 'AEIOU'.includes(char)),
    consonants: answer.split('').filter((char: string) => /[A-Z]/.test(char) && !'AEIOU'.includes(char)),
    wordType: 'common word',
    difficulty: 'Medium',
    clues: [
      `This word starts with the letter ${answer[0]}`,
      `This word has ${answer.length} letters`,
      `Contains ${answer.split('').filter((char: string) => 'AEIOU'.includes(char)).length} vowels`
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <WordleHintsStructuredData />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Wordle Answer Today - Daily Solution & Hints Updated
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Get today's verified Wordle answer instantly! Daily solutions with hints, tips & unlimited practice updated every day.
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-semibold">
              Game #{todayData.game_number} - {formattedDate}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Today's Answer Section */}
        <div className="space-y-8 mb-12">
          <WordleAnswerHints
            gameNumber={todayData.game_number}
            date={todayData.date}
            answer={answer}
            hints={hints}
            status={todayData.status as 'verified' | 'candidate' | 'rejected'}
            confidence={todayData.confidence_score || 1.0}
          />

          {/* Strategies Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-semibold">Winning Strategies</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="text-gray-700">Start with vowel-rich words like ADIEU or AUDIO</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="text-gray-700">Use elimination strategy for consonants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="text-gray-700">Consider letter frequency in English</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent Answers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Wordle Answers
            </CardTitle>
            <Link
              href="/wordle-archive"
              className="text-sm text-blue-600 hover:text-blue-700 ml-auto"
            >
              View Full Archive →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historyData?.slice(1, 6).map((entry: any) => {
                const entryAnswer = entry.verified_word || entry.predicted_word || 'UNKNOWN'
                const entryDate = new Date(entry.date)

                return (
                  <div key={entry.game_number} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500">#{entry.game_number}</div>
                      <div className="font-mono text-lg font-bold text-gray-800">{entryAnswer}</div>
                      <Badge variant="outline" className="text-xs">
                        {entry.hints?.difficulty || 'Medium'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500">
                        {entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <Link
                        href={`/wordle/${entry.game_number}`}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Link to Archive */}
            <div className="mt-6 text-center">
              <Link
                href="/wordle-archive"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <History className="w-4 h-4 mr-2" />
                View Complete Wordle Archive
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* SEO Content Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-100 to-purple-100">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Why Our Answers Are Reliable</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Daily Verification</h3>
                  <p className="text-sm text-gray-600">Every answer is verified against official Wordle sources</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Real-time Updates</h3>
                  <p className="text-sm text-gray-600">Answers updated immediately when available</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Community Trusted</h3>
                  <p className="text-sm text-gray-600">Thousands of players rely on our daily solutions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">Strategy Included</h3>
                  <p className="text-sm text-gray-600">Get hints and tips to improve your game</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}