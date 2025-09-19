import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Search, TrendingUp, Archive, Filter } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Wordle Answer Archive - Complete Historical Solutions',
  description: 'Browse complete Wordle answer archive with all historical solutions, hints, and difficulty ratings. Search past Wordle puzzles by date or game number.',
  openGraph: {
    title: 'Complete Wordle Answer Archive',
    description: 'All historical Wordle solutions with detailed analysis and hints',
    type: 'website',
  },
  alternates: {
    canonical: '/wordle-archive',
  },
}

async function getWordleArchive() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get all verified games, ordered by most recent first
  const { data: games } = await supabase
    .from('wordle_predictions')
    .select('*')
    .eq('status', 'verified')
    .order('game_number', { ascending: false })

  // Get statistics
  const total = games?.length || 0
  const difficultyStats = games?.reduce((acc, game) => {
    const difficulty = game.hints?.difficulty || 'Medium'
    acc[difficulty] = (acc[difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return { games: games || [], total, difficultyStats }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800'
    case 'hard':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

export default async function WordleArchivePage() {
  const { games, total, difficultyStats } = await getWordleArchive()

  // Group games by month for better organization
  const gamesByMonth = games.reduce((acc, game) => {
    const date = new Date(game.date)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
    const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        games: []
      }
    }
    acc[monthKey].games.push(game)
    return acc
  }, {} as Record<string, { name: string; games: any[] }>)

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Wordle Answer Archive',
    description: 'Complete archive of all Wordle puzzle solutions with hints and analysis',
    url: 'https://puzzlerank.pro/wordle-archive',
    numberOfItems: total,
    about: {
      '@type': 'Game',
      name: 'Wordle',
      description: 'Daily word puzzle game',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Wordle Answer Archive
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Complete collection of all Wordle puzzles with solutions, hints, and analysis
              </p>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <Archive className="w-5 h-5 mr-2" />
                <span className="font-semibold">{total} Wordle Puzzles Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{total}</div>
                <div className="text-sm text-gray-600">Total Puzzles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {difficultyStats.Easy || 0}
                </div>
                <div className="text-sm text-gray-600">Easy Puzzles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {difficultyStats.Medium || 0}
                </div>
                <div className="text-sm text-gray-600">Medium Puzzles</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {difficultyStats.Hard || 0}
                </div>
                <div className="text-sm text-gray-600">Hard Puzzles</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/todays-wordle-answer"
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-800">Today's Answer</div>
                    <div className="text-sm text-blue-600">Get today's solution</div>
                  </div>
                </Link>
                <Link
                  href={`/wordle/${games[0]?.game_number || ''}`}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Latest Puzzle</div>
                    <div className="text-sm text-green-600">#{games[0]?.game_number || 'N/A'}</div>
                  </div>
                </Link>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-800">Search Coming Soon</div>
                    <div className="text-sm text-purple-600">Filter by difficulty/date</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archive by Month */}
          <div className="space-y-8">
            {Object.entries(gamesByMonth)
              .sort(([a], [b]) => b.localeCompare(a)) // Sort by month descending
              .map(([monthKey, monthData]) => {
                const typedMonthData = monthData as { name: string; games: any[] }
                return (
                <Card key={monthKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {typedMonthData.name}
                      <Badge variant="outline" className="ml-auto">
                        {typedMonthData.games.length} puzzles
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {typedMonthData.games.map((game) => {
                        const answer = game.verified_word || game.predicted_word || 'UNKNOWN'
                        const gameDate = new Date(game.date)
                        const difficulty = game.hints?.difficulty || 'Medium'

                        return (
                          <Link
                            key={game.game_number}
                            href={`/wordle/${game.game_number}`}
                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-gray-500 min-w-0">
                                #{game.game_number}
                              </div>
                              <div className="font-mono text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {answer}
                              </div>
                              <Badge className={getDifficultyColor(difficulty)}>
                                {difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-gray-500">
                                {gameDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="text-xs bg-blue-600 group-hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors">
                                View Details
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
                )
              })}
          </div>

          {/* SEO Content */}
          <Card className="mt-12 bg-gradient-to-r from-blue-100 to-purple-100">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Master Wordle with Historical Data
              </h2>
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">
                  Our comprehensive Wordle archive contains every puzzle solution with detailed analysis and hints.
                  Use this treasure trove of data to improve your Wordle strategy and learn from past puzzles.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What You'll Find:</h3>
                    <ul className="space-y-2">
                      <li>• Complete solutions for every Wordle puzzle</li>
                      <li>• Difficulty ratings and letter analysis</li>
                      <li>• Strategic hints and solving tips</li>
                      <li>• Historical patterns and trends</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Improve Your Game:</h3>
                    <ul className="space-y-2">
                      <li>• Study common letter combinations</li>
                      <li>• Learn from challenging puzzles</li>
                      <li>• Understand word patterns</li>
                      <li>• Practice with unlimited games</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}