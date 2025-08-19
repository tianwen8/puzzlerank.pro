import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Lightbulb, Target, BookOpen, TrendingUp, Users } from 'lucide-react'
import WordleHintsStructuredData from '@/components/wordle-hints-structured-data'
import WordleAnswerHints from '@/components/wordle-answer-hints'
import { WordleHints } from '@/lib/supabase/types'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'

interface WordleGamePageProps {
  params: { id: string }
}

async function getWordleGameData(gameNumber: number) {
  try {
    const gameData = await WordlePredictionDB.getGameByNumber(gameNumber)
    if (!gameData) {
      return null
    }

    const answer = gameData.verified_word || gameData.predicted_word || 'UNKNOWN'
    
    // Generate hints if not available
    const generateDefaultHints = (word: string): WordleHints => {
      const vowels = word.split('').filter(char => 'AEIOU'.includes(char))
      const consonants = word.split('').filter(char => /[A-Z]/.test(char) && !'AEIOU'.includes(char))
      
      return {
        firstLetter: word[0] || 'U',
        length: word.length,
        vowels: [...new Set(vowels)],
        consonants: [...new Set(consonants)],
        wordType: 'common word',
        difficulty: 'Medium',
        clues: [
          `This word starts with the letter ${word[0]}`,
          `This word contains ${vowels.length} vowel${vowels.length !== 1 ? 's' : ''}`,
          `This word has ${word.length} letters total`
        ]
      }
    }

    let hints = gameData.hints
    if (!hints || !hints.clues || !Array.isArray(hints.clues) || hints.clues.length === 0) {
      hints = generateDefaultHints(answer)
    }

    return {
      gameNumber: gameData.game_number,
      date: gameData.date,
      answer: answer,
      status: gameData.status as 'verified' | 'candidate' | 'rejected',
      confidence: gameData.confidence_score || 1.0,
      hints: hints,
      strategies: [
        "Start with vowel-rich words like ADIEU or AUDIO",
        "Use elimination strategy for consonants",
        "Consider letter frequency in English"
      ]
    }
  } catch (error) {
    console.error('Failed to load game data:', error)
    return null
  }
}

