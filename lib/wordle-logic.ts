// Wordle Game Logic
// Adapted from word-master source code
// Created: January 15, 2025

import { WordleGameData } from './supabase/types';

// Game constants
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

// Letter status constants
export const LETTER_STATUS = {
  GREEN: 'green',
  YELLOW: 'yellow',
  GRAY: 'gray',
  UNGUESSED: 'unguessed',
} as const;

export type LetterStatus = typeof LETTER_STATUS[keyof typeof LETTER_STATUS];

// Keyboard layout
export const KEYBOARD_LETTERS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

// All letters for validation
export const LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

// Game difficulties
export const DIFFICULTY = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
} as const;

export type Difficulty = typeof DIFFICULTY[keyof typeof DIFFICULTY];

// Game modes
export const GAME_MODE = {
  NORMAL: 'normal',
  PRACTICE: 'practice',
  INFINITE: 'infinite',
} as const;

export type GameMode = typeof GAME_MODE[keyof typeof GAME_MODE];

// Game state
export const GAME_STATE = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
} as const;

export type GameStateType = typeof GAME_STATE[keyof typeof GAME_STATE];

// Word validation interface
export interface WordValidation {
  isValid: boolean;
  errorMessage?: string;
}

// Cell state interface
export interface CellState {
  letter: string;
  status: LetterStatus;
}

// Game board type
export type GameBoard = string[][];
export type CellStatuses = LetterStatus[][];

// Letter statuses type
export type LetterStatuses = { [key: string]: LetterStatus };

// Complete Wordle game state
export interface WordleGameState {
  answer: string;
  board: GameBoard;
  cellStatuses: CellStatuses;
  currentRow: number;
  currentCol: number;
  letterStatuses: LetterStatuses;
  gameState: GameStateType;
  difficulty: Difficulty;
  mode: GameMode;
  submittedInvalidWord: boolean;
  guessCount: number;
  startTime: number;
  endTime?: number;
  isWon: boolean;
  isLost: boolean;
}

// Word lists (we'll import these from the copied word-master data)
let answersCache: string[] = [];
let wordsCache: { [key: string]: boolean } = {};

// Initialize word lists
export const initializeWordLists = async () => {
  try {
    // Import answers from internal data (array format)
    const answersModule = await import('./data/wordle-answers');
    answersCache = answersModule.WORDLE_ANSWERS || [];
    
    // Import words dictionary from internal data (object format)
    const wordsModule = await import('./data/wordle-words');
    wordsCache = wordsModule.WORDS || {};
    
    console.log(`Loaded ${answersCache.length} answers and ${Object.keys(wordsCache).length} words`);
  } catch (error) {
    console.error('Failed to load word lists:', error);
    // Fallback to a small set of words
    answersCache = ['HELLO', 'WORLD', 'REACT', 'TYPES', 'GAMES'];
    wordsCache = {
      'hello': true, 'world': true, 'react': true, 'types': true, 'games': true,
      'about': true, 'above': true, 'after': true, 'again': true, 'black': true,
    };
  }
};

// Get random answer
export const getRandomAnswer = (): string => {
  if (answersCache.length === 0) {
    return 'HELLO'; // Fallback
  }
  const randomIndex = Math.floor(Math.random() * answersCache.length);
  return answersCache[randomIndex].toUpperCase();
};

// Initialize empty game state
export const initializeWordleGame = (
  difficulty: Difficulty = DIFFICULTY.NORMAL,
  mode: GameMode = GAME_MODE.NORMAL
): WordleGameState => {
  // Initialize empty board
  const board: GameBoard = Array(MAX_GUESSES).fill(null).map(() => Array(WORD_LENGTH).fill(''));
  
  // Initialize cell statuses
  const cellStatuses: CellStatuses = Array(MAX_GUESSES).fill(null).map(() => 
    Array(WORD_LENGTH).fill(LETTER_STATUS.UNGUESSED)
  );
  
  // Initialize letter statuses
  const letterStatuses: LetterStatuses = {};
  LETTERS.forEach(letter => {
    letterStatuses[letter] = LETTER_STATUS.UNGUESSED;
  });
  
  return {
    answer: getRandomAnswer(),
    board,
    cellStatuses,
    currentRow: 0,
    currentCol: 0,
    letterStatuses,
    gameState: GAME_STATE.PLAYING,
    difficulty,
    mode,
    submittedInvalidWord: false,
    guessCount: 0,
    startTime: Date.now(),
    isWon: false,
    isLost: false,
  };
};

