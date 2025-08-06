"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import {
  type GameState,
  type Direction,
  initializeGame,
  moveBoard,
  addRandomTile,
  isGameOver,
  hasWon,
  getHighestTile,
} from "@/lib/game-logic"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

interface GameContextType {
  gameState: GameState
  move: (direction: Direction) => void
  newGame: () => void
  undo: () => void
  isLoggedIn: boolean
  playerStats: PlayerStats | null
  leaderboard: LeaderboardEntry[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  // 添加当前游戏的实时统计
  currentGameStats: {
    currentScore: number
    currentMoves: number
    currentDuration: number
    currentHighestTile: number
    sessionBest: number
    sessionGames: number
  }
}

interface PlayerStats {
  bestScore: number
  totalGames: number
  gamesWon: number
  winRate: number
  currentStreak: number
  bestStreak: number
  averageScore: number
  totalMoves: number
  totalDuration: number
  highestTile: number
  userRank: number
  username: string
}

interface LeaderboardEntry {
  rank: number
  username: string
  bestScore: number
  totalGames: number
  winRate: number
  averageScore: number
  highestTile: number
}

type GameAction =
  | { type: "MOVE"; direction: Direction }
  | { type: "NEW_GAME" }
  | { type: "UNDO" }
  | { type: "SET_GAME_STATE"; gameState: GameState }

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MOVE": {
      if (state.isGameOver) return state

      const { newBoard, scoreGained, moved } = moveBoard(state.board, action.direction)

      if (!moved) return state

      const boardWithNewTile = addRandomTile(newBoard)
      const newScore = state.score + scoreGained
      const newMoves = state.moves + 1
      const gameOver = isGameOver(boardWithNewTile)
      const won = !state.isWon && hasWon(boardWithNewTile)

