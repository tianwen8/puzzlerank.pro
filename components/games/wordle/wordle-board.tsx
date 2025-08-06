"use client"

import React from 'react';
import { useMultiGame } from '@/contexts/multi-game-context';
import { getCellClassName, WORD_LENGTH, MAX_GUESSES } from '@/lib/wordle-logic';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DIFFICULTY, GAME_MODE } from '@/lib/wordle-logic';
// import GameEndModal from './wordle-game-end-modal'; // Removed - controls always visible

export default function WordleBoard() {
  const { 
    wordleState, 
    newWordleGame
  } = useMultiGame();

  // Modal state removed - controls always visible now

  const handleNewGame = () => {
    newWordleGame(wordleState.difficulty, wordleState.mode);
  };

  const handleDifficultyChange = (difficulty: string) => {
    newWordleGame(difficulty as any, wordleState.mode);
  };

  const handleModeChange = (mode: string) => {
    newWordleGame(wordleState.difficulty, mode as any);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-2 md:p-6 max-w-md mx-auto">
        {/* Desktop title */}
        <h2 className="hidden md:block text-2xl font-bold text-gray-800 mb-6">WORD PUZZLE</h2>
        
        {/* Mobile only controls - inside game board */}
        <div className="md:hidden w-full flex items-center justify-center gap-1 mb-3">
          <Button
            onClick={handleNewGame}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-2 py-1 font-semibold text-xs shadow-lg transition-all duration-200"
            size="sm"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            New
          </Button>
          
          <Select value={wordleState.difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-16 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DIFFICULTY.EASY}>Easy</SelectItem>
              <SelectItem value={DIFFICULTY.NORMAL}>Normal</SelectItem>
              <SelectItem value={DIFFICULTY.HARD}>Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={wordleState.mode} onValueChange={handleModeChange}>
            <SelectTrigger className="w-16 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GAME_MODE.NORMAL}>Normal</SelectItem>
              <SelectItem value={GAME_MODE.PRACTICE}>Practice</SelectItem>
              <SelectItem value={GAME_MODE.INFINITE}>Infinite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      
              <div className="grid grid-rows-6 gap-2 mb-2 md:mb-6 relative">
          {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }, (_, colIndex) => (
                <div
                  key={colIndex}
                  className={getCellClassName(
                    rowIndex,
                    colIndex,
                    wordleState.currentRow,
                    wordleState.submittedInvalidWord,
                    wordleState.board[rowIndex][colIndex],
                    wordleState.cellStatuses
                  )}
                >
                  {wordleState.board[rowIndex][colIndex]}
                </div>
              ))}
            </div>
          ))}
          
          {/* Mobile invalid word feedback only */}
          {wordleState.submittedInvalidWord && (
            <div className="md:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
              Invalid word!
            </div>
          )}
        </div>

        {/* Game status display - Desktop only */}
        <div className="text-center hidden md:block">
          <div className="text-sm text-gray-600 mb-2">
            Guesses: {wordleState.guessCount}/{MAX_GUESSES}
          </div>
          
          {wordleState.submittedInvalidWord && (
            <div className="text-red-600 text-sm mb-2">
              Invalid word! Please try again.
            </div>
          )}
          
          {wordleState.isWon && (
            <div className="text-green-600 text-lg font-bold mb-2">
              🎉 Congratulations! You won!
            </div>
          )}
          
          {wordleState.isLost && (
            <div className="text-red-600 text-lg font-bold mb-2">
              💔 Game Over! The word was: {wordleState.answer}
            </div>
          )}
          
          {/* Difficulty and mode display */}
          <div className="text-xs text-gray-500 mt-4">
            <div>Difficulty: {wordleState.difficulty.toUpperCase()}</div>
            <div>Mode: {wordleState.mode.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Game End Modal removed - controls now always visible */}
    </>
  );
} 