-- Create sample data for testing multi-game leaderboards
-- This script creates sample players with both 2048 and Wordle statistics

-- Create sample data for testing (only if tables are empty)
DO $$
BEGIN
    -- Check if we already have sample data
    IF NOT EXISTS (SELECT 1 FROM player_stats WHERE username LIKE 'TestPlayer%') THEN
        -- Insert sample 2048 players
        INSERT INTO player_stats (
            user_id, username, email, 
            best_score, total_games, games_won, current_streak, best_streak, 
            total_moves, total_duration_seconds, highest_tile_achieved,
            wordle_games_played, wordle_games_won, wordle_current_streak, 
            wordle_best_streak, wordle_average_guesses
        ) VALUES
        -- Top 2048 players
        (gen_random_uuid(), 'Alex Chen', 'alex@example.com', 
         15840, 45, 12, 3, 8, 2450, 1800, 2048, 
         25, 20, 12, 18, 3.8),
        (gen_random_uuid(), 'Sarah Johnson', 'sarah@example.com', 
         12960, 38, 15, 5, 10, 2100, 1650, 1024, 
         30, 25, 15, 20, 3.2),
        (gen_random_uuid(), 'Mike Zhang', 'mike@example.com', 
         11520, 42, 8, 2, 6, 2300, 1900, 512, 
         20, 15, 8, 12, 4.1),
        (gen_random_uuid(), 'Emma Davis', 'emma@example.com', 
         10080, 35, 18, 7, 12, 1800, 1400, 1024, 
         35, 30, 18, 25, 3.5),
        (gen_random_uuid(), 'David Kim', 'david@example.com', 
         9600, 40, 10, 1, 8, 2200, 1750, 512, 
         28, 22, 10, 15, 3.9),
        
        -- Top Wordle players (high streaks)
        (gen_random_uuid(), 'WordMaster', 'wordmaster@example.com', 
         3840, 15, 8, 2, 5, 800, 600, 256, 
         50, 45, 28, 35, 2.8),
        (gen_random_uuid(), 'StreakKing', 'streakking@example.com', 
         5120, 20, 12, 4, 7, 1200, 900, 512, 
         45, 40, 25, 30, 3.1),
        (gen_random_uuid(), 'GuessGenius', 'guessgenius@example.com', 
         2560, 12, 6, 1, 4, 650, 450, 128, 
         60, 55, 22, 28, 2.5),
        (gen_random_uuid(), 'WordWizard', 'wordwizard@example.com', 
         4160, 18, 9, 3, 6, 1000, 750, 256, 
         40, 35, 20, 25, 3.0),
        (gen_random_uuid(), 'LetterLord', 'letterlord@example.com', 
         3200, 16, 7, 2, 5, 900, 650, 256, 
         38, 33, 18, 22, 3.3),
        
        -- Mixed players (good at both games)
        (gen_random_uuid(), 'GameMaster', 'gamemaster@example.com', 
         8960, 32, 14, 4, 9, 1600, 1200, 512, 
         42, 38, 16, 20, 3.2),
        (gen_random_uuid(), 'PuzzlePro', 'puzzlepro@example.com', 
         7680, 28, 11, 3, 7, 1400, 1000, 256, 
         36, 32, 14, 18, 3.4),
        (gen_random_uuid(), 'BrainChamp', 'brainchamp@example.com', 
         6720, 25, 13, 5, 8, 1300, 950, 512, 
         33, 28, 12, 16, 3.6),
        (gen_random_uuid(), 'LogicLegend', 'logiclegend@example.com', 
         5440, 22, 9, 2, 6, 1100, 800, 256, 
         29, 24, 10, 14, 3.8),
        (gen_random_uuid(), 'MindMaster', 'mindmaster@example.com', 
         4800, 20, 8, 1, 5, 1000, 750, 256, 
         26, 21, 8, 12, 4.0);
        
        RAISE NOTICE 'Sample data created successfully!';
    ELSE
        RAISE NOTICE 'Sample data already exists, skipping creation.';
    END IF;
END $$; 