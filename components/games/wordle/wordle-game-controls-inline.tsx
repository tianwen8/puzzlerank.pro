"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMultiGame } from "@/contexts/multi-game-context"
import { DIFFICULTY, GAME_MODE, type Difficulty, type GameMode } from "@/lib/wordle-logic"
import { RotateCcw, Play, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function WordleGameControlsInline() {
  const { wordleState, newWordleGame } = useMultiGame()

  const handleDifficultyChange = (difficulty: string) => {
    // 直接使用传入的difficulty值，它已经是正确的字符串值
    newWordleGame(difficulty as Difficulty, wordleState.mode)
  }

  const handleModeChange = (mode: string) => {
    // 同样直接使用传入的mode值
    newWordleGame(wordleState.difficulty, mode as GameMode)
  }

  const handleNewGame = () => {
    newWordleGame(wordleState.difficulty, wordleState.mode)
  }

  const getDifficultyText = () => {
    switch (wordleState.difficulty) {
      case DIFFICULTY.EASY:
        return "Easy - Any 5-letter combination"
      case DIFFICULTY.HARD:
        return "Hard - Must use all revealed hints"
      default:
        return "Normal - Valid words only"
    }
  }

  const getModeText = () => {
    switch (wordleState.mode) {
      case GAME_MODE.PRACTICE:
        return "Practice - No stats tracking"
      case GAME_MODE.INFINITE:
        return "Infinite - Play unlimited games"
      default:
        return "Normal - Daily challenge"
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-2 md:p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          {/* Left side - Game controls */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                onClick={handleNewGame}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 md:px-4 py-1 md:py-2 font-semibold text-xs md:text-sm shadow-lg transition-all duration-200"
                size="sm"
              >
                <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                New
              </Button>
              
              <Link href="/daily-hints">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 md:px-4 py-1 md:py-2 font-semibold text-xs md:text-sm shadow-lg transition-all duration-200"
                  size="sm"
                >
                  <Lightbulb className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  Hints
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2">
              <Select value={wordleState.difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-20 md:w-32 h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DIFFICULTY.EASY}>Easy</SelectItem>
                  <SelectItem value={DIFFICULTY.NORMAL}>Normal</SelectItem>
                  <SelectItem value={DIFFICULTY.HARD}>Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={wordleState.mode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-20 md:w-32 h-8 md:h-10 text-xs md:text-sm">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GAME_MODE.NORMAL}>Normal</SelectItem>
                  <SelectItem value={GAME_MODE.PRACTICE}>Practice</SelectItem>
                  <SelectItem value={GAME_MODE.INFINITE}>Infinite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right side - Current settings info - Hidden on mobile */}
          <div className="hidden md:block text-sm text-gray-600 text-center md:text-right">
            <div className="font-medium">{getDifficultyText()}</div>
            <div className="text-xs">{getModeText()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 