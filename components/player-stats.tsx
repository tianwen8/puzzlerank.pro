"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMultiGame } from "@/contexts/multi-game-context"
import { Trophy, Target, TrendingUp, Zap, RefreshCw, Crown, Clock, Move, LogIn } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import AuthModal from "@/components/auth/auth-modal"

export default function PlayerStats() {
  const { isLoggedIn, playerStats, loading, error, refreshData, currentGameStats, currentGame } = useMultiGame()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [displayStats, setDisplayStats] = useState(playerStats)
  const [isUpdating, setIsUpdating] = useState(false)
  const previousStatsRef = useRef(playerStats)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // 平滑数据更新 - 避免卡片闪烁
  useEffect(() => {
    if (playerStats && !loading) {
      // 检查数据是否真的发生了变化
      const hasChanged = JSON.stringify(previousStatsRef.current) !== JSON.stringify(playerStats)

      if (hasChanged) {
        setIsUpdating(true)
        // 延迟更新显示数据，创建平滑过渡效果
        setTimeout(() => {
          // Clean and sanitize displayStats to prevent undefined errors
          const cleanStats = {
            ...playerStats,
            bestScore: playerStats.bestScore || 0,
            totalGames: playerStats.totalGames || 0,
            gamesWon: playerStats.gamesWon || 0,
            winRate: playerStats.winRate || 0,
            currentStreak: playerStats.currentStreak || 0,
            bestStreak: playerStats.bestStreak || 0,
            averageScore: playerStats.averageScore || 0,
            totalMoves: playerStats.totalMoves || 0,
            totalDuration: playerStats.totalDuration || 0,
            highestTile: playerStats.highestTile || 0,
            wordleGamesPlayed: playerStats.wordleGamesPlayed || 0,
            wordleGamesWon: playerStats.wordleGamesWon || 0,
            wordleWinRate: playerStats.wordleWinRate || 0,
            wordleCurrentStreak: playerStats.wordleCurrentStreak || 0,
            wordleBestStreak: playerStats.wordleBestStreak || 0,
            wordleAverageGuesses: playerStats.wordleAverageGuesses || 0,
            userRank: playerStats.userRank || 0,
            username: playerStats.username || 'Player',
            email: playerStats.email || '',
          }
          setDisplayStats(cleanStats)
          previousStatsRef.current = cleanStats
          setTimeout(() => setIsUpdating(false), 300)
        }, 100)
      } else {
        setDisplayStats(playerStats)
      }
    }
  }, [playerStats, loading])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshData()
    setIsRefreshing(false)
  }

  // 数字动画组件
  const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(value)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
      if (value !== displayValue) {
        setIsAnimating(true)
        const timer = setTimeout(() => {
          setDisplayValue(value)
          setTimeout(() => setIsAnimating(false), 200)
        }, 100)
        return () => clearTimeout(timer)
      }
    }, [value, displayValue])

    return (
      <span className={`transition-all duration-300 ${isAnimating ? "text-yellow-300 scale-110" : ""}`}>
        {typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}
        {suffix}
      </span>
    )
  }

  if (!isLoggedIn) {
    return (
      <>
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Guest Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-white/80 mb-4">Sign in to track your progress and compete on the leaderboard!</p>
              
              {/* 当前游戏实时统计 */}
              {currentGameStats.currentScore > 0 && (
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="text-lg font-bold text-yellow-300 mb-2">Current Game</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-white/80">Score</div>
                      <div className="font-bold"><AnimatedNumber value={currentGameStats.currentScore} /></div>
                    </div>
                    <div>
                      <div className="text-white/80">Moves</div>
                      <div className="font-bold"><AnimatedNumber value={currentGameStats.currentMoves} /></div>
                    </div>
                    <div>
                      <div className="text-white/80">Max Tile</div>
                      <div className="font-bold"><AnimatedNumber value={currentGameStats.currentHighestTile} /></div>
                    </div>
                    <div>
                      <div className="text-white/80">Time</div>
                      <div className="font-bold">
                        {Math.floor(currentGameStats.currentDuration / 60)}:{(currentGameStats.currentDuration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Session Best:</span>
                  <span className="font-bold"><AnimatedNumber value={currentGameStats.sessionBest} /></span>
              </div>
              <div className="flex justify-between">
                <span>Games This Session:</span>
                  <span className="font-bold">
                    <AnimatedNumber value={currentGameStats.sessionGames} />
                  </span>
              </div>
              </div>
              
              {/* 醒目的登录按钮 */}
              <div className="pt-4">
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  size="lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Track Progress
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    )
  }

  if (loading && !displayStats) {
    return (
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Your Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !displayStats) {
    return (
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Your Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-white/80 mb-4 text-sm">{error}</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!displayStats) {
    return (
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Your Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-white/80 mb-4">No statistics available yet.</p>
            <p className="text-white/60 text-sm">Play your first game to see your stats!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <>
    <Card
        className={`bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 transition-all duration-300 stats-panel ${isUpdating ? "ring-1 ring-white/30" : ""}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Your Statistics</span>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 p-1"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        {displayStats.userRank > 0 && (
          <div className="flex items-center space-x-1 text-yellow-300">
            <Crown className="w-4 h-4" />
            <span className="text-sm">
              Rank #<AnimatedNumber value={displayStats.userRank} />
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 主要统计 */}
        <div className="grid grid-cols-2 gap-4">
          {currentGame === '2048' ? (
            // 2048 游戏统计
            <>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 mr-1" />
            </div>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={displayStats.bestScore} />
            </div>
            <div className="text-xs text-white/80">Best Score</div>
              {/* 显示当前游戏分数 */}
              {currentGameStats.currentScore > 0 && (
                <div className="text-sm text-yellow-300 mt-1">
                  Current: <AnimatedNumber value={currentGameStats.currentScore} />
                  {currentGameStats.currentScore > displayStats.bestScore && (
                    <span className="text-yellow-400 ml-1">🎉 NEW!</span>
                  )}
                </div>
              )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 mr-1" />
            </div>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={displayStats.totalGames} />
            </div>
            <div className="text-xs text-white/80">Games Played</div>
              {/* 显示当前游戏移动次数 */}
              {currentGameStats.currentMoves > 0 && (
                <div className="text-sm text-yellow-300 mt-1">
                  Moves: <AnimatedNumber value={currentGameStats.currentMoves} />
                </div>
              )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-4 h-4 mr-1" />
            </div>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={displayStats.winRate} suffix="%" />
            </div>
            <div className="text-xs text-white/80">Win Rate</div>
              {/* 显示最高方块 */}
              {currentGameStats.currentHighestTile > 0 && (
                <div className="text-sm text-yellow-300 mt-1">
                  Max Tile: <AnimatedNumber value={currentGameStats.currentHighestTile} />
                </div>
              )}
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">
              <AnimatedNumber value={displayStats.currentStreak} />
            </div>
            <div className="text-xs text-white/80">Current Streak</div>
              {/* 显示游戏时长 */}
              {currentGameStats.currentDuration > 0 && (
                <div className="text-sm text-yellow-300 mt-1">
                  Time: {Math.floor(currentGameStats.currentDuration / 60)}:{(currentGameStats.currentDuration % 60).toString().padStart(2, '0')}
                </div>
              )}
          </div>
            </>
          ) : (
            // Wordle 游戏统计
            <>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-4 h-4 mr-1" />
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedNumber value={displayStats.wordleGamesPlayed} />
                </div>
                <div className="text-xs text-white/80">Games Played</div>
                {/* 显示当前游戏猜测次数 */}
                {currentGameStats.currentGuesses > 0 && (
                  <div className="text-sm text-yellow-300 mt-1">
                    Guesses: <AnimatedNumber value={currentGameStats.currentGuesses} />
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedNumber value={displayStats.wordleGamesWon} />
                </div>
                <div className="text-xs text-white/80">Games Won</div>
                {/* 显示当前游戏时长 */}
                {currentGameStats.currentDuration > 0 && (
                  <div className="text-sm text-yellow-300 mt-1">
                    Time: {Math.floor(currentGameStats.currentDuration / 60)}:{(currentGameStats.currentDuration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4 mr-1" />
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedNumber value={displayStats.wordleWinRate} suffix="%" />
                </div>
                <div className="text-xs text-white/80">Win Rate</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold">
                  <AnimatedNumber value={displayStats.wordleCurrentStreak} />
                </div>
                <div className="text-xs text-white/80">Current Streak</div>
              </div>
            </>
          )}
        </div>

        {/* 详细统计 */}
        <div className="pt-4 border-t border-white/20 space-y-2">
          {currentGame === '2048' ? (
            // 2048 详细统计
            <>
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Trophy className="w-3 h-3 mr-1" />
              Best Streak:
            </span>
            <span className="font-bold">
              <AnimatedNumber value={displayStats.bestStreak} />
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Move className="w-3 h-3 mr-1" />
              Total Moves:
            </span>
            <span className="font-bold">
              <AnimatedNumber value={displayStats.totalMoves} />
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
                Total Time:
            </span>
            <span className="font-bold">{formatDuration(displayStats.totalDuration)}</span>
          </div>

            <div className="flex justify-between text-sm">
              <span>Average Score:</span>
              <span className="font-bold">
                <AnimatedNumber value={displayStats.averageScore} />
              </span>
            </div>

            {displayStats.highestTile > 0 && (
              <div className="flex justify-between text-sm">
                <span>Highest Tile:</span>
                <span className="font-bold">
                <AnimatedNumber value={displayStats.highestTile} />
              </span>
            </div>
              )}
            </>
          ) : (
            // Wordle 详细统计
            <>
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <Trophy className="w-3 h-3 mr-1" />
                  Best Streak:
                </span>
                <span className="font-bold">
                  <AnimatedNumber value={displayStats.wordleBestStreak} />
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Average Guesses:
                </span>
                <span className="font-bold">
                  <AnimatedNumber value={displayStats.wordleAverageGuesses} />
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Success Rate:</span>
                <span className="font-bold">
                  <AnimatedNumber value={displayStats.wordleWinRate} suffix="%" />
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Total Games:</span>
                <span className="font-bold">
                  <AnimatedNumber value={displayStats.wordleGamesPlayed} />
                </span>
              </div>
            </>
          )}
        </div>

        {/* 用户信息 */}
        <div className="pt-4 border-t border-white/20 text-center">
          <div className="text-sm text-white/80">Playing as</div>
          <div className="font-semibold">{displayStats.username}</div>
        </div>
      </CardContent>

        {/* 添加AuthModal */}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </Card>
    </>
  )
}
