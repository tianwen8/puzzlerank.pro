"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import GameBoard from "@/components/game-board"
import GameControls from "@/components/game-controls"
import PlayerStats from "@/components/player-stats"
import Leaderboard from "@/components/leaderboard"
import MobileGameLayout from "@/components/mobile-game-layout"
import TouchController from "@/components/touch-controller"
import { MultiGameProvider, useMultiGame } from "@/contexts/multi-game-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { AlertCircle, X } from "lucide-react"
import DebugPanel from "@/components/debug-panel"

// Import Wordle components
import WordleBoard from "@/components/games/wordle/wordle-board"
import WordleKeyboard from "@/components/games/wordle/wordle-keyboard"
import WordleGameControls from "@/components/games/wordle/wordle-game-controls"
import WordleGameControlsInline from "@/components/games/wordle/wordle-game-controls-inline"

function ErrorNotification() {
  const { error } = useMultiGame()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (error) {
      setShowError(true)
      // Auto hide after 5 seconds
      const timer = setTimeout(() => setShowError(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (!showError || !error) return null

  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-start space-x-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-semibold">Error</div>
          <div className="text-sm opacity-90">{error}</div>
        </div>
        <button onClick={() => setShowError(false)} className="text-white/80 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function GameContent() {
  const searchParams = useSearchParams()
  const [authError, setAuthError] = useState<string | null>(null)
  const { currentGame } = useMultiGame()
  const isMobile = useIsMobile()

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setAuthError(decodeURIComponent(error))
      // Clear error from URL after showing it
      const url = new URL(window.location.href)
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  return (
    <div className={isMobile ? "min-h-screen" : "min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500"}>
      {!isMobile && <Header />}

      {authError && !isMobile && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Authentication Error: </strong>
            <span className="block sm:inline">{authError}</span>
          </div>
        </div>
      )}

      <main className={isMobile ? "" : "container mx-auto px-4 py-8"}>
        {/* Game Area with Mobile-First Layout */}
        <MobileGameLayout
          leftPanel={<PlayerStats />}
          rightPanel={<Leaderboard />}
          className={isMobile ? "" : "mb-16"}
        >
          <TouchController 
            gameType={currentGame} 
            className="w-full h-full flex flex-col items-center justify-center space-y-6"
          >
                          {currentGame === 'wordle' ? (
              <>
                {/* Mobile layout - Game board and keyboard close together */}
                <div className="md:hidden w-full h-full flex flex-col justify-center items-center">
                  {/* Mobile Daily Hints Button */}
                  <div className="w-full max-w-xs flex-shrink-0 mx-auto mb-2">
                    <div className="flex justify-center">
                      <a href="/daily-hints" className="inline-block">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 flex items-center gap-2">
                          <span className="text-lg">💡</span>
                          <span>Wordle Answers</span>
                        </div>
                      </a>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-xs flex-shrink-0 mx-auto">
                    <WordleBoard />
                  </div>
                  <div className="w-full max-w-xs flex-shrink-0 mx-auto mt-4" data-keyboard>
                    <WordleKeyboard />
                  </div>
                </div>
                
                {/* 桌面端布局 */}
                <div className="hidden md:flex md:flex-col md:items-center md:space-y-6 w-full">
                  <div className="w-full max-w-2xl">
                    <WordleGameControlsInline />
                  </div>
                  <div className="w-full max-w-lg">
                    <WordleBoard />
                  </div>
                  <div className="w-full max-w-lg" data-keyboard>
                    <WordleKeyboard />
                  </div>
                </div>
              </>
            ) : (
                <>
                  <div className="w-full max-w-md">
                    <GameBoard />
                  </div>
                  <GameControls />
                </>
              )}
          </TouchController>
        </MobileGameLayout>

        {/* Hero Section - Only show on desktop */}
        {!isMobile && (
        <div className="text-center mb-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Master Every <span className="text-yellow-300">Puzzle Game</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto">
            Play <strong>2048</strong>, <strong>Word Practice Games</strong>, and more brain games on the ultimate puzzle ranking platform. 
            Compete with millions of players worldwide, track your progress, and climb the global leaderboard!
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-white/80">
            <span className="bg-white/20 px-4 py-2 rounded-full">🧠 Brain Training</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">🏆 Global Rankings</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">📊 Detailed Statistics</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">🆓 100% Free</span>
          </div>
        </div>
        )}

        {/* Game Features Section - Only show on desktop */}
        {!isMobile && (
        <section className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            🎮 Featured Puzzle Games
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">📝 Unlimited Word Practice</h3>
              <p className="text-white/80 mb-4">
                Challenge yourself with our <strong>unlimited word practice game</strong>! Guess 5-letter words in 6 tries across multiple difficulty levels. 
                Features unlimited practice mode, infinite gameplay, and comprehensive word statistics for continuous improvement.
              </p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>✅ Unlimited practice mode</li>
                <li>✅ Three difficulty levels (Easy, Normal, Hard)</li>
                <li>✅ Multiple word lengths</li>
                <li>✅ Global ranking system</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">🔢 2048 Number Game</h3>
              <p className="text-white/80 mb-4">
                Master the classic <strong>2048 number puzzle game</strong>! Merge tiles strategically to reach the legendary 2048 tile. 
                Our enhanced version features smooth animations, undo functionality, and competitive leaderboards.
              </p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>✅ Smooth tile animations and responsive controls</li>
                <li>✅ Global leaderboard and personal statistics</li>
                <li>✅ Undo moves for strategic gameplay</li>
                <li>✅ Mobile-optimized touch controls</li>
              </ul>
            </div>
          </div>
        </section>
        )}

        {/* Platform Advantages Section - Only show on desktop */}
        {!isMobile && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            🏆 Why Choose PuzzleRank.pro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/5 rounded-lg p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Competitive Rankings</h3>
              <p className="text-white/80 text-sm">
                Real-time <strong>global leaderboards</strong> and ranking system for all puzzle games. 
                See how you stack up against millions of players worldwide.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-white mb-3">Brain Training Games</h3>
              <p className="text-white/80 text-sm">
                Exercise logical thinking and improve cognitive abilities with scientifically designed 
                <strong> puzzle games</strong> that enhance memory and problem-solving skills.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Statistics</h3>
              <p className="text-white/80 text-sm">
                Comprehensive tracking of your <strong>puzzle game performance</strong>. 
                Analyze your progress, win rates, and improvement over time.
              </p>
            </div>
          </div>
        </section>
        )}
      </main>

        {/* SEO Content Section - Only show on desktop */}
        {!isMobile && (
        <section className="container mx-auto px-4 py-8 text-white">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">🎮 About PuzzleRank.pro</h2>
                <p className="text-white/90 mb-4">
                  PuzzleRank.pro is the ultimate online puzzle games platform featuring competitive leaderboards and ranking systems.
                  Challenge yourself with unlimited 5-letter word practice games, classic 2048 number games, and more brain-training challenges.
                  Our advanced algorithm tracks your performance across multiple game modes, providing detailed analytics to help improve your puzzle-solving skills.
                </p>
                <p className="text-white/90 mb-4">
                  Join millions of players worldwide in daily challenges, compete for top positions on global leaderboards, and unlock achievements as you master each game.
                  Whether you're a casual player looking for brain training or a competitive gamer aiming for the top ranks, PuzzleRank.pro offers the perfect gaming experience.
                </p>
                <p className="text-white/90">
                  Our platform provides smooth gameplay experience, real-time global rankings, detailed personal statistics, and comprehensive strategy guides
                  to help you grow from a beginner to a puzzle master. Start your journey today and discover why PuzzleRank.pro is the preferred choice for puzzle game enthusiasts.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">🏆 Platform Features</h3>
                <ul className="space-y-2 text-white/90">
                  <li>• <strong>Global Rankings:</strong> Compete with players worldwide and climb the leaderboards</li>
                  <li>• <strong>Multiple Games:</strong> Word puzzles, number games, and brain training challenges</li>
                  <li>• <strong>Detailed Analytics:</strong> Track your progress and analyze your performance patterns</li>
                  <li>• <strong>Cross-platform:</strong> Perfect compatibility for desktop and mobile devices</li>
                  <li>• <strong>Daily Challenges:</strong> New puzzles and competitions every day with special rewards</li>
                  <li>• <strong>Strategy Guides:</strong> Professional tips and puzzle-solving strategies from top players</li>
                  <li>• <strong>Achievement System:</strong> Unlock badges and milestones as you improve</li>
                  <li>• <strong>Social Features:</strong> Connect with friends and share your achievements</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold mb-4">🎯 Why Choose PuzzleRank.pro?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <h4 className="font-semibold mb-2">Competitive Gaming</h4>
                  <p className="text-sm text-white/80">Join competitive puzzle tournaments, climb rankings, and prove your skills against the best players worldwide</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl mb-2">🧩</div>
                  <h4 className="font-semibold mb-2">Diverse Puzzles</h4>
                  <p className="text-sm text-white/80">Word puzzles, number games, and logic challenges for all skill levels with increasing difficulty</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-semibold mb-2">Anytime, Anywhere</h4>
                  <p className="text-sm text-white/80">Perfect mobile adaptation, enjoy puzzle games on any device with seamless synchronization</p>
                </div>
              </div>
            </div>

            {/* 内链导航组件 */}
            <div className="mt-8 border-t border-white/20 pt-6">
              <h3 className="text-xl font-bold mb-4 text-center">🔗 Explore More</h3>
              <nav className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <a href="/daily-hints" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg p-3 text-center transition-colors border border-purple-300/30">
                  <div className="text-2xl mb-1">💡</div>
                  <div className="text-sm font-medium">Daily Hints</div>
                  <div className="text-xs text-white/70 mt-1">Daily Answers</div>
                </a>
                <a href="/strategy" className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-colors">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-sm font-medium">Game Strategy</div>
                </a>
                <a href="/guide/rankings" className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-colors">
                  <div className="text-2xl mb-1">🏅</div>
                  <div className="text-sm font-medium">Rankings Guide</div>
                </a>
                <a href="/guide/stats" className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-colors">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-sm font-medium">Statistics</div>
                </a>
                <a href="/guide/how-to-play" className="bg-white/5 hover:bg-white/10 rounded-lg p-3 text-center transition-colors">
                  <div className="text-2xl mb-1">🎮</div>
                  <div className="text-sm font-medium">How to Play</div>
                </a>
              </nav>
            </div>
          </div>
        </section>
        )}

      {process.env.NODE_ENV === "development" && <DebugPanel />}
      {!isMobile && <Footer />}
      <ErrorNotification />
    </div>
  )
}

export default function Home() {
  return (
    <MultiGameProvider>
      <GameContent />
      <ErrorNotification />
    </MultiGameProvider>
  )
}
