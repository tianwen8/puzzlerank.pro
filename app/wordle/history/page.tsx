import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, Calendar, TrendingUp, Target } from 'lucide-react'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'

export const metadata: Metadata = {
  title: "Wordle History - All Previous Answers & Solutions Archive",
  description: "Complete archive of all Wordle answers and solutions. Browse previous games, analyze patterns, and improve your strategy with our comprehensive Wordle history.",
  keywords: "wordle history, wordle archive, previous wordle answers, wordle solutions archive, past wordle games, wordle answer list, wordle game history",
  openGraph: {
    title: "Wordle History - All Previous Answers & Solutions Archive",
    description: "Complete archive of all Wordle answers and solutions. Browse previous games, analyze patterns, and improve your strategy.",
    url: '/wordle/history',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Wordle History - All Previous Answers Archive",
    description: "Complete archive of all Wordle answers and solutions. Browse previous games and improve your strategy.",
  },
  alternates: {
    canonical: '/wordle/history',
  },
}

interface HistoryEntry {
  gameNumber: number
  date: string
  answer: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

async function getWordleHistory(): Promise<HistoryEntry[]> {
  try {
    const historyData = await WordlePredictionDB.getHistoryPredictions(100)
    return historyData.map((item: any) => ({
      gameNumber: item.game_number,
      date: item.date,
      answer: item.verified_word || item.predicted_word || 'UNKNOWN',
      difficulty: item.hints?.difficulty || 'Medium' as 'Easy' | 'Medium' | 'Hard'
    }))
  } catch (error) {
    console.error('Failed to load Wordle history:', error)
    return []
  }
}

export default async function WordleHistoryPage() {
  const historyData = await getWordleHistory()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
            Wordle History & Archive
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-4 md:mb-8 opacity-90">
            Complete collection of all previous Wordle answers and solutions
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 md:px-6 py-2 md:py-3">
            <History className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            <span className="font-semibold text-sm md:text-base">{historyData.length} Games Archived</span>
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
            <span className="text-gray-600">History</span>
          </nav>
        </div>

        {/* Quick Links */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap gap-3">
            <a 
              href="/todays-wordle-answer"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              <Target className="w-4 h-4 mr-2" />
              Today's Answer
            </a>
            <a 
              href="/?game=wordle&mode=infinite"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              Practice Unlimited
            </a>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{historyData.length}</div>
              <div className="text-sm md:text-base text-gray-600">Total Games</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                {historyData.filter(g => g.difficulty === 'Easy').length}
              </div>
              <div className="text-sm md:text-base text-gray-600">Easy Games</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-red-600 mb-2">
                {historyData.filter(g => g.difficulty === 'Hard').length}
              </div>
              <div className="text-sm md:text-base text-gray-600">Hard Games</div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <h2 className="text-lg md:text-xl font-semibold">All Wordle Games History</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyData.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {historyData.map((entry) => (
                  <div key={entry.gameNumber} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="text-sm text-gray-500 font-mono">#{entry.gameNumber}</div>
                      <div className="font-mono text-lg md:text-xl font-bold text-gray-800">{entry.answer}</div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          entry.difficulty === 'Easy' ? 'border-green-300 text-green-700' :
                          entry.difficulty === 'Hard' ? 'border-red-300 text-red-700' :
                          'border-yellow-300 text-yellow-700'
                        }`}
                      >
                        {entry.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="text-xs md:text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <a 
                        href={`/wordle/${entry.gameNumber}`}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors no-underline"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <History className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm md:text-base">No history data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategy Tips */}
        <Card className="mt-6 md:mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-lg md:text-xl font-semibold">Learn from History</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-blue-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 md:mb-3 text-sm md:text-base">Pattern Analysis</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                  Study previous answers to identify common letter patterns and word structures that appear frequently in Wordle.
                </p>
                <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                  <li>• Common starting letters: S, C, B, T, P</li>
                  <li>• Frequent vowel patterns: A-E, O-E, I-E</li>
                  <li>• Popular word endings: -ER, -ED, -LY</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 md:p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2 md:mb-3 text-sm md:text-base">Strategy Development</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                  Use historical data to refine your opening words and elimination strategies for better success rates.
                </p>
                <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                  <li>• Test your opening words against past answers</li>
                  <li>• Identify which letters appear most frequently</li>
                  <li>• Learn from difficult words to improve</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 md:p-6 rounded-lg text-center">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2 md:mb-4">Ready to Practice?</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Use these historical insights to improve your Wordle skills with unlimited practice games.
              </p>
              <a 
                href="/?game=wordle&mode=infinite"
                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base font-medium"
              >
                Start Practicing Now
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}