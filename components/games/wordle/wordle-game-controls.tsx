"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMultiGame } from '@/contexts/multi-game-context';
import { DIFFICULTY, GAME_MODE, getDifficultyDescription, type Difficulty, type GameMode } from '@/lib/wordle-logic';
import { RotateCcw, Settings, Info } from 'lucide-react';

export default function WordleGameControls() {
  const { wordleState, newWordleGame, currentGameStats } = useMultiGame();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(DIFFICULTY.NORMAL);
  const [selectedMode, setSelectedMode] = useState<GameMode>(GAME_MODE.NORMAL);
  const [showSettings, setShowSettings] = useState(false);

  const handleNewGame = () => {
    newWordleGame(selectedDifficulty, selectedMode);
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case DIFFICULTY.EASY:
        return 'bg-green-100 text-green-800';
      case DIFFICULTY.NORMAL:
        return 'bg-blue-100 text-blue-800';
      case DIFFICULTY.HARD:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeColor = (mode: GameMode) => {
    switch (mode) {
      case GAME_MODE.NORMAL:
        return 'bg-blue-100 text-blue-800';
      case GAME_MODE.PRACTICE:
        return 'bg-yellow-100 text-yellow-800';
      case GAME_MODE.INFINITE:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Game Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span>Game Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(wordleState.difficulty)}>
              {wordleState.difficulty.toUpperCase()}
            </Badge>
            <Badge className={getModeColor(wordleState.mode)}>
              {wordleState.mode.toUpperCase()}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            {getDifficultyDescription(wordleState.difficulty)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Guesses</div>
              <div className="font-semibold">{wordleState.guessCount}/6</div>
            </div>
            <div>
              <div className="text-gray-500">Duration</div>
              <div className="font-semibold">
                {Math.floor(currentGameStats.currentDuration / 60)}:{(currentGameStats.currentDuration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Controls</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? 'Hide' : 'Settings'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Game Button */}
          <Button
            onClick={handleNewGame}
            className="w-full"
            variant="default"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>

          {/* Settings Panel */}
          {showSettings && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as Difficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DIFFICULTY.EASY}>Easy - Any 5 letters</SelectItem>
                    <SelectItem value={DIFFICULTY.NORMAL}>Normal - Valid words</SelectItem>
                    <SelectItem value={DIFFICULTY.HARD}>Hard - Use all hints</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <Select value={selectedMode} onValueChange={(value) => setSelectedMode(value as GameMode)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GAME_MODE.NORMAL}>Normal - Counts toward stats</SelectItem>
                    <SelectItem value={GAME_MODE.PRACTICE}>Practice - No stats recorded</SelectItem>
                    <SelectItem value={GAME_MODE.INFINITE}>Infinite - Play unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-gray-500">
                <p><strong>Normal:</strong> Games count toward your statistics and leaderboard ranking.</p>
                <p><strong>Practice:</strong> Play without affecting your stats - perfect for learning.</p>
                <p><strong>Infinite:</strong> Play as many games as you want with unlimited attempts.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Session Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Games Played</div>
              <div className="font-semibold">{currentGameStats.sessionGames}</div>
            </div>
            <div>
              <div className="text-gray-500">Current Streak</div>
              <div className="font-semibold">-</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 