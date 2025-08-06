import type { Metadata } from "next"
import { MultiGameProvider } from "@/contexts/multi-game-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  TrendingUp, 
  Medal, 
  Star,
  Users,
  BarChart3,
  Timer,
  Target,
  Crown,
  Award,
  Zap,
  Calendar
} from "lucide-react"

export const metadata: Metadata = {
  title: "Rankings & Leaderboard Guide - Master PuzzleRank Competition System",
  description: "Master the PuzzleRank leaderboard system. Learn how rankings work, scoring methods, and strategies to climb the global word puzzle and 2048 game leaderboards.",
  keywords: "puzzle rankings, leaderboard guide, word puzzle competition, 2048 rankings, global leaderboard, puzzle scoring system",
  openGraph: {
    title: "Rankings & Leaderboard Guide - PuzzleRank.pro",
    description: "Master the PuzzleRank leaderboard system and climb the global rankings in word puzzles and 2048 games.",
    url: "https://puzzlerank.pro/guide/rankings",
  },
}

const rankingFactors = [
  {
    title: "Win Rate",
    description: "Percentage of games successfully completed",
    icon: Target,
    weight: "High",
    color: "bg-green-500"
  },
  {
    title: "Speed & Efficiency", 
    description: "Average time to solve puzzles",
    icon: Timer,
    weight: "High",
    color: "bg-blue-500"
  },
  {
    title: "Consistency",
    description: "Regular playing streak and performance stability",
    icon: BarChart3,
    weight: "Medium",
    color: "bg-purple-500"
  },
  {
    title: "Difficulty Level",
    description: "Bonus points for harder game modes",
    icon: Zap,
    weight: "Medium",
    color: "bg-orange-500"
  }
]

const leaderboardTypes = [
  {
    title: "Global Rankings",
    description: "Complete worldwide player rankings across all games",
    icon: Trophy,
    features: ["All-time best scores", "Monthly champions", "Regional leaders", "Cross-game performance"]
  },
  {
    title: "Game-Specific",
    description: "Individual leaderboards for Word Puzzle and 2048",
    icon: Medal,
    features: ["Word puzzle masters", "2048 high scores", "Speed challenges", "Difficulty specialists"]
  },
  {
    title: "Weekly Competitions",
    description: "Fresh competitive challenges every week",
    icon: Calendar,
    features: ["Weekly tournaments", "Limited-time events", "Special challenges", "Seasonal competitions"]
  }
]

const rankingTiers = [
  { tier: "Grandmaster", rank: "Top 1%", icon: Crown, color: "text-yellow-400", points: "10,000+" },
  { tier: "Master", rank: "Top 5%", icon: Award, color: "text-purple-400", points: "5,000+" },
  { tier: "Expert", rank: "Top 15%", icon: Star, color: "text-blue-400", points: "2,000+" },
  { tier: "Advanced", rank: "Top 30%", icon: TrendingUp, color: "text-green-400", points: "1,000+" },
  { tier: "Intermediate", rank: "Top 60%", icon: Target, color: "text-orange-400", points: "500+" },
  { tier: "Beginner", rank: "All Players", icon: Users, color: "text-gray-400", points: "0+" }
]

const scoringTips = [
  {
    game: "Word Puzzle",
    tips: [
      "Solve in fewer guesses for higher scores",
      "Maintain daily streaks for bonus points", 
      "Complete challenging word lists",
      "Participate in speed challenges"
    ]
  },
  {
    game: "2048",
    tips: [
      "Achieve higher tile values (4096, 8192+)",
      "Complete games with fewer moves",
      "Master advanced grid strategies",
      "Maintain consistent performance"
    ]
  }
]

export default function RankingsGuidePage() {
  return (
    <MultiGameProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              🏆 Rankings & Leaderboard Guide
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Master the PuzzleRank competitive system. Learn how rankings work, understand scoring methods, 
              and discover strategies to climb the global leaderboards in word puzzles and 2048 games.
            </p>
          </div>

          {/* Ranking System Overview */}
          <section className="mb-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-3xl text-center">How Rankings Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-white/90 text-lg max-w-4xl mx-auto">
                  PuzzleRank uses a comprehensive scoring system that evaluates multiple performance factors 
                  to create fair and competitive rankings across all skill levels.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {rankingFactors.map((factor, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-16 h-16 ${factor.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <factor.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{factor.title}</h4>
                      <p className="text-white/80 text-sm mb-2">{factor.description}</p>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {factor.weight} Impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Leaderboard Types */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Leaderboard Types</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Multiple ranking systems to showcase different aspects of puzzle mastery
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {leaderboardTypes.map((type, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <type.icon className="w-12 h-12 text-yellow-300 mx-auto mb-3" />
                    <CardTitle className="text-xl text-center">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-center mb-4">{type.description}</p>
                    <div className="space-y-2">
                      {type.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-white/90 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Ranking Tiers */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ranking Tiers</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Six competitive tiers based on skill level and total points earned
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rankingTiers.map((tier, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center">
                  <CardContent className="p-6">
                    <tier.icon className={`w-12 h-12 ${tier.color} mx-auto mb-3`} />
                    <h4 className="font-bold text-lg mb-2">{tier.tier}</h4>
                    <p className="text-white/80 text-sm mb-2">{tier.rank}</p>
                    <Badge variant="secondary" className="bg-gray-500/20 text-gray-300">
                      {tier.points} Points
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Scoring Tips */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Score Optimization Tips</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scoringTips.map((game, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl text-center">{game.game} Strategy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {game.tips.map((tip, tIndex) => (
                        <div key={tIndex} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-300 text-sm font-bold">{tIndex + 1}</span>
                          </div>
                          <span className="text-white/90">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Competition Features */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Competitive Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Real-time Updates</h4>
                    <p className="text-white/80 text-sm">Rankings update instantly as you play</p>
                  </div>
                  <div>
                    <Users className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Global Competition</h4>
                    <p className="text-white/80 text-sm">Compete with players worldwide</p>
                  </div>
                  <div>
                    <Medal className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg mb-2">Achievement System</h4>
                    <p className="text-white/80 text-sm">Unlock badges and rewards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="text-center">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Climb the Rankings?</h3>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Put these strategies into practice and watch your rank improve. Every game is an opportunity to score higher!
                </p>
                <a 
                  href="/" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-all"
                >
                  <Trophy className="w-5 h-5" />
                  <span>Start Competing Now</span>
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