// Word validation based on difficulty
export const validateWord = (word: string, difficulty: Difficulty, letterStatuses: LetterStatuses, exactGuesses: { [key: number]: string } = {}): WordValidation => {
  if (word.length < WORD_LENGTH) {
    return {
      isValid: false,
      errorMessage: `Please enter a ${WORD_LENGTH} letter word`
    };
  }
  
  if (difficulty === DIFFICULTY.EASY) {
    return { isValid: true };
  }
  
  if (difficulty === DIFFICULTY.NORMAL) {
    if (!wordsCache[word.toLowerCase()]) {
      return {
        isValid: false,
        errorMessage: `${word} is not a valid word. Please try again.`
      };
    }
    return { isValid: true };
  }
  
  if (difficulty === DIFFICULTY.HARD) {
    // Check if word is valid
    if (!wordsCache[word.toLowerCase()]) {
      return {
        isValid: false,
        errorMessage: `${word} is not a valid word. Please try again.`
      };
    }
    
    // Check if all yellow letters are used
    const guessedLetters = Object.entries(letterStatuses).filter(([letter, status]) =>
      [LETTER_STATUS.YELLOW, LETTER_STATUS.GREEN].includes(status as any)
    );
    
    const yellowsUsed = guessedLetters.every(([letter]) => word.includes(letter));
    const greensUsed = Object.entries(exactGuesses).every(
      ([position, letter]) => word[parseInt(position)] === letter
    );
    
    if (!yellowsUsed || !greensUsed) {
      return {
        isValid: false,
        errorMessage: "In hard mode, you must use all the hints you've been given."
      };
    }
  }
  
  return { isValid: true };
};

// Add letter to current position
export const addLetter = (state: WordleGameState, letter: string): WordleGameState => {
  if (state.currentCol >= WORD_LENGTH || state.gameState !== GAME_STATE.PLAYING) {
    return state;
  }
  
  const newBoard = state.board.map(row => [...row]);
  newBoard[state.currentRow][state.currentCol] = letter.toUpperCase();
  
  return {
    ...state,
    board: newBoard,
    currentCol: state.currentCol + 1,
    submittedInvalidWord: false,
  };
};

// Delete letter from current position
export const deleteLetter = (state: WordleGameState): WordleGameState => {
  if (state.currentCol === 0 || state.gameState !== GAME_STATE.PLAYING) {
    return state;
  }
  
  const newBoard = state.board.map(row => [...row]);
  newBoard[state.currentRow][state.currentCol - 1] = '';
  
  return {
    ...state,
    board: newBoard,
    currentCol: state.currentCol - 1,
    submittedInvalidWord: false,
  };
};

// Update cell statuses after guess
export const updateCellStatuses = (word: string, answer: string, rowNumber: number, cellStatuses: CellStatuses): CellStatuses => {
  const newCellStatuses = cellStatuses.map(row => [...row]);
  const answerLetters = answer.split('');
  
  // Set all to gray first
  for (let i = 0; i < WORD_LENGTH; i++) {
    newCellStatuses[rowNumber][i] = LETTER_STATUS.GRAY;
  }
  
  // Check greens (exact matches)
  for (let i = WORD_LENGTH - 1; i >= 0; i--) {
    if (word[i] === answer[i]) {
      newCellStatuses[rowNumber][i] = LETTER_STATUS.GREEN;
      answerLetters.splice(i, 1);
    }
  }
  
  // Check yellows (wrong position)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (answerLetters.includes(word[i]) && newCellStatuses[rowNumber][i] !== LETTER_STATUS.GREEN) {
      newCellStatuses[rowNumber][i] = LETTER_STATUS.YELLOW;
      const index = answerLetters.indexOf(word[i]);
      if (index > -1) {
        answerLetters.splice(index, 1);
      }
    }
  }
  
  return newCellStatuses;
};

// Update letter statuses for keyboard
export const updateLetterStatuses = (word: string, answer: string, letterStatuses: LetterStatuses): LetterStatuses => {
  const newLetterStatuses = { ...letterStatuses };
  
  for (let i = 0; i < WORD_LENGTH; i++) {
    const letter = word[i];
    
    if (answer[i] === letter) {
      newLetterStatuses[letter] = LETTER_STATUS.GREEN;
    } else if (answer.includes(letter) && newLetterStatuses[letter] !== LETTER_STATUS.GREEN) {
      newLetterStatuses[letter] = LETTER_STATUS.YELLOW;
    } else if (newLetterStatuses[letter] === LETTER_STATUS.UNGUESSED) {
      newLetterStatuses[letter] = LETTER_STATUS.GRAY;
    }
  }
  
  return newLetterStatuses;
};

// Submit guess
export const submitGuess = (state: WordleGameState, exactGuesses: { [key: number]: string } = {}): WordleGameState => {
  if (state.currentCol < WORD_LENGTH || state.gameState !== GAME_STATE.PLAYING) {
    return state;
  }
  
  const word = state.board[state.currentRow].join('');
  
  // Validate word
  const validation = validateWord(word, state.difficulty, state.letterStatuses, exactGuesses);
  if (!validation.isValid) {
    return {
      ...state,
      submittedInvalidWord: true,
    };
  }
  
  // Update cell statuses
  const newCellStatuses = updateCellStatuses(word, state.answer, state.currentRow, state.cellStatuses);
  
  // Update letter statuses
  const newLetterStatuses = updateLetterStatuses(word, state.answer, state.letterStatuses);
  
  // Check if won
  const isWon = word === state.answer;
  const isLost = !isWon && state.currentRow >= MAX_GUESSES - 1;
  
  // Determine game state
  let gameState: GameStateType = GAME_STATE.PLAYING;
  if (isWon) {
    gameState = GAME_STATE.WON;
  } else if (isLost) {
    gameState = GAME_STATE.LOST;
  }
  
  return {
    ...state,
    cellStatuses: newCellStatuses,
    letterStatuses: newLetterStatuses,
    currentRow: state.currentRow + 1,
    currentCol: 0,
    gameState,
    guessCount: state.currentRow + 1,
    endTime: (isWon || isLost) ? Date.now() : state.endTime,
    isWon,
    isLost,
    submittedInvalidWord: false,
  };
};

