"use client"

import React, { useEffect, useCallback } from 'react';
import { useMultiGame } from '@/contexts/multi-game-context';
import { KEYBOARD_LETTERS, LETTERS, getKeyClassName, GAME_STATE } from '@/lib/wordle-logic';

export default function WordleKeyboard() {
  const { wordleState, addWordleLetter, deleteWordleLetter, submitWordleGuess } = useMultiGame();

  // Handle keyboard input
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (wordleState.gameState !== GAME_STATE.PLAYING) return;

    // Add null check for event.key
    if (!event.key) return;
    
    // CRITICAL FIX: Don't intercept keyboard events when user is typing in form inputs
    // This was causing AuthModal input fields to be unresponsive
    const target = event.target as HTMLElement;
    if (target && (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.contentEditable === 'true' ||
      target.closest('[role="dialog"]') || // Don't interfere with dialog inputs
      target.closest('[data-auth-modal="true"]') // Specifically avoid AuthModal
    )) {
      return; // Let the form handle the input normally
    }
    
    const key = event.key.toUpperCase();
    const areModifiersPressed = event.ctrlKey || event.altKey || event.metaKey;

    if (!areModifiersPressed) {
      if (LETTERS.includes(key)) {
        addWordleLetter(key);
        event.preventDefault();
      } else if (key === 'ENTER') {
        submitWordleGuess();
        event.preventDefault();
      } else if (key === 'BACKSPACE') {
        deleteWordleLetter();
        event.preventDefault();
      }
    }
  }, [wordleState.gameState, addWordleLetter, deleteWordleLetter, submitWordleGuess]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleKeyClick = (letter: string) => {
    if (wordleState.gameState !== GAME_STATE.PLAYING) return;
    addWordleLetter(letter);
  };

  const handleEnterClick = () => {
    if (wordleState.gameState !== GAME_STATE.PLAYING) return;
    submitWordleGuess();
  };

  const handleDeleteClick = () => {
    if (wordleState.gameState !== GAME_STATE.PLAYING) return;
    deleteWordleLetter();
  };

  return (
    <div className="w-full max-w-lg mx-auto mobile-keyboard" data-keyboard>
      <div className="flex flex-col items-center gap-1 select-none">
        {KEYBOARD_LETTERS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {/* Enter key on the bottom row */}
            {rowIndex === KEYBOARD_LETTERS.length - 1 && (
              <button
                onClick={handleEnterClick}
                className="px-2 py-2 text-xs font-medium rounded bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors min-w-[50px] md:min-w-[60px] mobile-button"
                disabled={wordleState.gameState !== GAME_STATE.PLAYING}
              >
                ENTER
              </button>
            )}
            
            {/* Letter keys */}
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleKeyClick(letter)}
                className={`w-8 h-10 md:w-10 md:h-10 flex items-center justify-center font-bold text-xs md:text-sm rounded transition-colors mobile-button ${
                  getKeyClassName(letter, wordleState.letterStatuses)
                }`}
                disabled={wordleState.gameState !== GAME_STATE.PLAYING}
              >
                {letter}
              </button>
            ))}
            
            {/* Delete key on the bottom row */}
            {rowIndex === KEYBOARD_LETTERS.length - 1 && (
              <button
                onClick={handleDeleteClick}
                className="px-2 py-2 text-xs font-medium rounded bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors min-w-[50px] md:min-w-[60px] flex items-center justify-center mobile-button"
                disabled={wordleState.gameState !== GAME_STATE.PLAYING}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-4 text-xs text-gray-500">
        Use keyboard or click letters to play. Press ENTER to submit.
      </div>
    </div>
  );
} 