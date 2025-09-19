import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Lightbulb, ArrowLeft, ArrowRight, Calendar, Trophy } from 'lucide-react'
import WordleAnswerHints from '@/components/wordle-answer-hints'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

async function getWordleGame(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Support both game number and date formats
  let query = supabase
    .from('wordle_predictions')
    .select('*')
    .eq('status', 'verified')

  // Check if id is a number (game number) or date
  if (/^\d+$/.test(id)) {
    query = query.eq('game_number', parseInt(id))
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(id)) {
    query = query.eq('date', id)
  } else {
    return null
  }

  const { data } = await query.single()
  return data
}

async function getAdjacentGames(gameNumber: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [prevResult, nextResult] = await Promise.all([
    supabase
      .from('wordle_predictions')
      .select('game_number, date, verified_word')
      .eq('status', 'verified')
      .eq('game_number', gameNumber - 1)
      .single(),
    supabase
      .from('wordle_predictions')
      .select('game_number, date, verified_word')
      .eq('status', 'verified')
      .eq('game_number', gameNumber + 1)
      .single()
  ])

  return {
    previous: prevResult.data,
    next: nextResult.data
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = await getWordleGame(params.id)

  if (!game) {
    return {
      title: 'Wordle Answer Not Found',
      description: 'This Wordle answer is not available.',
    }
  }

  const date = new Date(game.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const answer = game.verified_word || game.predicted_word

  return {
    title: `Wordle #${game.game_number} Answer (${date}) - ${answer}`,
    description: `Wordle puzzle #${game.game_number} answer for ${date} is ${answer}. Get complete hints, letter analysis, and solving strategies.`,
    openGraph: {
      title: `Wordle #${game.game_number} - ${answer}`,
      description: `The answer to Wordle puzzle #${game.game_number} (${date}) with detailed hints and analysis.`,
      type: 'article',
      publishedTime: game.created_at,
      modifiedTime: game.updated_at,
    },
    twitter: {
      card: 'summary',
      title: `Wordle #${game.game_number}: ${answer}`,
      description: `Solution for Wordle puzzle #${game.game_number} - ${date}`,
    },
    alternates: {
      canonical: `/wordle/${game.game_number}`,
    },
  }
}

// Generate static params for the most recent 100 games
export async function generateStaticParams() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('wordle_predictions')
    .select('game_number')
    .eq('status', 'verified')
    .order('game_number', { ascending: false })
    .limit(100)

  return (data || []).map((game) => ({
    id: game.game_number.toString(),
  }))
}

export default async function WordleAnswerPage({ params }: Props) {
  const game = await getWordleGame(params.id)

  if (!game) {
    notFound()
  }

  const answer = game.verified_word || game.predicted_word || 'UNKNOWN'
  const gameDate = new Date(game.date)
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Get adjacent games for navigation
  const { previous, next } = await getAdjacentGames(game.game_number)

  // Ensure hints have proper structure
  const hints = game.hints || {
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

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Wordle #${game.game_number} Answer: ${answer}`,
    description: `Solution and hints for Wordle puzzle #${game.game_number} on ${formattedDate}`,
    datePublished: game.created_at,
    dateModified: game.updated_at,
    author: {
      '@type': 'Organization',
      name: 'PuzzleRank',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://puzzlerank.pro/wordle/${game.game_number}`,
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/wordle-archive"
                className="flex items-center text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Archive
              </Link>
              <Link
                href="/todays-wordle-answer"
                className="text-white/80 hover:text-white transition-colors"
              >
                Today's Answer →
              </Link>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Wordle #{game.game_number} Answer
              </h1>
              <p className="text-xl opacity-90 mb-4">{formattedDate}</p>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <Trophy className="w-5 h-5 mr-2" />
                <span className="font-mono text-2xl font-bold">{answer}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation between puzzles */}
          <div className="flex justify-between items-center mb-8">
            {previous ? (
              <Link
                href={`/wordle/${previous.game_number}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Previous</div>
                  <div className="font-semibold">#{previous.game_number}: {previous.verified_word}</div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/wordle/${next.game_number}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <div className="text-right">
                  <div className="text-xs text-gray-500">Next</div>
                  <div className="font-semibold">#{next.game_number}: {next.verified_word}</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <WordleAnswerHints
              gameNumber={game.game_number}
              date={game.date}
              answer={answer}
              hints={hints}
              status={game.status as 'verified' | 'candidate' | 'rejected'}
              confidence={game.confidence_score || 1.0}
            />

            {/* Word Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Word Analysis for {answer}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Letter Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Total Letters</span>
                        <span className="font-semibold">{answer.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Unique Letters</span>
                        <span className="font-semibold">{new Set(answer.split('')).size}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Vowels</span>
                        <span className="font-semibold">
                          {answer.split('').filter((char: string) => 'AEIOU'.includes(char)).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Consonants</span>
                        <span className="font-semibold">
                          {answer.split('').filter((char: string) => /[A-Z]/.test(char) && !'AEIOU'.includes(char)).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Solving Strategy</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Badge className="mt-1">Tip 1</Badge>
                        <p className="text-sm text-gray-600">
                          This word could have been found by starting with common letters like E, A, R, I, O.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="mt-1">Tip 2</Badge>
                        <p className="text-sm text-gray-600">
                          {answer.split('').filter((c: string, i: number, arr: string[]) => arr.indexOf(c) !== i).length > 0
                            ? 'Watch out for repeated letters in this word.'
                            : 'All letters in this word are unique, making it easier to solve.'}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="mt-1">Tip 3</Badge>
                        <p className="text-sm text-gray-600">
                          Consider the word type and context clues from the hints above.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Puzzle Information</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Game Number:</span>
                    <span className="font-semibold ml-2">#{game.game_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold ml-2">{gameDate.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Difficulty:</span>
                    <Badge variant="outline" className="ml-2">
                      {hints.difficulty || 'Medium'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center space-y-4">
              <Link
                href="/?game=wordle&mode=infinite"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Practice with Unlimited Wordle
              </Link>
              <div className="text-sm text-gray-600">
                Want to improve? Try our unlimited practice mode!
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}