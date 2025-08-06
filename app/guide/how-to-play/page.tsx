import type { Metadata } from "next"
import { MultiGameProvider } from "@/contexts/multi-game-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Keyboard, 
  Grid3x3, 
  Trophy, 
  Target, 
  ArrowRight, 
  Lightbulb,
  Star,
  CheckCircle,
  BookOpen,
  GamepadIcon,
  Zap
} from "lucide-react"

export const metadata: Metadata = {
  title: "How to Play Guide - Master Word Practice & 2048 Games | PuzzleRank.pro",
  description: "Complete guide to playing word practice games and 2048. Learn rules, strategies, controls, and tips to improve your puzzle gaming skills and climb the rankings.",
  keywords: "how to play, word practice guide, 2048 tutorial, puzzle game rules, gaming guide, puzzle strategies",
  openGraph: {
    title: "How to Play Guide - Master Word Practice & 2048 Games",
    description: "Complete guide to playing word practice games and 2048. Learn rules, strategies, controls, and tips to improve your puzzle gaming skills.",
    url: "https://puzzlerank.pro/guide/how-to-play",
  },
}

const wordGameGuide = {
  title: "Word Practice Game",
  icon: Keyboard,
  description: "Guess the hidden word in 6 attempts using letter clues",
  rules: [
    "Guess a valid word in the given number of tries",
    "Each guess must be a real word",
    "After each guess, colors will show how close you are",
    "Green letters are in the correct position",
    "Yellow letters are in the word but wrong position",
    "Gray letters are not in the word at all"
  ],
  controls: [
    "Click letters on the on-screen keyboard",
    "Or use your physical keyboard to type",
    "Press Enter to submit your guess",
    "Press Backspace to delete letters"
  ],
  tips: [
    "Start with common vowels (A, E, I, O, U)",
    "Use words with frequent consonants (R, S, T, L, N)",
    "Pay attention to letter frequency in your language",
    "Eliminate impossible letters early",
    "Think about word patterns and common endings"
  ]
}

const game2048Guide = {
  title: "2048 Number Game",
  icon: Grid3x3,
  description: "Combine numbered tiles to reach the 2048 tile",
  rules: [
    "Swipe or use arrow keys to move tiles",
    "When two tiles with the same number touch, they merge",
    "Merged tiles combine their values (2+2=4, 4+4=8, etc.)",
    "A new tile appears after each move",
    "Goal is to create a tile with the number 2048",
    "Game ends when no moves are possible"
  ],
  controls: [
    "Use arrow keys (↑↓←→) on desktop",
    "Swipe in any direction on mobile",
    "Click 'New Game' to restart",
    "Use 'Undo' to reverse your last move"
  ],
  tips: [
    "Keep your highest tile in one corner",
    "Build numbers in a specific direction pattern",
    "Don't move the direction that disturbs your corner",
    "Plan several moves ahead",
    "Keep the board as empty as possible"
  ]
}

const gameFeatures = [
  {
    title: "Difficulty Levels",
    description: "Choose your challenge level",
    icon: Target,
    features: [
      "Easy: 4-letter words, more common vocabulary",
      "Normal: 5-letter words, standard difficulty",
      "Hard: 6+ letter words, advanced vocabulary",
      "Practice: Unlimited tries for learning"
    ]
  },
  {
    title: "Real-time Rankings",
    description: "Compete with players worldwide",
    icon: Trophy,
    features: [
      "Global leaderboards for all game modes",
      "Track your personal best scores",
      "View statistics and improvement trends",
      "Earn achievements and badges"
    ]
  },
  {
    title: "Game Modes",
    description: "Multiple ways to play",
    icon: GamepadIcon,
    features: [
      "Daily Challenge: One puzzle per day",
      "Practice Mode: Unlimited games",
      "Speed Mode: Race against the clock",
      "Custom: Create your own challenges"
    ]
  }
]

const commonMistakes = [
  {
    game: "Word Practice",
    mistakes: [
      "Not using all available letters for clues",
      "Focusing too much on one letter position",
      "Ignoring word pattern recognition",
      "Not considering common letter combinations"
    ]
  },
  {
    game: "2048",
    mistakes: [
      "Moving randomly without strategy",
      "Breaking the corner tile arrangement",
      "Not planning for tile combinations",
      "Filling the board too quickly"
    ]
  }
]

