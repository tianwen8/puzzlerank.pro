# Wordle Automation System Guide

## Overview

This system provides automated daily collection of Wordle answers using Vercel Cron Jobs and the official NYT API, with hint-based answer display for better user experience.

## Key Features

### 1. Automated Collection
- **Vercel Cron Jobs**: Runs daily at 16:01 Beijing time (08:01 UTC)
- **Primary Source**: NYT Official API (`https://www.nytimes.com/svc/wordle/v2/YYYY-MM-DD.json`)
- **Backup Sources**: Existing collection sources as fallback
- **Game Number**: Uses official `days_since_launch` field to avoid calculation errors

### 2. Hint-Based Answer Display
- **Progressive Hints**: Users can reveal hints one by one
- **Word Information**: Shows first letter, length, vowels, consonants
- **Answer Protection**: Answer is hidden by default, requires user action to reveal
- **Difficulty Rating**: Automatic difficulty assessment based on word patterns

### 3. Time Zone Handling
- **Base Time**: Beijing Time (UTC+8)
- **Collection Time**: 16:01 Beijing time (ensures New Zealand availability)
- **Cron Schedule**: `1 8 * * *` (UTC time)

## File Structure

```
├── vercel.json                           # Vercel Cron configuration
├── app/api/wordle/auto-collect/route.ts  # Auto-collection API endpoint
├── lib/nyt-official-collector.ts         # NYT API collector
├── lib/answer-hint-generator.ts          # Hint generation system
├── components/wordle-answer-hints.tsx    # Hint-based UI component
├── lib/supabase/types.ts                 # Updated database types
└── scripts/test-auto-collect.js          # Testing utilities
```

## API Endpoints

### `/api/wordle/auto-collect`
- **Method**: GET/POST
- **Purpose**: Automated daily collection
- **Trigger**: Vercel Cron Job (daily at 08:01 UTC)
- **Response**: Collection result with game number, answer, and hints

### `/api/wordle/auto?type=today`
- **Method**: GET
- **Purpose**: Get today's answer with hints
- **Response**: Today's game data with hint structure

### `/api/wordle/auto?type=history`
- **Method**: GET
- **Purpose**: Get historical answers
- **Response**: Array of past games with basic info

## Database Schema

### wordle_predictions Table
```sql
CREATE TABLE wordle_predictions (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  predicted_word VARCHAR(5),
  verified_word VARCHAR(5),
  status VARCHAR(20) DEFAULT 'candidate',
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  verification_sources TEXT[],
  hints JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Hints JSON Structure
```json
{
  "firstLetter": "N",
  "length": 5,
  "vowels": ["O", "A"],
  "consonants": ["N", "M", "D"],
  "wordType": "noun",
  "difficulty": "Medium",
  "clues": [
    "This word describes a person who moves from place to place",
    "Contains common vowels O and A",
    "Often associated with wandering or traveling lifestyle"
  ]
}
```

## Testing

### Local Testing
```bash
# Test auto-collection API
npm run test-auto-collect

# Test NYT API directly
node scripts/test-auto-collect.js
```

### Manual Trigger
```bash
# Trigger collection manually
curl -X POST http://localhost:3000/api/wordle/auto-collect
```

## Deployment Checklist

1. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Vercel Configuration**
   - Ensure `vercel.json` is deployed
   - Verify Cron Jobs are active in Vercel dashboard

3. **Database Setup**
   - Create `wordle_predictions` table
   - Set up proper indexes on `game_number` and `date`

4. **Testing**
   - Test auto-collection endpoint
   - Verify hint generation
   - Check frontend display

## Monitoring

### Success Indicators
- Daily collection runs at 16:01 Beijing time
- New entries appear in `wordle_predictions` table
- Frontend displays hints correctly
- Answer is hidden by default

### Error Handling
- NYT API failures fall back to existing sources
- Database errors are logged but don't crash the system
- Frontend gracefully handles missing data

## User Experience

### Before (Direct Answer)
- Answer immediately visible: "NOMAD"
- No engagement or challenge
- Reduces game enjoyment

### After (Hint-Based)
- Progressive hint revelation
- Answer hidden by default
- Encourages problem-solving
- Better user engagement

## Future Enhancements

1. **Multiple Language Support**
2. **Advanced Hint Types** (rhymes, synonyms)
3. **User Preference Settings**
4. **Historical Hint Analysis**
5. **Performance Metrics**

## Troubleshooting

### Common Issues

1. **Cron Job Not Running**
   - Check Vercel dashboard
   - Verify `vercel.json` syntax
   - Check function timeout limits

2. **NYT API Failures**
   - Verify URL format
   - Check rate limiting
   - Ensure proper headers

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check table permissions
   - Validate schema

4. **Hint Generation Problems**
   - Check word validity
   - Verify hint generator logic
   - Test with various word types

### Debug Commands
```bash
# Check current time and date calculation
node -e "console.log(new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0])"

# Test NYT API manually
curl "https://www.nytimes.com/svc/wordle/v2/2025-08-12.json"

# Check database connection
# (Use Supabase dashboard or SQL client)
```

This automation system ensures reliable, user-friendly Wordle answer delivery while maintaining engagement through progressive hint revelation.