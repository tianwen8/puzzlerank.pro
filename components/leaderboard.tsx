"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMultiGame } from "@/contexts/multi-game-context"
import { Crown, Medal, Award, RefreshCw, Trophy, TrendingUp } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function Leaderboard() {
  const { leaderboard, loading, refreshData, currentGame } = useMultiGame()
  const [displayLeaderboard, setDisplayLeaderboard] = useState(leaderboard)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const previousLeaderboardRef = useRef(leaderboard)

  // 平滑更新排行榜数据
  useEffect(() => {
    if (leaderboard && !loading) {
      const hasChanged = JSON.stringify(previousLeaderboardRef.current) !== JSON.stringify(leaderboard)

      if (hasChanged) {
        setIsUpdating(true)
        setTimeout(() => {
          setDisplayLeaderboard(leaderboard)
          previousLeaderboardRef.current = leaderboard
          setTimeout(() => setIsUpdating(false), 300)
        }, 100)
      } else {
        setDisplayLeaderboard(leaderboard)
      }
    }
  }, [leaderboard, loading])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshData()
    setIsRefreshing(false)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
      case 2:
        return <Medal className="w-4 h-4 text-gray-400 flex-shrink-0" />
      case 3:
        return <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold flex-shrink-0">{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border-yellow-400/30"
      case 2:
        return "bg-gradient-to-r from-gray-300/20 to-gray-400/20 border-gray-400/30"
      case 3:
        return "bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30"
      default:
        return "bg-white/10 border-white/20"
    }
  }

  if (loading && displayLeaderboard.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>Global Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/10 rounded-lg p-3 h-16"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 transition-all duration-300 leaderboard-panel ${isUpdating ? "ring-1 ring-white/30" : ""}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>{currentGame === 'wordle' ? 'Puzzle Rankings' : '2048 Rankings'}</span>
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
        <p className="text-sm text-white/80">
          {currentGame === 'wordle' 
            ? 'Ranked by current streak, win rate, and efficiency' 
            : 'Live rankings updated in real-time'
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-white/60" />
              <p className="text-white/80 mb-2">No players yet!</p>
              <p className="text-white/60 text-sm">
                {currentGame === 'wordle' 
                  ? 'Be the first to start a winning streak!'
                  : 'Be the first to set a high score!'
                }
              </p>
            </div>
          ) : (
            displayLeaderboard.map((entry, index) => (
              <div
                key={`${entry.rank}-${entry.username}-${index}`}
                className={`flex items-center space-x-2 rounded-lg p-2 border text-sm transition-all duration-300 ${getRankBgColor(entry.rank)} ${isUpdating ? "animate-pulse" : ""}`}
              >
                {/* 排名图标 */}
                <div className="flex items-center justify-center w-6">{getRankIcon(entry.rank)}</div>

                {/* 用户信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate leading-tight">{entry.username || 'Anonymous'}</div>
                  <div className="text-xs text-white/80 flex items-center space-x-1 leading-tight">
                    <TrendingUp className="w-3 h-3 flex-shrink-0" />
                    {currentGame === 'wordle' ? (
                      <>
                        <span className="truncate">{(entry.gamesPlayed || 0)}g</span>
                        <span>•</span>
                        <span className="truncate">{(entry.winRate || 0).toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <span className="truncate">{(entry.totalGames || 0)}g</span>
                    <span>•</span>
                        <span className="truncate">{(entry.winRate || 0).toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 分数信息 */}
                <div className="text-right flex-shrink-0">
                  {currentGame === 'wordle' ? (
                    <>
                      <div className="font-bold text-base leading-tight">🔥 {(entry.currentStreak || 0)}</div>
                      <div className="text-xs text-white/80 leading-tight">
                        Avg: {(entry.averageGuesses || 0).toFixed(1)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-base leading-tight">{(entry.bestScore || 0).toLocaleString()}</div>
                      {(entry.highestTile || 0) > 0 && (
                        <div className="text-xs text-white/80 leading-tight">Max: {entry.highestTile || 0}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 text-center">
          <p className="text-xs text-white/80">Live rankings updated in real-time</p>
        </div>
      </CardContent>
    </Card>
  )
}
