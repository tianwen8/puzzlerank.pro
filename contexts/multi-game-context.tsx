"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import { GameType, CombinedPlayerStats, WordleGameData } from "@/lib/supabase/types"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

// Import 2048 game logic
import {
  type GameState as Game2048State,
  type Direction,
  initializeGame as initialize2048Game,
  moveBoard,
  addRandomTile,
  isGameOver,
  hasWon,
  getHighestTile,
} from "@/lib/game-logic"

// Import Wordle game logic
import {
  type WordleGameState,
  type Difficulty,
  type GameMode,
  initializeWordleGame,
  addLetter,
  deleteLetter,
  submitGuess,
  convertToGameData,
  convertFromGameData,
  DIFFICULTY,
  GAME_MODE,
} from "@/lib/wordle-logic"

// Game action types
type GameAction =
  | { type: "SET_CURRENT_GAME"; game: GameType }
  | { type: "2048_MOVE"; direction: Direction }
  | { type: "2048_NEW_GAME" }
  | { type: "2048_UNDO" }
  | { type: "2048_SET_GAME_STATE"; gameState: Game2048State }
  | { type: "WORDLE_ADD_LETTER"; letter: string }
  | { type: "WORDLE_DELETE_LETTER" }
  | { type: "WORDLE_SUBMIT_GUESS" }
  | { type: "WORDLE_NEW_GAME"; difficulty?: Difficulty; mode?: GameMode }
  | { type: "WORDLE_SET_GAME_STATE"; gameState: WordleGameState }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_PLAYER_STATS"; playerStats: CombinedPlayerStats }
  | { type: "SET_LEADERBOARD"; leaderboard: any[] }

// Multi-game state interface
interface MultiGameState {
  currentGame: GameType;
  game2048: Game2048State;
  wordle: WordleGameState;
  playerStats: CombinedPlayerStats | null;
  leaderboard: any[];
  loading: boolean;
  error: string | null;
  gameStartTime: number;
  sessionBest2048: number;
  sessionGamesPlayed: number;
}

// Context type
interface MultiGameContextType {
  // Current game
  currentGame: GameType;
  setCurrentGame: (game: GameType) => void;
  
  // 2048 game
  game2048State: Game2048State;
  move2048: (direction: Direction) => void;
  newGame2048: () => void;
  undo2048: () => void;
  
  // Wordle game
  wordleState: WordleGameState;
  addWordleLetter: (letter: string) => void;
  deleteWordleLetter: () => void;
  submitWordleGuess: () => void;
  newWordleGame: (difficulty?: Difficulty, mode?: GameMode) => void;
  
  // Shared state
  isLoggedIn: boolean;
  playerStats: CombinedPlayerStats | null;
  leaderboard: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  
  // Current game statistics
  currentGameStats: {
    currentScore: number;
    currentMoves: number;
    currentDuration: number;
    currentHighestTile: number;
    currentGuesses: number;
    sessionBest: number;
    sessionGames: number;
  };
}

// Initial state
const initialState: MultiGameState = {
  currentGame: 'wordle', // Wordle as default per requirements
  game2048: initialize2048Game(),
  wordle: initializeWordleGame(),
  playerStats: null,
  leaderboard: [],
  loading: false,
  error: null,
  gameStartTime: Date.now(),
  sessionBest2048: 0,
  sessionGamesPlayed: 0,
};

