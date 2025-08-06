"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useMultiGame } from "@/contexts/multi-game-context"
import { cn } from "@/lib/utils"

const tileColors: Record<number, string> = {
  2: "bg-slate-100 text-slate-800",
  4: "bg-slate-200 text-slate-800",
  8: "bg-orange-300 text-white",
  16: "bg-orange-400 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-red-400 text-white",
  128: "bg-yellow-400 text-white",
  256: "bg-yellow-500 text-white",
  512: "bg-yellow-600 text-white",
  1024: "bg-green-500 text-white",
  2048: "bg-green-600 text-white",
}

interface TileData {
  id: string
  value: number
  position: [number, number]
  isNew: boolean
  isMerged: boolean
}

// 简化的Tile组件
function Tile({ tile }: { tile: TileData }) {
  const [row, col] = tile.position
  const fontSize = tile.value >= 1024 ? "text-2xl" : tile.value >= 128 ? "text-3xl" : "text-4xl"

  return (
    <div
      className={cn(
        "absolute w-20 h-20 rounded-lg flex items-center justify-center font-bold transition-all duration-150 ease-in-out",
        tileColors[tile.value] || "bg-purple-500 text-white",
        fontSize,
        tile.isNew && "animate-tile-appear",
        tile.isMerged && "animate-tile-pop"
      )}
      style={{
        transform: `translate(${col * 88}px, ${row * 88}px)`,
        zIndex: tile.isMerged ? 10 : 1,
      }}
      data-game-tile
    >
      {tile.value}
    </div>
  )
}

export default function GameBoard() {
  const { game2048State: gameState, move2048: move, newGame2048: newGame } = useMultiGame()
  const [tiles, setTiles] = useState<TileData[]>([])

  // 简化的瓦片生成逻辑
  const generateTiles = useCallback((board: number[][]) => {
    const newTiles: TileData[] = []

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = board[row][col]
        if (value > 0) {
          newTiles.push({
            id: `tile-${row}-${col}-${value}-${Date.now()}`,
            value,
            position: [row, col],
            isNew: false,
            isMerged: false,
          })
        }
      }
    }
    
    return newTiles
  }, [])

  // 监听游戏状态变化
  useEffect(() => {
    const newTiles = generateTiles(gameState.board)
        setTiles(newTiles)
  }, [gameState.board, generateTiles])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          move("up")
          break
        case "ArrowDown":
          e.preventDefault()
          move("down")
          break
        case "ArrowLeft":
          e.preventDefault()
          move("left")
          break
        case "ArrowRight":
          e.preventDefault()
          move("right")
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [move, gameState.isGameOver])

  // 触摸事件处理
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartPos.x
    const deltaY = touch.clientY - touchStartPos.y
    
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          move("right")
        } else {
          move("left")
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          move("down")
        } else {
          move("up")
      }
    }
    }

    setTouchStartPos(null)
  }

  const handlePlayAgain = () => {
    newGame()
  }

  const handleContinue = () => {
    // 继续游戏逻辑已在context中处理
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-white mb-2">2048</h2>
        <p className="text-white/80 text-sm">Join the tiles, get to 2048!</p>
      </div>

      <div className="bg-white/20 p-2 rounded-lg relative">
        <div className="text-center mb-4">
          <div className="text-white text-3xl font-bold">Score: {gameState.score.toLocaleString()}</div>
          <div className="text-white/80 text-sm">Moves: {gameState.moves}</div>
        </div>

        <div
          className="relative w-96 h-96 bg-gray-300 rounded-lg p-2 md:w-96 md:h-96 mobile-2048-board game-area"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 网格背景 */}
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`grid-${i}`}
              className="absolute w-20 h-20 bg-gray-400 rounded-lg"
              style={{
                transform: `translate(${(i % 4) * 88}px, ${Math.floor(i / 4) * 88}px)`,
              }}
            />
          ))}

          {/* 游戏瓦片 */}
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}

          {/* 游戏结束遮罩 */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg z-20">
            <div className="bg-white p-8 rounded-xl text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                <h3 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h3>
                <p className="text-gray-600 mb-6 text-lg">Score: {gameState.score.toLocaleString()}</p>
              <button
                onClick={handlePlayAgain}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                  New Game
              </button>
            </div>
          </div>
        )}

          {/* 获胜遮罩 */}
        {gameState.isWon && !gameState.isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg z-20">
            <div className="bg-white p-8 rounded-xl text-center shadow-2xl animate-in fade-in zoom-in duration-300">
              <h3 className="text-3xl font-bold text-yellow-600 mb-4">🎉 You Win! 🎉</h3>
              <p className="text-gray-600 mb-6 text-lg">Score: {gameState.score.toLocaleString()}</p>
              <div className="space-x-4">
                <button
                  onClick={handlePlayAgain}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  New Game
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-white/60 text-sm">
        <p>Use arrow keys or swipe to move tiles</p>
          <p className="text-xs mt-1">Experience smooth tile animations!</p>
        </div>
      </div>
    </div>
  )
}
