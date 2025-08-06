import type { Metadata } from "next"
import { MultiGameProvider } from "@/contexts/multi-game-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Zap,
  Calendar,
  Trophy,
  Percent,
  Hash,
  Timer,
  Star,
  Activity
} from "lucide-react"

export const metadata: Metadata = {
  title: "Personal Stats Guide - Understand Your Puzzle Game Performance Data",
  description: "Master your PuzzleRank statistics dashboard. Learn to interpret win rates, streaks, average scores, and performance metrics for word puzzles and 2048 games.",
  keywords: "puzzle game stats, performance metrics, win rate analysis, game statistics guide, personal dashboard, puzzle tracking",
  openGraph: {
    title: "Personal Stats Guide - PuzzleRank.pro",
    description: "Learn to interpret your puzzle game statistics and improve your performance with data-driven insights.",
    url: "https://puzzlerank.pro/guide/stats",
  },
}

const keyMetrics = [
  {
    title: "Win Rate",
    icon: Target,
    description: "Percentage of games successfully completed",
    goodRange: "70%+",
    tips: ["Focus on accuracy over speed", "Practice on easier difficulties first", "Learn from failed attempts"],
    color: "bg-green-500"
  },
  {
    title: "Current Streak",
    icon: Zap,
    description: "Consecutive games won without failure",
    goodRange: "10+ games",
    tips: ["Play consistently daily", "Don't risk streak on hard puzzles", "Take breaks when frustrated"],
    color: "bg-blue-500"
  },
  {
    title: "Average Time",
    icon: Timer,
    description: "Mean time to complete puzzles",
    goodRange: "Under 3 mins",
    tips: ["Practice pattern recognition", "Learn common word combinations", "Develop systematic approaches"],
    color: "bg-purple-500"
  },
  {
    title: "Best Streak",
    icon: Trophy,
    description: "Longest streak of consecutive wins",
    goodRange: "25+ games",
    tips: ["Shows your peak consistency", "Set this as your goal to beat", "Track daily to maintain momentum"],
    color: "bg-orange-500"
  }
]

const gameSpecificStats = [
  {
    game: "Word Puzzle",
    metrics: [
      {
        name: "Guess Distribution",
        icon: BarChart3,
        description: "How many guesses you typically need",
        interpretation: "Lower numbers show better word knowledge and strategy"
      },
      {
        name: "First Try Success",
        icon: Star,
        description: "Games solved on the first guess",
        interpretation: "Rare but shows excellent vocabulary and luck"
      },
      {
        name: "Hard Mode Performance",
        icon: Zap,
        description: "Success rate in challenging difficulty",
        interpretation: "True test of puzzle-solving skills"
      },
      {
        name: "Speed Bonus",
        icon: Clock,
        description: "Extra points for quick solutions",
        interpretation: "Rewards both accuracy and efficiency"
      }
    ]
  },
  {
    game: "2048",
    metrics: [
      {
        name: "Highest Tile",
        icon: Hash,
        description: "Maximum tile value achieved",
        interpretation: "Shows your strategic planning ability"
      },
      {
        name: "Move Efficiency",
        icon: Activity,
        description: "Average moves to reach target",
        interpretation: "Lower numbers indicate better strategy"
      },
      {
        name: "Grid Management",
        icon: Target,
        description: "How well you organize the board",
        interpretation: "Key factor in reaching higher numbers"
      },
      {
        name: "Endgame Skill",
        icon: Trophy,
        description: "Performance when board fills up",
        interpretation: "Separates good players from great ones"
      }
    ]
  }
]

const improvementAreas = [
  {
    title: "Consistency Building",
    description: "Focus on maintaining steady performance rather than occasional high scores",
    strategies: ["Set daily play goals", "Track weekly averages", "Identify performance patterns", "Practice in low-pressure environment"]
  },
  {
    title: "Speed Development", 
    description: "Improve your puzzle-solving speed without sacrificing accuracy",
    strategies: ["Time yourself regularly", "Practice pattern recognition", "Learn keyboard shortcuts", "Develop mental shortcuts"]
  },
  {
    title: "Streak Protection",
    description: "Strategies to maintain and extend winning streaks",
    strategies: ["Play when most alert", "Avoid risky guesses", "Use hints strategically", "Know when to skip difficult puzzles"]
  },
  {
    title: "Skill Advancement",
    description: "Progress from beginner to advanced skill levels",
    strategies: ["Challenge yourself gradually", "Study expert strategies", "Analyze your mistakes", "Practice different game modes"]
  }
]

const statsInterpretation = [
  {
    stat: "Games Played",
    meaning: "Total experience level",
    good: "100+ games for meaningful stats"
  },
  {
    stat: "Win Percentage",
    meaning: "Overall success rate",
    good: "70%+ shows strong skills"
  },
  {
    stat: "Average Guesses",
    meaning: "Efficiency indicator", 
    good: "Under 4.5 for word puzzles"
  },
  {
    stat: "Time per Game",
    meaning: "Speed and confidence",
    good: "2-4 minutes optimal range"
  },
  {
    stat: "Streak Performance",
    meaning: "Consistency measure",
    good: "Current streak within 80% of best"
  }
]

