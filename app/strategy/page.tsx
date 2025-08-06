import type { Metadata } from "next"
import { MultiGameProvider } from "@/contexts/multi-game-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  ArrowRight, 
  Lightbulb,
  Star,
  CheckCircle 
} from "lucide-react"

export const metadata: Metadata = {
  title: "Puzzle Game Tips & Strategies - Master Word Practice & 2048 | PuzzleRank.pro",
  description: "Master puzzle games with our comprehensive strategy guide! Professional tips for word practice games and 2048, winning strategies, and expert techniques to climb the rankings.",
  keywords: "puzzle game tips, word game strategy, 2048 strategy, puzzle solving, game tactics, ranking strategies, brain game tips",
  openGraph: {
    title: "Puzzle Game Tips & Strategies - Master Word Practice & 2048",
    description: "Master puzzle games with our comprehensive strategy guide! Professional tips for word practice games and 2048, winning strategies, and expert techniques.",
    url: "https://puzzlerank.pro/strategy",
  },
}

const strategies = [
  {
    title: "Keep Large Numbers in Corner",
    description: "Always keep the largest number tile in one corner (recommended: bottom-right), avoid being surrounded by other tiles.",
    icon: Trophy,
    level: "Basic",
    color: "bg-blue-500"
  },
  {
    title: "Unidirectional Movement Principle",
    description: "Avoid moving up, prioritize using left, right, and down directions to maintain number sequence continuity.",
    icon: Target,
    level: "Important",
    color: "bg-green-500"
  },
  {
    title: "Descending Number Arrangement",
    description: "Starting from the largest corner, arrange numbers in descending order to form a snake or ladder-like layout.",
    icon: TrendingUp,
    level: "Advanced",
    color: "bg-purple-500"
  },
  {
    title: "Reserve Merging Space",
    description: "Avoid filling the board completely, always maintain enough movement space for number merging.",
    icon: Zap,
    level: "Expert",
    color: "bg-orange-500"
  },
]

const tips = [
  {
    title: "Opening Strategy",
    points: [
      "Choose one corner as the 'home' for the largest number, recommend bottom-right",
      "Focus on establishing basic number arrangement in the first few moves",
      "Avoid random movements, every move should have a purpose"
    ]
  },
  {
    title: "Mid-game Development",
    points: [
      "Maintain descending number arrangement, don't disrupt the order",
      "When large numbers appear, prioritize merging",
      "Avoid creating large numbers in wrong positions"
    ]
  },
  {
    title: "Late-game Sprint",
    points: [
      "Plan each move more carefully",
      "Use small numbers to fill gaps and create conditions for large number merging",
      "When approaching 2048, have adequate preparation and backup plans"
    ]
  }
]

const commonMistakes = [
  "Frequently using upward movement, disrupting number arrangement",
  "Letting large numbers leave the corner position",
  "No long-term planning, only considering current step",
  "Continuing to take risks when board space is insufficient",
  "Ignoring the important role of small numbers"
]

