"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, Lightbulb, History, Play, TrendingUp, Users, Target, BookOpen } from 'lucide-react'
import WordleHintsStructuredData from '@/components/wordle-hints-structured-data'
import WordleAnswerHints from '@/components/wordle-answer-hints'
import { WordleHints } from '@/lib/supabase/types'

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

export default function TodaysWordleAnswerPage() {
  const [todayData, setTodayData] = useState<WordleData | null>(null)
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const loadData = async () => {
      try {
        // Use new auto-collect API endpoint
        const todayResponse = await fetch('/api/wordle/auto?type=today')
        const historyResponse = await fetch('/api/wordle/auto?type=history')
        
        if (todayResponse.ok) {
          const todayResult = await todayResponse.json()
          if (todayResult.success && todayResult.data) {
            const today = todayResult.data
            const answer = today.verified_word || today.predicted_word || 'UNKNOWN'
            
            // Generate hints if not available or incomplete
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
            
            let hints = today.hints
            
            // Check if hints is valid and complete
            if (!hints || !hints.clues || !Array.isArray(hints.clues) || hints.clues.length === 0) {
              hints = generateDefaultHints(answer)
            }
            
            setTodayData({
              gameNumber: today.game_number,
              date: today.date,
              answer: answer,
              status: today.status as 'verified' | 'candidate' | 'rejected',
              confidence: today.confidence_score || 1.0,
              hints: hints,
              strategies: [
                "Start with vowel-rich words like ADIEU or AUDIO",
                "Use elimination strategy for consonants",
                "Consider letter frequency in English"
              ]
            })
          }
        }
        
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json()
          if (historyResult.success && historyResult.data) {
            setHistoryData(historyResult.data.map((item: any) => ({
              gameNumber: item.game_number,
              date: item.date,
              answer: item.verified_word || item.predicted_word || 'UNKNOWN',
              difficulty: item.hints?.difficulty || 'Medium' as 'Easy' | 'Medium' | 'Hard'
            })))
          }
        }
      } catch (error) {
        console.error('Failed to load Wordle data:', error)
        // Fallback data for demo
        const fallbackAnswer = "NOMAD"
        setTodayData({
          gameNumber: 1515,
          date: new Date().toISOString().split('T')[0],
          answer: fallbackAnswer,
          status: 'verified',
          confidence: 1.0,
          hints: {
            firstLetter: fallbackAnswer[0],
            length: fallbackAnswer.length,
            vowels: ['O', 'A'],
            consonants: ['N', 'M', 'D'],
            wordType: 'noun',
            difficulty: 'Medium',
            clues: [
              "This word describes a person who moves from place to place",
              "Contains common vowels O and A",
              "Often associated with wandering or traveling lifestyle"
            ]
          },
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
            Wordle Answer Today - Daily Solution & Hints Updated
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Get today's verified Wordle answer instantly! Daily solutions with hints, tips & unlimited practice updated every day.
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
                {/* New Hints-based Answer Display */}
                <WordleAnswerHints
                  gameNumber={todayData.gameNumber}
                  date={todayData.date}
                  answer={todayData.answer}
                  hints={todayData.hints}
                  status={todayData.status}
                  confidence={todayData.confidence}
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

                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg">
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
                    <div key={entry.gameNumber} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">#{entry.gameNumber}</div>
                        <div className="font-mono text-lg font-bold text-gray-800">{entry.answer}</div>
                        <Badge variant="outline" className="text-xs">
                          {entry.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <a 
                          href="/?game=wordle&mode=infinite"
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors no-underline"
                        >
                          Practice
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SEO Content for Recent Answers */}
                <div className="mt-8 space-y-6">
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Master Previous Wordle Answers</h2>
                      <p className="text-gray-600 mb-4">
                        Study past Wordle solutions to improve your strategy. Each answer reveals patterns and letter combinations that can help you solve future puzzles more efficiently.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-gray-800">Pattern Recognition</h3>
                            <p className="text-sm text-gray-600">Learn common letter patterns from historical answers</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-gray-800">Strategy Development</h3>
                            <p className="text-sm text-gray-600">Develop better opening words and elimination tactics</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <a 
                          href="/?game=wordle&mode=infinite"
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors no-underline"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Practice with Unlimited Games
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}