export default function PersonalStatsGuidePage() {
  return (
    <MultiGameProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              📊 Personal Stats Guide
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Understand your performance data and use insights to improve your puzzle-solving skills. 
              Learn what each statistic means and how to leverage your data for better gameplay.
            </p>
          </div>

          {/* Key Metrics Overview */}
          <section className="mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Key Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <p className="text-center text-white/90 text-lg max-w-4xl mx-auto">
                  These four core metrics provide the best insight into your puzzle-solving performance and improvement areas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {keyMetrics.map((metric, index) => (
                    <Card key={index} className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <metric.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-white mb-2">{metric.title}</h4>
                            <p className="text-white/80 text-sm mb-3">{metric.description}</p>
                            <Badge className="bg-green-500/20 text-green-300 mb-3">
                              Target: {metric.goodRange}
                            </Badge>
                            <div className="space-y-1">
                              {metric.tips.map((tip, tIndex) => (
                                <div key={tIndex} className="flex items-start space-x-2">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-white/70 text-xs">{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Game-Specific Statistics */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Game-Specific Metrics</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Each game type tracks unique performance indicators tailored to specific skills
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {gameSpecificStats.map((game, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">{game.game} Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {game.metrics.map((metric, mIndex) => (
                        <div key={mIndex} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <metric.icon className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                            <div>
                              <h5 className="font-semibold text-white mb-1">{metric.name}</h5>
                              <p className="text-white/70 text-sm mb-2">{metric.description}</p>
                              <p className="text-white/60 text-xs italic">{metric.interpretation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Stats Interpretation Table */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Quick Stats Reference</h2>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Statistic</th>
                        <th className="px-6 py-4 text-left font-semibold">What It Shows</th>
                        <th className="px-6 py-4 text-left font-semibold">Good Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsInterpretation.map((item, index) => (
                        <tr key={index} className="border-t border-white/10">
                          <td className="px-6 py-4 font-medium">{item.stat}</td>
                          <td className="px-6 py-4 text-white/80">{item.meaning}</td>
                          <td className="px-6 py-4">
                            <Badge className="bg-green-500/20 text-green-300">
                              {item.good}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Improvement Areas */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Areas for Improvement</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Use your statistical insights to identify and work on specific skill areas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {improvementAreas.map((area, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm mb-4">{area.description}</p>
                    <div className="space-y-2">
                      {area.strategies.map((strategy, sIndex) => (
                        <div key={sIndex} className="flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/90 text-sm">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Data Tracking Tips */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Smart Data Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Daily Monitoring</h4>
                    <p className="text-white/80 text-sm">Check stats daily to spot trends and patterns</p>
                  </div>
                  <div>
                    <Activity className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Weekly Reviews</h4>
                    <p className="text-white/80 text-sm">Analyze performance weekly for improvements</p>
                  </div>
                  <div>
                    <Target className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Goal Setting</h4>
                    <p className="text-white/80 text-sm">Set specific targets based on your data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Advanced Analytics Section */}
          <section className="mb-12">
            <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">📊 Advanced Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-300">Understanding Your Statistics</h3>
                    <p className="text-white/90 mb-4">
                      PuzzleRank.pro provides comprehensive statistics tracking that goes beyond simple win/loss records. 
                      Our advanced analytics system monitors your performance patterns, identifies improvement opportunities, 
                      and helps you understand your puzzle-solving strengths and weaknesses.
                    </p>
                    <p className="text-white/90 mb-4">
                      Track your progress across multiple dimensions including speed, accuracy, consistency, and strategic decision-making. 
                      Compare your performance with global averages and see how you stack up against players of similar skill levels.
                    </p>
                    <p className="text-white/90">
                      Use detailed performance graphs and trend analysis to identify patterns in your gameplay. 
                      Discover which times of day you perform best, which game modes suit your style, and how your skills evolve over time.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-300">Maximizing Your Potential</h3>
                    <p className="text-white/90 mb-4">
                      Professional puzzle players rely on statistics to guide their training and improvement strategies. 
                      By analyzing your performance data, you can identify specific areas that need attention and focus your practice sessions accordingly.
                    </p>
                    <p className="text-white/90 mb-4">
                      Set personal goals based on your statistical trends and track your progress toward achieving them. 
                      Whether you're aiming to improve your average solve time, increase your win rate, or climb the global rankings, 
                      data-driven insights provide the roadmap to success.
                    </p>
                    <p className="text-white/90">
                      Join the community of competitive puzzle players who use advanced analytics to reach new levels of performance. 
                      Share insights, compare strategies, and learn from the statistical patterns of top-ranked players worldwide.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Internal Links Navigation */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-center">🔗 Explore More Puzzle Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a href="/strategy" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="text-sm font-medium">Game Strategy</div>
                  </a>
                  <a href="/guide/rankings" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="text-sm font-medium">Rankings Guide</div>
                  </a>
                  <a href="/guide/how-to-play" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="text-sm font-medium">How to Play</div>
                  </a>
                  <a href="/about" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
                    <div className="text-2xl mb-2">ℹ️</div>
                    <div className="text-sm font-medium">About Us</div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="text-center">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-4">Start Tracking Your Progress</h3>
                <p className="text-white/90 mb-6">
                  Begin your journey to puzzle mastery with detailed performance analytics!
                </p>
                <a 
                  href="/" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-all"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Your Stats</span>
                </a>
              </CardContent>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </MultiGameProvider>
  )
} 