export default function StrategyPage() {
  return (
    <MultiGameProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              🏆 Puzzle Game Tips & Strategies
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Master both Word Practice and 2048 games with professional strategies and expert techniques.
              Learn winning tactics, advanced patterns, and climb the global rankings with confidence!
            </p>
          </div>

          {/* Core Strategies */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Lightbulb className="w-8 h-8 text-yellow-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">Core Strategies</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {strategies.map((strategy, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${strategy.color}`}>
                          <strategy.icon className="w-6 h-6 text-white" />
                        </div>
                        <span>{strategy.title}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {strategy.level}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/90">{strategy.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Stages of Tips */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Star className="w-8 h-8 text-yellow-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">Stages of Tips</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {tips.map((tip, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tip.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/90">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Target className="w-8 h-8 text-red-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">Common Mistakes to Avoid</h2>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle>⚠️ Common Mistakes for Beginners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {commonMistakes.map((mistake, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                      <span className="text-white/90">{mistake}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Practical Suggestions */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                  <span>Practical Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-yellow-300">Practice Points</h4>
                    <ul className="space-y-2 text-white/90">
                      <li>• Practice for 15-30 minutes daily to maintain your skills</li>
                      <li>• Start from simple mode and gradually increase difficulty</li>
                      <li>• Learn from high-level players' game recordings</li>
                      <li>• Record your best strategies and mistakes</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-yellow-300">Mental Adjustment</h4>
                    <ul className="space-y-2 text-white/90">
                      <li>• Stay patient, don't rush for quick success</li>
                      <li>• Mistakes are the mother of success, learn from them</li>
                      <li>• Set small goals and progress gradually</li>
                      <li>• Enjoy the game process, reduce pressure</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Word Puzzle Strategies */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Lightbulb className="w-8 h-8 text-blue-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">Word Puzzle Mastery</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>🎯 Starting Word Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/90">Choose opening words with common vowels and consonants to maximize information gain:</p>
                  <ul className="space-y-2 text-white/80">
                    <li>• <strong>ADIEU</strong> - Contains 4 vowels for maximum vowel coverage</li>
                    <li>• <strong>AROSE</strong> - Balanced mix of common letters</li>
                    <li>• <strong>SLATE</strong> - High-frequency consonants and vowels</li>
                    <li>• <strong>CRANE</strong> - Popular choice among competitive players</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>⚡ Advanced Techniques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/90">Master these advanced word puzzle techniques:</p>
                  <ul className="space-y-2 text-white/80">
                    <li>• <strong>Letter Frequency Analysis</strong> - Know which letters appear most often</li>
                    <li>• <strong>Position Patterns</strong> - Understand common letter positions</li>
                    <li>• <strong>Elimination Strategy</strong> - Systematically rule out impossible letters</li>
                    <li>• <strong>Word Structure Recognition</strong> - Identify common prefixes and suffixes</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="mb-12">
            <Card className="bg-white/5 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">📚 Complete Puzzle Game Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-300">Why Strategy Matters in Puzzle Games</h3>
                    <p className="text-white/90 mb-4">
                      Puzzle games like 2048 and word challenges aren't just about luck - they require strategic thinking, pattern recognition, and consistent practice. 
                      Professional players use proven techniques to achieve high scores and climb global rankings consistently.
                    </p>
                    <p className="text-white/90 mb-4">
                      Our comprehensive strategy guide covers everything from basic principles to advanced tactics used by top-ranked players. 
                      Whether you're aiming to reach 2048 for the first time or competing for leaderboard positions, these strategies will improve your gameplay significantly.
                    </p>
                    <p className="text-white/90">
                      The key to puzzle game mastery lies in understanding underlying patterns, developing muscle memory for optimal moves, 
                      and maintaining focus during critical game moments. Practice these techniques regularly to see dramatic improvements in your scores.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-300">Building Your Puzzle Skills</h3>
                    <p className="text-white/90 mb-4">
                      Successful puzzle game players develop a systematic approach to each game type. For 2048, this means mastering corner strategies and tile management. 
                      For word puzzles, it involves understanding letter frequency and elimination techniques.
                    </p>
                    <p className="text-white/90 mb-4">
                      Regular practice with focused attention on strategy implementation helps build the neural pathways necessary for quick decision-making. 
                      Top players often spend time analyzing their games to identify improvement opportunities and refine their techniques.
                    </p>
                    <p className="text-white/90">
                      Join our community of puzzle enthusiasts and track your progress through detailed statistics. 
                      Compare your performance with players worldwide and discover new strategies through competitive play.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Internal Links Navigation */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-center">🔗 Explore More Puzzle Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <a href="/guide/how-to-play" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="text-sm font-medium">How to Play</div>
                  </a>
                  <a href="/guide/rankings" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="text-sm font-medium">Rankings Guide</div>
                  </a>
                  <a href="/guide/stats" className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center transition-colors">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm font-medium">Statistics</div>
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
                <h3 className="text-2xl font-bold mb-4">Ready to Challenge?</h3>
                <p className="text-white/90 mb-6">Apply these strategies to start your puzzle game mastery journey!</p>
                <a 
                  href="/" 
                  className="inline-flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <span>Start Playing Now</span>
                  <ArrowRight className="w-5 h-5" />
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