// Reducer
function multiGameReducer(state: MultiGameState, action: GameAction): MultiGameState {
  switch (action.type) {
    case "SET_CURRENT_GAME":
      return {
        ...state,
        currentGame: action.game,
      };
      
    // 2048 actions
    case "2048_MOVE": {
      if (state.game2048.isGameOver) return state;

      const { newBoard, scoreGained, moved } = moveBoard(state.game2048.board, action.direction);
      if (!moved) return state;

      const boardWithNewTile = addRandomTile(newBoard);
      const newScore = state.game2048.score + scoreGained;
      const newMoves = state.game2048.moves + 1;
      const gameOver = isGameOver(boardWithNewTile);
      const won = !state.game2048.isWon && hasWon(boardWithNewTile);

      return {
        ...state,
        game2048: {
          ...state.game2048,
          previousState: {
            board: state.game2048.board,
            score: state.game2048.score,
            moves: state.game2048.moves,
          },
          board: boardWithNewTile,
          score: newScore,
          moves: newMoves,
          isGameOver: gameOver,
          isWon: won,
          canUndo: true,
        },
        sessionBest2048: Math.max(state.sessionBest2048, newScore),
      };
    }

    case "2048_NEW_GAME":
      return {
        ...state,
        game2048: initialize2048Game(),
        gameStartTime: Date.now(),
        sessionGamesPlayed: state.sessionGamesPlayed + 1,
      };

    case "2048_UNDO": {
      if (!state.game2048.canUndo || !state.game2048.previousState) return state;

      return {
        ...state,
        game2048: {
          ...state.game2048.previousState,
          isGameOver: false,
          isWon: false,
          canUndo: false,
        },
      };
    }

    case "2048_SET_GAME_STATE":
      return {
        ...state,
        game2048: action.gameState,
      };

    // Wordle actions
    case "WORDLE_ADD_LETTER":
      return {
        ...state,
        wordle: addLetter(state.wordle, action.letter),
      };

    case "WORDLE_DELETE_LETTER":
      return {
        ...state,
        wordle: deleteLetter(state.wordle),
      };

    case "WORDLE_SUBMIT_GUESS":
      return {
        ...state,
        wordle: submitGuess(state.wordle),
      };

    case "WORDLE_NEW_GAME":
      return {
        ...state,
        wordle: initializeWordleGame(action.difficulty, action.mode),
        gameStartTime: Date.now(),
        sessionGamesPlayed: state.sessionGamesPlayed + 1,
      };

    case "WORDLE_SET_GAME_STATE":
      return {
        ...state,
        wordle: action.gameState,
      };

    // Shared actions
    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };

    case "SET_PLAYER_STATS":
      return {
        ...state,
        playerStats: action.playerStats,
      };

    case "SET_LEADERBOARD":
      return {
        ...state,
        leaderboard: action.leaderboard,
      };

    default:
      return state;
  }
}

// Context
const MultiGameContext = createContext<MultiGameContextType | undefined>(undefined);