export async function generateMetadata({ params }: WordleGamePageProps): Promise<Metadata> {
  const gameNumber = parseInt(params.id)
  if (isNaN(gameNumber)) {
    return {
      title: 'Invalid Game Number',
      description: 'The requested Wordle game number is invalid.'
    }
  }

  const gameData = await getWordleGameData(gameNumber)
  if (!gameData) {
    return {
      title: `Wordle #${gameNumber} - Game Not Found`,
      description: `Wordle game #${gameNumber} data is not available yet.`
    }
  }

  const formattedDate = new Date(gameData.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return {
    title: `Wordle #${gameNumber} Answer - ${formattedDate} | Daily Solution & Hints`,
    description: `Get Wordle #${gameNumber} answer with verified hints and tips. Complete solution for ${formattedDate} with difficulty analysis and winning strategies.`,
    keywords: `wordle ${gameNumber}, wordle #${gameNumber}, wordle answer ${gameNumber}, wordle ${gameNumber} solution, wordle ${gameNumber} hints, wordle ${gameNumber} tips`,
    openGraph: {
      title: `Wordle #${gameNumber} Answer - ${formattedDate}`,
      description: `Get Wordle #${gameNumber} answer with verified hints and tips. Complete solution for ${formattedDate}.`,
      url: `/wordle/${gameNumber}`,
      type: 'article',
      images: [
        {
          url: `/api/og/wordle/${gameNumber}`,
          width: 1200,
          height: 630,
          alt: `Wordle #${gameNumber} Answer - ${formattedDate}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Wordle #${gameNumber} Answer - ${formattedDate}`,
      description: `Get Wordle #${gameNumber} answer with verified hints and tips.`,
    },
    alternates: {
      canonical: `/wordle/${gameNumber}`,
    },
  }
}

export default async function WordleGamePage({ params }: WordleGamePageProps) {
  const gameNumber = parseInt(params.id)
  
  if (isNaN(gameNumber) || gameNumber < 1) {
    notFound()
  }

  const gameData = await getWordleGameData(gameNumber)
  
  // If game not found, check if it's a future game
  if (!gameData) {
    const today = new Date()
    const wordleStartDate = new Date('2021-06-19') // Wordle #1 date
    const daysSinceStart = Math.floor((today.getTime() - wordleStartDate.getTime()) / (1000 * 60 * 60 * 24))
    const currentGameNumber = daysSinceStart + 1
    
    // If it's a future game number, show coming soon page
    if (gameNumber > currentGameNumber) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 md:py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
                Wordle #{gameNumber} Coming Soon
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-4 md:mb-8 opacity-90">
                This game hasn't been released yet
              </p>
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 md:px-6 py-2 md:py-3">
                <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                <span className="font-semibold text-sm md:text-base">Available at 00:30 daily</span>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="max-w-2xl mx-auto text-center">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                      Next Wordle Update at 00:30
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Wordle #{gameNumber} will be available soon. New Wordle answers are released daily at 00:30. Please check back later!
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <a 
                      href="/todays-wordle-answer"
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-base font-medium"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Play Today's Wordle
                    </a>
                    
                    <div className="text-sm text-gray-500">
                      <p>Current game: Wordle #{currentGameNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-2">Browse History</h3>
                    <p className="text-sm text-gray-600 mb-3">Check out previous Wordle answers and solutions</p>
                    <a 
                      href="/wordle/history"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All Games →
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Lightbulb className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800 mb-2">Practice Mode</h3>
                    <p className="text-sm text-gray-600 mb-3">Play unlimited Wordle games to improve your skills</p>
                    <a 
                      href="/?game=wordle&mode=infinite"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Start Practice →
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    // If it's not a future game, show 404
    notFound()
  }

  const formattedDate = new Date(gameData.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isToday = new Date(gameData.date).toDateString() === new Date().toDateString()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <WordleHintsStructuredData />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
            Wordle #{gameNumber} Answer {isToday ? 'Today' : ''}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-4 md:mb-8 opacity-90">
            {formattedDate} - Complete Solution & Hints
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 md:px-6 py-2 md:py-3">
            <Clock className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            <span className="font-semibold text-sm md:text-base">Wordle #{gameNumber}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Navigation Links */}
        <div className="mb-6 md:mb-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <a href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              Home
            </a>
            <span className="text-gray-400">›</span>
            <a href="/todays-wordle-answer" className="text-blue-600 hover:text-blue-800 transition-colors">
              Wordle Answers
            </a>
            <span className="text-gray-400">›</span>
            <span className="text-gray-600">#{gameNumber}</span>
          </nav>
        </div>

        {/* Game Navigation */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 md:gap-4">
              {gameNumber > 1 && (
                <a 
                  href={`/wordle/${gameNumber - 1}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm md:text-base"
                >
                  ← Wordle #{gameNumber - 1}
                </a>
              )}
            </div>
            <div className="text-center">
              <a 
                href="/todays-wordle-answer"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
              >
                Today's Game
              </a>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <a 
                href={`/wordle/${gameNumber + 1}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm md:text-base"
              >
                Wordle #{gameNumber + 1} →
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 md:space-y-8">
          {/* Answer Display */}
          <WordleAnswerHints
            gameNumber={gameData.gameNumber}
            date={gameData.date}
            answer={gameData.answer}
            hints={gameData.hints}
            status={gameData.status}
            confidence={gameData.confidence}
          />

          {/* Strategies Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                <h2 className="text-lg md:text-xl font-semibold">Winning Strategies for Wordle #{gameNumber}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {gameData.strategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm md:text-base">{strategy}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Game Guide Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                How to Solve Wordle #{gameNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg md:text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm md:text-base">Start Smart</h3>
                  <p className="text-xs md:text-sm text-gray-600">Begin with common vowels and consonants like ADIEU or SLATE to maximize information.</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg md:text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2 text-sm md:text-base">Use Clues</h3>
                  <p className="text-xs md:text-sm text-gray-600">Pay attention to yellow and green letters to narrow down possibilities systematically.</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg md:text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-purple-800 mb-2 text-sm md:text-base">Think Patterns</h3>
                  <p className="text-xs md:text-sm text-gray-600">Consider common word patterns and letter combinations to make educated guesses.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 md:p-6 rounded-lg">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Why Our Wordle #{gameNumber} Answer Is Reliable</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm md:text-base">Daily Verification</h3>
                      <p className="text-xs md:text-sm text-gray-600">Every answer is verified against official Wordle sources</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm md:text-base">Real-time Updates</h3>
                      <p className="text-xs md:text-sm text-gray-600">Answers updated immediately when available</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm md:text-base">Community Trusted</h3>
                      <p className="text-xs md:text-sm text-gray-600">Thousands of players rely on our daily solutions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm md:text-base">Strategy Included</h3>
                      <p className="text-xs md:text-sm text-gray-600">Get hints and tips to improve your game</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Link */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4 md:p-6 text-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Practice More Wordle Games</h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                Master your Wordle skills with unlimited practice games and improve your solving strategies.
              </p>
              <a 
                href="/?game=wordle&mode=infinite"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Play Unlimited Wordle
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}