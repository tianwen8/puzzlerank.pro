"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  LogIn, 
  LogOut, 
  BookOpen, 
  Grid3x3, 
  SpellCheck, 
  ChevronDown, 
  FileText, 
  Users,
  Home,
  Target,
  TrendingUp,
  BarChart3,
  Lightbulb
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useMultiGame } from "@/contexts/multi-game-context"
import { GameType } from "@/lib/supabase/types"
import AuthModal from "./auth/auth-modal"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showGuideMenu, setShowGuideMenu] = useState(false)
  const { user, signOut, loading } = useAuth()
  const { currentGame, setCurrentGame } = useMultiGame()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      console.log("Attempting to sign out...")
      
      // Add button disabled state to prevent duplicate clicks
      const button = document.querySelector('[data-sign-out-btn]') as HTMLButtonElement
      if (button) button.disabled = true
      
      const { error } = await signOut()
      if (error) {
        console.error("Sign out failed:", error)
        if (button) button.disabled = false
      } else {
        console.log("Sign out successful")
        
        // Clear all local storage
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        // Force page refresh to ensure all state is cleared
        window.location.href = window.location.origin
      }
    } catch (error) {
      console.error("Sign out exception:", error)
              // If error occurs, also try to clear local state
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = window.location.origin
      }
    }
  }

  const handleGameSwitch = (gameId: GameType) => {
    setCurrentGame(gameId)
    // 如果不在首页，导航回首页
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      router.push('/')
    }
  }

  const games = [
          {
        id: 'wordle' as GameType,
        name: 'Word Puzzle',
        icon: SpellCheck,
        color: 'text-green-400'
      },
      {
        id: '2048' as GameType,
        name: '2048',
        icon: Grid3x3,
        color: 'text-orange-400'
      }
  ]

  if (loading) {
    return (
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-white">PuzzleRank</div>
              <span className="text-white/60 text-sm">Ultimate Puzzle Games Platform</span>
            </div>
            <div className="w-20 h-10 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-white">PuzzleRank</div>
                <span className="text-white/60 text-sm">Ultimate Puzzle Games Platform</span>
              </div>

              {/* Game Navigation in Header */}
              <div className="hidden md:flex items-center space-x-2 ml-8">
                {games.map((game) => {
                  const Icon = game.icon
                  const isActive = currentGame === game.id
                  
                  return (
                    <Button
                      key={game.id}
                      onClick={() => handleGameSwitch(game.id)}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center space-x-2 ${
                        isActive 
                          ? 'bg-white/20 text-white hover:bg-white/30' 
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : game.color}`} />
                      <span>{game.name}</span>
                    </Button>
                  )
                })}
                
                {/* Daily Hints Button */}
                <Link href="/daily-hints">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span>Daily Hints</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Guides Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowGuideMenu(!showGuideMenu)}
                  className="flex items-center space-x-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 border border-white/20"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">Guides</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showGuideMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showGuideMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-xl z-50">
                    <div className="py-3">
                      <Link 
                        href="/" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                        onClick={() => setShowGuideMenu(false)}
                      >
                        <Home className="w-4 h-4" />
                        <span className="font-medium">Back to Game</span>
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <Link 
                        href="/guide/how-to-play" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                        onClick={() => setShowGuideMenu(false)}
                      >
                        <FileText className="w-4 h-4" />
                        <span>Game Rules & How to Play</span>
                      </Link>
                      <Link 
                        href="/strategy" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                        onClick={() => setShowGuideMenu(false)}
                      >
                        <Target className="w-4 h-4" />
                        <span>Winning Tips & Strategy</span>
                      </Link>
                      <Link 
                        href="/guide/rankings" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                        onClick={() => setShowGuideMenu(false)}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>Rankings & Leaderboard</span>
                      </Link>
                      <Link 
                        href="/guide/stats" 
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-colors"
                        onClick={() => setShowGuideMenu(false)}
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Personal Stats Guide</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                href="/about" 
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>About</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-white text-sm">Welcome, {user.user_metadata?.full_name || user.email}</div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    data-sign-out-btn
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Game Navigation */}
          <div className="md:hidden mt-4 space-y-2">
            <div className="flex space-x-2">
              {games.map((game) => {
                const Icon = game.icon
                const isActive = currentGame === game.id
                
                return (
                  <Button
                    key={game.id}
                    onClick={() => handleGameSwitch(game.id)}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex-1 flex items-center justify-center space-x-2 ${
                      isActive 
                        ? 'bg-white/20 text-white hover:bg-white/30' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : game.color}`} />
                    <span>{game.name}</span>
                  </Button>
                )
              })}
            </div>
            
            {/* Mobile Daily Hints Button */}
            <Link href="/daily-hints" className="block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
              >
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span>Daily Hints</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}