// Get cell style class name
export const getCellClassName = (rowNumber: number, colNumber: number, currentRow: number, submittedInvalidWord: boolean, letter: string, cellStatuses: CellStatuses): string => {
  const baseClasses = 'w-12 h-12 border-2 rounded flex items-center justify-center text-lg font-bold transition-all duration-300';
  
  if (rowNumber === currentRow) {
    if (letter) {
      return `${baseClasses} border-gray-500 bg-gray-100 text-gray-900 ${submittedInvalidWord ? 'border-red-500 bg-red-100' : ''}`;
    }
    return `${baseClasses} border-gray-300 bg-white text-gray-900`;
  }
  
  const status = cellStatuses[rowNumber][colNumber];
  switch (status) {
    case LETTER_STATUS.GREEN:
      return `${baseClasses} border-green-500 bg-green-500 text-white`;
    case LETTER_STATUS.YELLOW:
      return `${baseClasses} border-yellow-500 bg-yellow-500 text-white`;
    case LETTER_STATUS.GRAY:
      return `${baseClasses} border-gray-500 bg-gray-500 text-white`;
    default:
      return `${baseClasses} border-gray-300 bg-white text-gray-900`;
  }
};

// Get keyboard key class name
export const getKeyClassName = (letter: string, letterStatuses: LetterStatuses): string => {
  const baseClasses = 'px-3 py-2 rounded font-medium transition-all duration-200 text-sm';
  
  const status = letterStatuses[letter];
  switch (status) {
    case LETTER_STATUS.GREEN:
      return `${baseClasses} bg-green-500 text-white`;
    case LETTER_STATUS.YELLOW:
      return `${baseClasses} bg-yellow-500 text-white`;
    case LETTER_STATUS.GRAY:
      return `${baseClasses} bg-gray-500 text-white`;
    default:
      return `${baseClasses} bg-gray-200 text-gray-900 hover:bg-gray-300`;
  }
};

// Convert game state to database format
export const convertToGameData = (state: WordleGameState): WordleGameData => {
  return {
    answer: state.answer,
    guesses: state.board.slice(0, state.guessCount).map(row => row.join('')),
    currentRow: state.currentRow,
    isWon: state.isWon,
    guessCount: state.guessCount,
    difficulty: state.difficulty,
    mode: state.mode,
  };
};

// Convert database format to game state
export const convertFromGameData = (data: WordleGameData): WordleGameState => {
  const state = initializeWordleGame(data.difficulty, data.mode);
  
  // Restore answer
  state.answer = data.answer;
  
  // Restore guesses
  data.guesses.forEach((guess, rowIndex) => {
    for (let colIndex = 0; colIndex < guess.length; colIndex++) {
      state.board[rowIndex][colIndex] = guess[colIndex];
    }
    
    // Update cell statuses for this row
    state.cellStatuses = updateCellStatuses(guess, data.answer, rowIndex, state.cellStatuses);
    
    // Update letter statuses
    state.letterStatuses = updateLetterStatuses(guess, data.answer, state.letterStatuses);
  });
  
  // Restore current position
  state.currentRow = data.currentRow;
  state.currentCol = 0;
  state.guessCount = data.guessCount;
  state.isWon = data.isWon;
  state.isLost = data.guessCount >= MAX_GUESSES && !data.isWon;
  
  // Set game state
  if (state.isWon) {
    state.gameState = GAME_STATE.WON;
  } else if (state.isLost) {
    state.gameState = GAME_STATE.LOST;
  } else {
    state.gameState = GAME_STATE.PLAYING;
  }
  
  return state;
};

// Get difficulty description
export const getDifficultyDescription = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case DIFFICULTY.EASY:
      return 'Guess any 5 letters';
    case DIFFICULTY.HARD:
      return "Guess any valid word using all the hints you've been given";
    case DIFFICULTY.NORMAL:
    default:
      return 'Guess any valid word';
  }
};

// Calculate game statistics
export interface GameStatistics {
  duration: number; // in seconds
  efficiency: number; // guesses used / total guesses available
  success: boolean;
}

export const calculateGameStatistics = (state: WordleGameState): GameStatistics => {
  const duration = state.endTime ? Math.round((state.endTime - state.startTime) / 1000) : 0;
  const efficiency = state.guessCount / MAX_GUESSES;
  
  return {
    duration,
    efficiency,
    success: state.isWon,
  };
};

// Initialize word lists on module load
if (typeof window !== 'undefined') {
  initializeWordLists();
} 