// Provider component
export function MultiGameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(multiGameReducer, initialState);
  const { user, loading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = React.useState<number>(Date.now());

  // Real-time timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load player statistics
  const loadPlayerStats = useCallback(async () => {
    if (!user) return;

    try {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });

      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_combined_stats', { user_uuid: user.id });

      if (statsError) {
        console.error("Error loading player stats:", statsError);
        dispatch({ type: "SET_ERROR", error: "Failed to load statistics" });
        return;
      }

      if (statsData && statsData.length > 0) {
        const stats = statsData[0];
        // Clean and sanitize stats data
        const combinedStats: CombinedPlayerStats = {
          bestScore: stats.best_score || 0,
          totalGames: stats.total_games || 0,
          gamesWon: stats.games_won || 0,
          winRate: stats.win_rate || 0,
          currentStreak: stats.current_streak || 0,
          bestStreak: stats.best_streak || 0,
          averageScore: stats.average_score || 0,
          totalMoves: stats.total_moves || 0,
          totalDuration: stats.total_duration_seconds || 0,
          highestTile: stats.highest_tile_achieved || 0,
          wordleGamesPlayed: stats.wordle_games_played || 0,
          wordleGamesWon: stats.wordle_games_won || 0,
          wordleWinRate: stats.wordle_win_rate || 0,
          wordleCurrentStreak: stats.wordle_current_streak || 0,
          wordleBestStreak: stats.wordle_best_streak || 0,
          wordleAverageGuesses: stats.wordle_average_guesses || 0,
          userRank: stats.user_rank || 0,
          username: stats.username || 'Player',
          email: stats.email || '',
        };

        // Update state with combined stats
        dispatch({ type: "SET_PLAYER_STATS", playerStats: combinedStats });
        console.log("Combined stats loaded:", combinedStats);
      } else {
        // Create default stats for new users
        const defaultStats: CombinedPlayerStats = {
          bestScore: 0,
          totalGames: 0,
          gamesWon: 0,
          winRate: 0,
          currentStreak: 0,
          bestStreak: 0,
          averageScore: 0,
          totalMoves: 0,
          totalDuration: 0,
          highestTile: 0,
          wordleGamesPlayed: 0,
          wordleGamesWon: 0,
          wordleWinRate: 0,
          wordleCurrentStreak: 0,
          wordleBestStreak: 0,
          wordleAverageGuesses: 0,
          userRank: 0,
          username: 'Player',
          email: '',
        };
        
        dispatch({ type: "SET_PLAYER_STATS", playerStats: defaultStats });
        console.log("Default stats set for new user");
      }

      // Load leaderboard data based on current game
      await loadLeaderboardData();
      
    } catch (error) {
      console.error("Error loading player stats:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to load statistics" });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, [user, state.currentGame]);

  // Load leaderboard data based on current game
  const loadLeaderboardData = useCallback(async () => {
    try {
      const tableName = state.currentGame === 'wordle' ? 'wordle_leaderboard' : 'global_leaderboard';
      
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from(tableName)
        .select('*')
        .order('rank', { ascending: true })
        .limit(10);

      if (leaderboardError) {
        console.error(`Error loading ${state.currentGame} leaderboard:`, leaderboardError);
      } else {
        // Clean and sanitize leaderboard data based on game type
        const cleanLeaderboardData = (leaderboardData || []).map(entry => {
          if (state.currentGame === 'wordle') {
            // Wordle leaderboard data structure
            return {
              ...entry,
              rank: entry.rank || 0,
              username: entry.username || 'Anonymous',
              games_played: entry.games_played || 0,
              gamesPlayed: entry.games_played || 0,
              games_won: entry.games_won || 0,
              gamesWon: entry.games_won || 0,
              win_rate: entry.win_rate || 0,
              winRate: entry.win_rate || 0,
              current_streak: entry.current_streak || 0,
              currentStreak: entry.current_streak || 0,
              best_streak: entry.best_streak || 0,
              bestStreak: entry.best_streak || 0,
              average_guesses: entry.average_guesses || 0,
              averageGuesses: entry.average_guesses || 0,
              // Add missing fields for compatibility
              best_score: 0,
              bestScore: 0,
              total_games: entry.games_played || 0,
              totalGames: entry.games_played || 0,
              highest_tile_achieved: 0,
              highestTile: 0,
              gameType: 'wordle',
            };
          } else {
            // 2048 leaderboard data structure
            return {
              ...entry,
              rank: entry.rank || 0,
              username: entry.username || 'Anonymous',
              best_score: entry.best_score || 0,
              bestScore: entry.best_score || 0,
              total_games: entry.total_games || 0,
              totalGames: entry.total_games || 0,
              games_won: entry.games_won || 0,
              gamesWon: entry.games_won || 0,
              win_rate: entry.win_rate || 0,
              winRate: entry.win_rate || 0,
              current_streak: entry.current_streak || 0,
              currentStreak: entry.current_streak || 0,
              best_streak: entry.best_streak || 0,
              bestStreak: entry.best_streak || 0,
              highest_tile_achieved: entry.highest_tile_achieved || 0,
              highestTile: entry.highest_tile_achieved || 0,
              average_score: entry.average_score || 0,
              averageScore: entry.average_score || 0,
              gameType: '2048',
            };
          }
        });
        
        dispatch({ type: "SET_LEADERBOARD", leaderboard: cleanLeaderboardData });
        console.log(`${state.currentGame} leaderboard loaded:`, cleanLeaderboardData);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
  }, [state.currentGame]);

  // Save game session
  const saveGameSession = useCallback(async (gameType: GameType, gameData: any) => {
    if (!user) return;

    try {
      const sessionData = {
        user_id: user.id,
        game_type: gameType,
        score: gameType === '2048' ? gameData.score : 0,
        moves_count: gameType === '2048' ? gameData.moves : 0,
        duration_seconds: Math.floor((Date.now() - state.gameStartTime) / 1000),
        is_won: gameType === '2048' ? gameData.isWon : gameData.isWon,
        highest_tile: gameType === '2048' ? getHighestTile(gameData.board) : 0,
        game_board: gameType === '2048' ? gameData.board : null,
        game_data: gameType === 'wordle' ? convertToGameData(gameData) : null,
      };

      const { error } = await supabase
        .from('game_sessions')
        .insert([sessionData]);

      if (error) {
        console.error("Error saving game session:", error);
      } else {
        console.log(`${gameType} game session saved successfully`);
        // Refresh player stats
        await loadPlayerStats();
      }
    } catch (error) {
      console.error("Error saving game session:", error);
    }
  }, [user, state.gameStartTime, loadPlayerStats]);

  // Load data on mount and user change
  useEffect(() => {
    if (user) {
      loadPlayerStats();
    }
  }, [user, loadPlayerStats]);

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem("multi-game-state", JSON.stringify({
      currentGame: state.currentGame,
      game2048: state.game2048,
      wordle: state.wordle,
    }));
  }, [state.currentGame, state.game2048, state.wordle]);

  // Load game state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("multi-game-state");
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        if (savedState.currentGame) {
          dispatch({ type: "SET_CURRENT_GAME", game: savedState.currentGame });
        }
        if (savedState.game2048) {
          dispatch({ type: "2048_SET_GAME_STATE", gameState: savedState.game2048 });
        }
        if (savedState.wordle) {
          dispatch({ type: "WORDLE_SET_GAME_STATE", gameState: savedState.wordle });
        }
      } catch (error) {
        console.error("Failed to load saved game state:", error);
      }
    }
  }, []);

  // Calculate current game statistics
  const currentGameStats = React.useMemo(() => {
    const currentDuration = Math.floor((currentTime - state.gameStartTime) / 1000);
    
    if (state.currentGame === '2048') {
      return {
        currentScore: state.game2048.score,
        currentMoves: state.game2048.moves,
        currentDuration: currentDuration,
        currentHighestTile: getHighestTile(state.game2048.board),
        currentGuesses: 0,
        sessionBest: state.sessionBest2048,
        sessionGames: state.sessionGamesPlayed,
      };
    } else {
      return {
        currentScore: 0,
        currentMoves: 0,
        currentDuration: currentDuration,
        currentHighestTile: 0,
        currentGuesses: state.wordle.guessCount,
        sessionBest: 0,
        sessionGames: state.sessionGamesPlayed,
      };
    }
  }, [state, currentTime]);

  // Context value
  const contextValue: MultiGameContextType = {
    // Current game
    currentGame: state.currentGame,
    setCurrentGame: (game: GameType) => {
      dispatch({ type: "SET_CURRENT_GAME", game });
      // Reload leaderboard when game changes
      setTimeout(() => loadLeaderboardData(), 100);
    },
    
    // 2048 game
    game2048State: state.game2048,
    move2048: (direction: Direction) => {
      dispatch({ type: "2048_MOVE", direction });
      
      // Check if game ended and save session
      const { newBoard, moved } = moveBoard(state.game2048.board, direction);
      if (moved) {
        const boardWithNewTile = addRandomTile(newBoard);
        const gameOver = isGameOver(boardWithNewTile);
        if (gameOver && user) {
          const finalGameState = {
            ...state.game2048,
            board: boardWithNewTile,
            score: state.game2048.score + moveBoard(state.game2048.board, direction).scoreGained,
            moves: state.game2048.moves + 1,
            isGameOver: true,
            isWon: !state.game2048.isWon && hasWon(boardWithNewTile),
          };
          setTimeout(() => saveGameSession('2048', finalGameState), 100);
        }
      }
    },
    newGame2048: () => {
      dispatch({ type: "2048_NEW_GAME" });
    },
    undo2048: () => {
      dispatch({ type: "2048_UNDO" });
    },
    
    // Wordle game
    wordleState: state.wordle,
    addWordleLetter: (letter: string) => {
      dispatch({ type: "WORDLE_ADD_LETTER", letter });
    },
    deleteWordleLetter: () => {
      dispatch({ type: "WORDLE_DELETE_LETTER" });
    },
    submitWordleGuess: () => {
      dispatch({ type: "WORDLE_SUBMIT_GUESS" });
      
      // Check if game ended and save session
      const updatedState = submitGuess(state.wordle);
      if ((updatedState.isWon || updatedState.isLost) && user) {
        setTimeout(() => saveGameSession('wordle', updatedState), 100);
      }
    },
    newWordleGame: (difficulty = DIFFICULTY.NORMAL, mode = GAME_MODE.NORMAL) => {
      dispatch({ type: "WORDLE_NEW_GAME", difficulty, mode });
    },
    
    // Shared state
    isLoggedIn: !!user,
    playerStats: state.playerStats,
    leaderboard: state.leaderboard,
    loading: state.loading || authLoading,
    error: state.error,
    refreshData: loadPlayerStats,
    currentGameStats,
  };

  return (
    <MultiGameContext.Provider value={contextValue}>
      {children}
    </MultiGameContext.Provider>
  );
}

// Hook
export function useMultiGame() {
  const context = useContext(MultiGameContext);
  if (context === undefined) {
    throw new Error("useMultiGame must be used within a MultiGameProvider");
  }
  return context;
} 