const achievements = [
  {
    title: "Word Master",
    description: "Complete 10 word puzzles in a row",
    difficulty: "Medium",
    reward: "🏆 Bronze Trophy"
  },
  {
    title: "Speed Solver",
    description: "Solve a puzzle in under 60 seconds",
    difficulty: "Hard",
    reward: "⚡ Lightning Badge"
  },
  {
    title: "2048 Champion",
    description: "Reach the 2048 tile",
    difficulty: "Expert",
    reward: "👑 Champion Crown"
  },
  {
    title: "Consistency King",
    description: "Play for 7 consecutive days",
    difficulty: "Easy",
    reward: "📅 Streak Badge"
  }
]

export default function HowToPlayPage() {
  return (
    <MultiGameProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              📚 How to Play Guide
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Master both Word Practice and 2048 games with our comprehensive guide. 
              Learn the rules, controls, strategies, and tips to become a puzzle champion!
            </p>
          </div>

          {/* Word Practice Guide */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Keyboard className="w-8 h-8 text-green-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">Word Practice Game</h2>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{wordGameGuide.title}</CardTitle>
                <p className="text-white/80">{wordGameGuide.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-green-300">📋 Game Rules</h4>
                    <ul className="space-y-2">
                      {wordGameGuide.rules.map((rule, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-blue-300">🎮 Controls</h4>
                    <ul className="space-y-2">
                      {wordGameGuide.controls.map((control, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Play className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{control}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-yellow-300">💡 Pro Tips</h4>
                    <ul className="space-y-2">
                      {wordGameGuide.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 2048 Guide */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Grid3x3 className="w-8 h-8 text-orange-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">2048 Number Game</h2>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{game2048Guide.title}</CardTitle>
                <p className="text-white/80">{game2048Guide.description}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-orange-300">📋 Game Rules</h4>
                    <ul className="space-y-2">
                      {game2048Guide.rules.map((rule, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-blue-300">🎮 Controls</h4>
                    <ul className="space-y-2">
                      {game2048Guide.controls.map((control, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Play className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{control}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-yellow-300">💡 Pro Tips</h4>
                    <ul className="space-y-2">
                      {game2048Guide.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Game Features */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Star className="w-8 h-8 text-purple-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">Game Features & Modes</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {gameFeatures.map((feature, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <feature.icon className="w-6 h-6 text-purple-400" />
                      <span>{feature.title}</span>
                    </CardTitle>
                    <p className="text-white/80">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span className="text-white/80 text-sm">{item}</span>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {commonMistakes.map((gameType, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl">⚠️ {gameType.game} Mistakes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {gameType.mistakes.map((mistake, mistakeIndex) => (
                        <li key={mistakeIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-white/80 text-sm">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Achievements */}
          <section className="mb-12">
            <div className="flex items-center mb-8">
              <Trophy className="w-8 h-8 text-yellow-300 mr-3" />
              <h2 className="text-3xl font-bold text-white">Achievements & Rewards</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white text-center">
                  <CardHeader>
                    <div className="text-3xl mb-2">{achievement.reward}</div>
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        achievement.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                        achievement.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        achievement.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-300' :
                        'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {achievement.difficulty}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <BookOpen className="w-8 h-8 text-purple-300" />
                  <span>Getting Started Checklist</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-purple-300">First Steps</h4>
                    <ul className="space-y-2 text-white/90">
                      <li>• Create your free account for progress tracking</li>
                      <li>• Start with Easy mode to learn the basics</li>
                      <li>• Practice with unlimited mode first</li>
                      <li>• Review the tutorial for each game</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-purple-300">Building Skills</h4>
                    <ul className="space-y-2 text-white/90">
                      <li>• Play consistently to build word knowledge</li>
                      <li>• Study high-scoring players' strategies</li>
                      <li>• Join community discussions and tips</li>
                      <li>• Set daily goals and track progress</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA */}
          <section className="text-center">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Playing?</h3>
                <p className="text-white/90 mb-6">Put your knowledge to the test and start your puzzle gaming journey today!</p>
                <a 
                  href="/" 
                  className="inline-flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
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