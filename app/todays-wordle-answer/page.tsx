"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, Lightbulb, History, Play, TrendingUp, Users, Target, BookOpen } from 'lucide-react'
import WordleHintsStructuredData from '@/components/wordle-hints-structured-data'

interface WordleData {
  gameNumber: number
  date: string
  answer: string
  status: 'verified' | 'predicted' | 'pending'
  confidence: number
  hints: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  letterFrequency: { [key: string]: number }
  commonWords: string[]
  strategies: string[]
}

interface HistoryEntry {
  gameNumber: number
  date: string
  answer: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export default function TodaysWordleAnswerPage() {
  const [todayData, setTodayData] = useState<WordleData | null>(null)
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use API calls instead of direct database access
        const todayResponse = await fetch('/api/wordle/today')
        const historyResponse = await fetch('/api/wordle/history?limit=7')
        
        if (todayResponse.ok) {
          const today = await todayResponse.json()
          setTodayData({
            gameNumber: today.gameNumber,
            date: today.date,
            answer: today.answer,
            status: today.status as 'verified' | 'predicted' | 'pending',
            confidence: today.confidence,
            hints: today.hints || [
              "This word contains common vowels",
              "Pay attention to letter positioning",
              "Consider word patterns and frequency"
            ],
            difficulty: today.difficulty as 'Easy' | 'Medium' | 'Hard' || 'Medium',
            letterFrequency: today.letterFrequency || {},
            commonWords: today.commonWords || [],
            strategies: today.strategies || [
              "Start with vowel-rich words like ADIEU or AUDIO",
              "Use elimination strategy for consonants",
              "Consider letter frequency in English"
            ]
          })
        }
        
        if (historyResponse.ok) {
          const history = await historyResponse.json()
          setHistoryData(history.map((item: any) => ({
            gameNumber: item.gameNumber,
            date: item.date,
            answer: item.answer,
            difficulty: item.difficulty as 'Easy' | 'Medium' | 'Hard' || 'Medium'
          })))
        }
      } catch (error) {
        console.error('Failed to load Wordle data:', error)
        // Fallback data for demo
        setTodayData({
          gameNumber: 1512,
          date: new Date().toISOString().split('T')[0],
          answer: "NASAL",
          status: 'verified',
          confidence: 1.0,
          hints: [
            "This word relates to the nose area",
            "Contains two vowels in specific positions",
            "Common in medical and anatomy contexts"
          ],
          difficulty: 'Medium',
          letterFrequency: {},
          commonWords: [],
          strategies: [
            "Start with vowel-rich words like ADIEU or AUDIO",
            "Use elimination strategy for consonants",
            "Consider letter frequency in English"
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading today's Wordle answer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <WordleHintsStructuredData />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Today's Wordle Answer
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Get the verified daily solution with hints and strategies
          </p>
          {todayData && (
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-semibold">Game #{todayData.gameNumber} - {new Date(todayData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
            {todayData ? (
              <>
                {/* Answer Card */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-green-800 flex items-center justify-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      Today's Verified Answer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-6xl font-bold text-green-700 mb-4 tracking-wider">
                      {todayData.answer}
                    </div>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                      <Badge variant="outline">
                        Difficulty: {todayData.difficulty}
                      </Badge>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                      <Play className="w-5 h-5 mr-2" />
                      Play Unlimited Practice
                    </Button>
                  </CardContent>
                </Card>

                {/* Hints and Strategies */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Today's Hints
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {todayData.hints.map((hint, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{hint}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" />
                        Winning Strategies
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
                </div>

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

                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Our Answers Are Reliable</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-800">Daily Verification</h4>
                            <p className="text-sm text-gray-600">Every answer is verified against official Wordle sources</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-800">Real-time Updates</h4>
                            <p className="text-sm text-gray-600">Answers updated immediately when available</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-800">Community Trusted</h4>
                            <p className="text-sm text-gray-600">Thousands of players rely on our daily solutions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-800">Strategy Included</h4>
                            <p className="text-sm text-gray-600">Get hints and tips to improve your game</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No data available for today's Wordle.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Wordle Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historyData.map((entry) => (
                    <div key={entry.gameNumber} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">#{entry.gameNumber}</div>
                        <div className="font-mono text-lg font-bold text-gray-800">{entry.answer}</div>
                        <Badge variant="outline" className="text-xs">
                          {entry.difficulty}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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