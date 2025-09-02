import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, Lightbulb, History, Play, TrendingUp, Users, Target, BookOpen } from 'lucide-react'
import WordleHintsStructuredData from '@/components/wordle-hints-structured-data'
import WordleStructuredData from '@/components/wordle-structured-data'
import WordleAnswerHints from '@/components/wordle-answer-hints'
import SocialShare from '@/components/social-share'
import { WordleHints } from '@/lib/supabase/types'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'
import { AnswerHintGenerator } from '@/lib/answer-hint-generator'
import Link from 'next/link'

// 启用ISR，每30分钟重新验证以确保数据及时更新
export const revalidate = 1800

// 强制静态生成
export const dynamic = 'force-static'

interface WordleData {
  gameNumber: number
  date: string
  answer: string
  status: 'verified' | 'candidate' | 'rejected'
  confidence: number
  hints: WordleHints
  strategies: string[]
}

interface HistoryEntry {
  gameNumber: number
  date: string
  answer: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

// 生成元数据
export async function generateMetadata(): Promise<Metadata> {
  try {
    const todayData = await WordlePredictionDB.getTodayPrediction()
    const word = todayData?.verified_word || todayData?.predicted_word || 'UNKNOWN'
    const gameNumber = todayData?.game_number || 0
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    return {
      title: `Wordle Answer Today #${gameNumber} - ${word} | Daily Solution & Hints`,
      description: `Get today's Wordle answer #${gameNumber} instantly! The solution is "${word}" with hints, tips & strategies. Updated daily with verified answers.`,
      keywords: [
        `wordle answer today`,
        `wordle ${gameNumber}`,
        `wordle solution ${word}`,
        `wordle hints today`,
        `daily wordle answer`,
        `wordle help`,
        `wordle ${date}`
      ],
      openGraph: {
        title: `Wordle Answer Today #${gameNumber} - ${word}`,
        description: `Today's Wordle solution is "${word}"! Get hints, tips and strategies for Wordle #${gameNumber}.`,
        type: 'article',
        publishedTime: new Date().toISOString(),
        authors: ['PuzzleRank Pro'],
        tags: ['wordle', 'puzzle', 'word game', 'daily', 'solution']
      },
      twitter: {
        card: 'summary_large_image',
        title: `Wordle Answer Today #${gameNumber} - ${word}`,
        description: `Today's Wordle solution is "${word}"! Get hints and strategies.`
      },
      alternates: {
        canonical: '/todays-wordle-answer'
      }
    }
  } catch (error) {
    return {
      title: 'Wordle Answer Today - Daily Solution & Hints Updated',
      description: 'Get today\'s verified Wordle answer instantly! Daily solutions with hints, tips & unlimited practice updated every day.'
    }
  }
}

// 获取今日数据
async function getTodayData(): Promise<WordleData | null> {
  try {
    const todayData = await WordlePredictionDB.getTodayPrediction()
    
    if (!todayData) return null
    
    const answer = todayData.verified_word || todayData.predicted_word || 'UNKNOWN'
    const hintGenerator = new AnswerHintGenerator()
    const hints = hintGenerator.generateHints(answer)
    
    return {
      gameNumber: todayData.game_number,
      date: todayData.date,
      answer: answer,
      status: todayData.status as 'verified' | 'candidate' | 'rejected',
      confidence: todayData.confidence_score || 1.0,
      hints: hints,
      strategies: [
        "Start with vowel-rich words like ADIEU or AUDIO",
        "Use elimination strategy for consonants",
        "Consider letter frequency in English",
        "Look for common word patterns and endings",
        "Don't repeat letters unless you have confirmed them"
      ]
    }
  } catch (error) {
    console.error('Failed to load today data:', error)
    return null
  }
}

// 获取历史数据
async function getHistoryData(): Promise<HistoryEntry[]> {
  try {
    const historyData = await WordlePredictionDB.getRecentPredictions(7)
    
    return historyData.map(item => ({
      gameNumber: item.game_number,
      date: item.date,
      answer: item.verified_word || item.predicted_word || 'UNKNOWN',
      difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard' // 可以根据实际数据调整
    }))
  } catch (error) {
    console.error('Failed to load history data:', error)
    return []
  }
}

export default async function TodaysWordleAnswerPage() {
  const todayData = await getTodayData()
  const historyData = await getHistoryData()

  // 如果没有数据，显示备用内容
  if (!todayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Wordle Answer Loading...</h1>
          <p className="text-gray-600 mb-4">We're fetching today's Wordle answer for you.</p>
          <p className="text-gray-500">Please wait while we load the latest data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <WordleHintsStructuredData />
      <WordleStructuredData
        gameNumber={todayData.gameNumber}
        date={todayData.date}
        answer={todayData.answer}
        hints={todayData.hints}
        status={todayData.status}
        confidence={todayData.confidence}
        url="https://puzzlerank.pro/todays-wordle-answer"
      />
      
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
              Game #{todayData.gameNumber} - {new Date(todayData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Link to dedicated game page */}
        {todayData && (
          <div className="mb-6 md:mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900 mb-1">
                    Wordle #{todayData.gameNumber} Dedicated Page
                  </h2>
                  <p className="text-sm text-blue-700">
                    View the complete solution with enhanced SEO and sharing features
                  </p>
                </div>
                <a 
                  href={`/wordle/${todayData.gameNumber}`}
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  View Wordle #{todayData.gameNumber}
                </a>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Today's Answer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Answers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-8">
            {/* New Hints-based Answer Display */}
            <WordleAnswerHints
              gameNumber={todayData.gameNumber}
              date={todayData.date}
              answer={todayData.answer}
              hints={todayData.hints}
              status={todayData.status}
              confidence={todayData.confidence}
            />

            {/* Social Share */}
            <div className="flex justify-center">
              <SocialShare
                title={`Today's Wordle Answer #${todayData.gameNumber} - ${todayData.answer}`}
                description={`I solved today's Wordle! The answer was "${todayData.answer}". Can you solve it too? Get daily hints and unlimited practice!`}
                hashtags={['Wordle', `Wordle${todayData.gameNumber}`, 'WordleAnswer', 'TodaysWordle', 'PuzzleGames']}
                variant="inline"
                className="bg-white rounded-lg p-4 shadow-sm"
              />
            </div>

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
                  {todayData.strategies.map((strategy, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Wordle Guide Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  How to Master Today's Wordle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h3 className="font-semibold text-blue-800 mb-2">Start Smart</h3>
                    <p className="text-sm text-gray-600">Begin with common vowels and consonants like ADIEU or SLATE to maximize information.</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h3 className="font-semibold text-green-800 mb-2">Use Clues</h3>
                    <p className="text-sm text-gray-600">Pay attention to yellow and green letters to narrow down possibilities systematically.</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h3 className="font-semibold text-purple-800 mb-2">Think Patterns</h3>
                    <p className="text-sm text-gray-600">Consider common word patterns and letter combinations to make educated guesses.</p>
                  </div>
                </div>

                {/* Practice Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Ready to Practice?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Test your skills with unlimited Wordle games and improve your solving strategy!
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link 
                      href="/?game=wordle&mode=infinite"
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors no-underline font-medium"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Unlimited Practice
                    </Link>
                    <Link 
                      href="/strategy"
                      className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors no-underline font-medium"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Wordle Strategy Guide
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  Recent Wordle Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {historyData.map((entry) => (
                    <div key={entry.gameNumber} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">#{entry.gameNumber}</Badge>
                        <div>
                          <div className="font-semibold text-lg">{entry.answer}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{entry.difficulty}</Badge>
                        <Link 
                          href={`/wordle-${entry.gameNumber}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}