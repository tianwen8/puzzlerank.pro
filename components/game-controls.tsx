"use client"

import { Button } from "@/components/ui/button"
import { useMultiGame } from "@/contexts/multi-game-context"
import { RotateCcw, Play, Trophy, Target } from "lucide-react"

export default function GameControls() {
  const { game2048State: gameState, newGame2048: newGame, undo2048: undo, currentGameStats } = useMultiGame()

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 主要控制按钮 */}
    <div className="flex flex-row space-x-6">
      <Button
        onClick={newGame}
          className="game-button bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 text-lg font-semibold"
        variant="outline"
        size="lg"
      >
        <Play className="w-5 h-5 mr-2" />
        New Game
      </Button>

      <Button
        onClick={undo}
        disabled={!gameState.canUndo}
          className="game-button bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-lg font-semibold"
        variant="outline"
        size="lg"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Undo
      </Button>
      </div>

      {/* 游戏实时统计信息 */}
      <div className="flex flex-row space-x-8 text-white/80 text-sm">
        <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <div className="flex flex-col">
            <span className="text-xs opacity-80">Current Score</span>
            <span className="font-semibold number-counter text-yellow-300">
              {currentGameStats.currentScore.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
          <Target className="w-4 h-4 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-xs opacity-80">Moves</span>
            <span className="font-semibold number-counter text-blue-300">
              {currentGameStats.currentMoves}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
          <Target className="w-4 h-4 text-green-400" />
          <div className="flex flex-col">
            <span className="text-xs opacity-80">Best This Session</span>
            <span className="font-semibold number-counter text-green-300">
              {currentGameStats.sessionBest.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 游戏提示 */}
      <div className="text-center text-white/60 text-xs max-w-md">
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-white/20 rounded border border-white/30 flex items-center justify-center text-xs">
              ←
            </div>
            <div className="w-6 h-6 bg-white/20 rounded border border-white/30 flex items-center justify-center text-xs">
              →
            </div>
            <div className="w-6 h-6 bg-white/20 rounded border border-white/30 flex items-center justify-center text-xs">
              ↑
            </div>
            <div className="w-6 h-6 bg-white/20 rounded border border-white/30 flex items-center justify-center text-xs">
              ↓
            </div>
          </div>
          <span className="text-xs">or swipe to move</span>
        </div>
      </div>
    </div>
  )
}
