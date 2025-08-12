// Game Types
export type GameType = '2048' | 'wordle';

// Wordle Game Data Interface
export interface WordleGameData {
  answer: string;
  guesses: string[];
  currentRow: number;
  isWon: boolean;
  guessCount: number;
  difficulty: 'easy' | 'normal' | 'hard';
  mode: 'normal' | 'practice' | 'infinite';
}

// Combined Player Statistics
export interface CombinedPlayerStats {
  // 2048 stats
  bestScore: number;
  totalGames: number;
  gamesWon: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
  totalMoves: number;
  totalDuration: number;
  highestTile: number;
  // Wordle stats
  wordleGamesPlayed: number;
  wordleGamesWon: number;
  wordleWinRate: number;
  wordleCurrentStreak: number;
  wordleBestStreak: number;
  wordleAverageGuesses: number;
  // Common
  userRank: number;
  username: string;
  email: string;
}

// Wordle Prediction Types
export interface WordleHints {
  firstLetter: string
  length: number
  vowels: string[]
  consonants: string[]
  wordType: string
  difficulty: string
  clues: string[]
}

export interface Database {
  public: {
    Tables: {
      wordle_predictions: {
        Row: {
          id: number
          game_number: number
          date: string
          predicted_word: string | null
          verified_word: string | null
          status: 'candidate' | 'verified' | 'rejected'
          confidence_score: number
          verification_sources: string[]
          hints: WordleHints | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          game_number: number
          date: string
          predicted_word?: string | null
          verified_word?: string | null
          status?: 'candidate' | 'verified' | 'rejected'
          confidence_score?: number
          verification_sources?: string[]
          hints?: WordleHints | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          game_number?: number
          date?: string
          predicted_word?: string | null
          verified_word?: string | null
          status?: 'candidate' | 'verified' | 'rejected'
          confidence_score?: number
          verification_sources?: string[]
          hints?: WordleHints | null
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string | null
          score: number
          moves_count: number
          duration_seconds: number
          is_won: boolean
          highest_tile: number
          game_board: any
          game_type: GameType
          game_data: WordleGameData | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          score: number
          moves_count: number
          duration_seconds: number
          is_won: boolean
          highest_tile: number
          game_board?: any
          game_type?: GameType
          game_data?: WordleGameData | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          score?: number
          moves_count?: number
          duration_seconds?: number
          is_won?: boolean
          highest_tile?: number
          game_board?: any
          game_type?: GameType
          game_data?: WordleGameData | null
          created_at?: string
          updated_at?: string
        }
      }
      player_stats: {
        Row: {
          user_id: string
          username: string | null
          email: string | null
          avatar_url: string | null
          best_score: number
          total_games: number
          games_won: number
          current_streak: number
          best_streak: number
          total_moves: number
          total_duration_seconds: number
          highest_tile_achieved: number
          win_rate: number
          average_score: number
          wordle_games_played: number
          wordle_games_won: number
          wordle_current_streak: number
          wordle_best_streak: number
          wordle_average_guesses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          best_score?: number
          total_games?: number
          games_won?: number
          current_streak?: number
          best_streak?: number
          total_moves?: number
          total_duration_seconds?: number
          highest_tile_achieved?: number
          wordle_games_played?: number
          wordle_games_won?: number
          wordle_current_streak?: number
          wordle_best_streak?: number
          wordle_average_guesses?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          best_score?: number
          total_games?: number
          games_won?: number
          current_streak?: number
          best_streak?: number
          total_moves?: number
          total_duration_seconds?: number
          highest_tile_achieved?: number
          wordle_games_played?: number
          wordle_games_won?: number
          wordle_current_streak?: number
          wordle_best_streak?: number
          wordle_average_guesses?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      global_leaderboard: {
        Row: {
          rank: number
          user_id: string
          username: string | null
          best_score: number
          total_games: number
          games_won: number
          win_rate: number
          average_score: number
          current_streak: number
          highest_tile_achieved: number
          wordle_games_played: number
          wordle_games_won: number
          wordle_current_streak: number
          wordle_best_streak: number
          wordle_average_guesses: number
          updated_at: string
        }
      }
      wordle_leaderboard: {
        Row: {
          rank: number
          user_id: string
          username: string | null
          wordle_games_played: number
          wordle_games_won: number
          wordle_win_rate: number
          wordle_current_streak: number
          wordle_best_streak: number
          wordle_average_guesses: number
          updated_at: string
        }
      }
    }
  }
}