      return {
        ...state,
        previousState: {
          board: state.board,
          score: state.score,
          moves: state.moves,
        },
        board: boardWithNewTile,
        score: newScore,
        moves: newMoves,
        isGameOver: gameOver,
        isWon: won,
        canUndo: true,
      }
    }

    case "NEW_GAME":
      return initializeGame()

    case "UNDO": {
      if (!state.canUndo || !state.previousState) return state

      return {
        ...state.previousState,
        isGameOver: false,
        isWon: false,
        canUndo: false,
      }
    }

    case "SET_GAME_STATE":
      return action.gameState

    default:
      return state
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initializeGame())
  const { user, loading: authLoading } = useAuth()
  const [playerStats, setPlayerStats] = React.useState<PlayerStats | null>(null)
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([])
  const [gameStartTime, setGameStartTime] = React.useState<number>(Date.now())
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // 实时订阅管理
  const [subscriptions, setSubscriptions] = React.useState<any[]>([])

  // 当前会话的最佳分数（用于实时显示）
  const [sessionBest, setSessionBest] = React.useState<number>(0)
  
  // 会话统计计数器
  const [sessionGames, setSessionGames] = React.useState<number>(0)

  // 计算当前游戏的实时统计
  const currentGameStats = React.useMemo(() => {
    const currentDuration = Math.floor((Date.now() - gameStartTime) / 1000)
    const currentHighestTile = getHighestTile(gameState.board)
    
    // 更新会话最佳分数
    if (gameState.score > sessionBest) {
      setSessionBest(gameState.score)
    }

    return {
      currentScore: gameState.score,
      currentMoves: gameState.moves,
      currentDuration: currentDuration,
      currentHighestTile: currentHighestTile,
      sessionBest: Math.max(sessionBest, gameState.score),
      sessionGames: sessionGames,
    }
  }, [gameState.score, gameState.moves, gameStartTime, gameState.board, sessionBest, sessionGames])

  // 实时更新游戏时长 - 每秒触发重新计算
  const [currentTime, setCurrentTime] = React.useState<number>(Date.now())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 重新计算包含实时时间的统计
  const realTimeGameStats = React.useMemo(() => {
    const currentDuration = Math.floor((currentTime - gameStartTime) / 1000)
    const currentHighestTile = getHighestTile(gameState.board)
    
    return {
      currentScore: gameState.score,
      currentMoves: gameState.moves,
      currentDuration: currentDuration,
      currentHighestTile: currentHighestTile,
      sessionBest: Math.max(sessionBest, gameState.score),
      sessionGames: sessionGames,
    }
  }, [gameState.score, gameState.moves, gameStartTime, gameState.board, sessionBest, currentTime, sessionGames])

  // 直接从数据库加载用户统计
  const loadPlayerStats = useCallback(async (retryCount = 0) => {
    if (!user) {
      // 如果没有用户登录，返回本地存储的统计（仅在客户端）
      if (typeof window !== 'undefined') {
        const localStats = {
          username: "Guest",
          bestScore: parseInt(localStorage.getItem("2048-best-score") || "0"),
          totalGames: parseInt(localStorage.getItem("2048-games-played") || "0"),
          gamesWon: parseInt(localStorage.getItem("2048-games-won") || "0"),
          currentStreak: parseInt(localStorage.getItem("2048-current-streak") || "0"),
          bestStreak: parseInt(localStorage.getItem("2048-best-streak") || "0"),
          winRate: parseInt(localStorage.getItem("2048-games-won") || "0") / Math.max(1, parseInt(localStorage.getItem("2048-games-played") || "1")) * 100,
          averageScore: parseInt(localStorage.getItem("2048-total-score") || "0") / Math.max(1, parseInt(localStorage.getItem("2048-games-played") || "1")),
          totalMoves: parseInt(localStorage.getItem("2048-total-moves") || "0"),
          totalDuration: parseInt(localStorage.getItem("2048-total-duration") || "0"),
          userRank: 0,
          highestTile: parseInt(localStorage.getItem("2048-highest-tile") || "0"),
        }
        setPlayerStats(localStats)
      }
      return
    }

    const maxRetries = 3
    try {
      console.log(`Loading player stats for user: ${user.id} (attempt ${retryCount + 1}/${maxRetries + 1})`)
      setError(null)

      // 这里不需要预先创建统计，因为 useAuth 已经处理了

      // 对于 Google OAuth 用户，给更多时间
      const isGoogleUser = user.app_metadata?.provider === 'google'
      const delay = isGoogleUser ? 300 : 100
      await new Promise(resolve => setTimeout(resolve, delay))

      // 使用 .select() 而不是 .single() 来避免错误
      const { data: statsData, error: statsError } = await supabase
        .from("player_stats")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)

      if (statsError) {
        console.error("Error loading player stats:", statsError)
        
        // 重试机制
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`)
          setTimeout(() => loadPlayerStats(retryCount + 1), (retryCount + 1) * 1000)
          return
        }
        
        setError("Failed to load statistics")
        return
      }

      // 检查是否有数据
      if (!statsData || statsData.length === 0) {
        console.log("No stats found, creating default...")
        await createDefaultStats()
        return
      }

      const stats = statsData[0]
      console.log("Raw stats from database:", stats)

      // 获取用户排名
      const { data: rankData } = await supabase.rpc("get_user_rank", {
        user_uuid: user.id,
      })

      const userRank = rankData || 0

      if (stats) {
        const playerStatsData = {
          bestScore: stats.best_score || 0,
          totalGames: stats.total_games || 0,
          gamesWon: stats.games_won || 0,
          winRate: stats.total_games > 0 ? (stats.games_won / stats.total_games) * 100 : 0,
          currentStreak: stats.current_streak || 0,
          bestStreak: stats.best_streak || 0,
          averageScore: stats.total_games > 0 ? (stats.best_score / stats.total_games) : 0,
          totalMoves: stats.total_moves || 0,
          totalDuration: stats.total_duration_seconds || 0,
          highestTile: stats.highest_tile_achieved || 0,
          userRank: userRank,
          username: stats.username || "Player",
        }

        console.log("Processed player stats:", playerStatsData)
        setPlayerStats(playerStatsData)
        setError(null)
      }
    } catch (error) {
      console.error("Exception loading player stats:", error)
      setError("Failed to load statistics")
    }
  }, [user])

  // 创建默认统计
  const createDefaultStats = async () => {
    if (!user) return

    try {
      console.log("Creating default stats for user:", user.id)
      console.log("User metadata:", user.user_metadata)
      console.log("User email:", user.email)

      // 获取用户名，优先级：full_name > name > email前缀
      const getUsername = () => {
        // Google 登录通常在 user_metadata 中有 full_name 或 name
        if (user.user_metadata?.full_name) return user.user_metadata.full_name
        if (user.user_metadata?.name) return user.user_metadata.name
        // 检查 identities 中的信息（Google 登录）
        if (user.identities?.[0]?.identity_data?.full_name) return user.identities[0].identity_data.full_name
        if (user.identities?.[0]?.identity_data?.name) return user.identities[0].identity_data.name
        if (user.email) return user.email.split("@")[0]
        return "Player"
      }

      const username = getUsername()
      console.log("Using username:", username)

      const { error } = await supabase.from("player_stats").upsert(
        {
          user_id: user.id,
          username: username,
          email: user.email || "",
          best_score: 0,
          total_games: 0,
          games_won: 0,
          current_streak: 0,
          best_streak: 0,
          total_moves: 0,
          total_duration_seconds: 0,
          highest_tile_achieved: 0,
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) {
        console.error("Error creating default stats:", error)
        setError("Failed to create user statistics")
      } else {
        console.log("Default stats created successfully")
        // 给数据库一点时间完成插入操作
        await new Promise(resolve => setTimeout(resolve, 200))
        // 立即重新加载统计
        await loadPlayerStats()
      }
    } catch (error) {
      console.error("Exception creating default stats:", error)
      setError("Failed to create user statistics")
    }
  }

  // 加载排行榜
  const loadLeaderboard = useCallback(async () => {
    try {
      console.log("Loading leaderboard...")

      const { data, error } = await supabase.from("global_leaderboard").select("*").limit(10)

      if (error) {
        console.error("Error loading leaderboard:", error)
        return
      }

      if (data && data.length > 0) {
        const leaderboardData = data.map((entry) => ({
          rank: entry.rank,
          username: entry.username || "Anonymous Player",
          bestScore: entry.best_score,
          totalGames: entry.total_games,
          winRate: Number.parseFloat(entry.win_rate) || 0,
          averageScore: Number.parseFloat(entry.average_score) || 0,
          highestTile: entry.highest_tile_achieved,
        }))

        console.log("Loaded leaderboard:", leaderboardData)
        setLeaderboard(leaderboardData)
      } else {
        console.log("No leaderboard data found")
        setLeaderboard([])
      }
    } catch (error) {
      console.error("Exception loading leaderboard:", error)
    }
  }, [])

  // 刷新所有数据 - 优化为平滑更新
  const refreshData = useCallback(async () => {
    console.log("Refreshing all data...")
    // 不显示loading状态，实现平滑更新
    await Promise.all([loadPlayerStats(), loadLeaderboard()])
  }, [loadPlayerStats, loadLeaderboard])

  // 设置实时订阅
  const setupRealtimeSubscriptions = useCallback(() => {
    console.log("Setting up real-time subscriptions...")

    // 清理现有订阅
    subscriptions.forEach((sub) => sub.unsubscribe())

    const newSubscriptions = []

    // 订阅玩家统计变化
    if (user) {
      const playerStatsSubscription = supabase
        .channel(`player-stats-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "player_stats",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Player stats updated via subscription:", payload)
            // 平滑更新，不显示loading
            setTimeout(() => loadPlayerStats(), 300)
          },
        )
        .subscribe()

      newSubscriptions.push(playerStatsSubscription)
    }

    // 订阅排行榜变化
    const leaderboardSubscription = supabase
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_stats",
        },
        (payload) => {
          console.log("Leaderboard updated via subscription:", payload)
          // 平滑更新排行榜
          setTimeout(() => loadLeaderboard(), 300)
        },
      )
      .subscribe()

    newSubscriptions.push(leaderboardSubscription)

    setSubscriptions(newSubscriptions)
  }, [user, loadPlayerStats, loadLeaderboard])

  // 用户变化时的处理
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User logged in, initializing data...")
      setLoading(true)
      setError(null)
      
      // 对于 Google OAuth 用户，给更多时间确保数据同步
      const isGoogleUser = user.app_metadata?.provider === 'google'
      const delay = isGoogleUser ? 1000 : 300
      
      console.log(`User provider: ${user.app_metadata?.provider}, delay: ${delay}ms`)
      
      setTimeout(() => {
        refreshData().finally(() => {
          setLoading(false)
          setupRealtimeSubscriptions()
        })
      }, delay)
    } else if (!user && !authLoading) {
      console.log("User logged out, clearing data...")
      setPlayerStats(null)
      setLeaderboard([])
      setError(null)
      subscriptions.forEach((sub) => sub.unsubscribe())
      setSubscriptions([])
    }

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe())
    }
  }, [user, authLoading])

  // 保存游戏会话 - 确保正确传递胜利状态
  const saveGameSession = async (finalGameState: GameState) => {
    if (!user) return

    try {
      const duration = Math.floor((Date.now() - gameStartTime) / 1000)
      const highestTile = getHighestTile(finalGameState.board)
      const isWon = finalGameState.isWon || highestTile >= 2048

      console.log("Saving game session:", {
        score: finalGameState.score,
        moves: finalGameState.moves,
        won: isWon,
        duration,
        highestTile,
      })

      const { error } = await supabase.from("game_sessions").insert({
        user_id: user.id,
        score: finalGameState.score,
        moves_count: finalGameState.moves,
        duration_seconds: duration,
        is_won: isWon, // 确保正确传递胜利状态
        highest_tile: highestTile,
        game_board: finalGameState.board,
      })

      if (error) {
        console.error("Error saving game session:", error)
        setError("Failed to save game session")
      } else {
        console.log("Game session saved successfully")
        setError(null)
        // 触发器应该自动更新统计，延迟刷新确保数据同步
        setTimeout(() => refreshData(), 1500)
      }
    } catch (error) {
      console.error("Exception saving game session:", error)
      setError("Failed to save game session")
    }
  }

  const move = (direction: Direction) => {
    const currentState = gameState
    dispatch({ type: "MOVE", direction })

    // 检查游戏是否结束
    const { newBoard, moved } = moveBoard(currentState.board, direction)
    if (moved) {
      const boardWithNewTile = addRandomTile(newBoard)
      const gameOver = isGameOver(boardWithNewTile)

      if (gameOver && user && !currentState.isGameOver) {
        // 游戏结束，保存会话
        const finalState = {
          ...currentState,
          board: boardWithNewTile,
          score: currentState.score + moveBoard(currentState.board, direction).scoreGained,
          moves: currentState.moves + 1,
          isGameOver: true,
          isWon: !currentState.isWon && hasWon(boardWithNewTile),
        }
        setTimeout(() => saveGameSession(finalState), 100)
      }
    }
  }

  const newGame = () => {
    setGameStartTime(Date.now())
    setError(null)
    setSessionBest(0) // 重置会话最佳分数
    setSessionGames(prev => prev + 1) // 增加会话游戏数
    dispatch({ type: "NEW_GAME" })
  }

  const undo = () => {
    dispatch({ type: "UNDO" })
  }

  // 保存游戏状态到localStorage
  useEffect(() => {
    localStorage.setItem("2048-game-state", JSON.stringify(gameState))
  }, [gameState])

  // 从localStorage加载游戏状态
  useEffect(() => {
    const saved = localStorage.getItem("2048-game-state")
    if (saved) {
      try {
        const savedState = JSON.parse(saved)
        dispatch({ type: "SET_GAME_STATE", gameState: savedState })
      } catch (error) {
        console.error("Failed to load saved game:", error)
      }
    }
  }, [])

  return (
    <GameContext.Provider
      value={{
        gameState,
        move,
        newGame,
        undo,
        isLoggedIn: !!user,
        playerStats,
        leaderboard,
        loading: loading || authLoading,
        error,
        refreshData,
        currentGameStats: realTimeGameStats,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
