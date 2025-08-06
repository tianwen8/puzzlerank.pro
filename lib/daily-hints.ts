// Daily Wordle hints system
export interface WordleHint {
  date: string;
  word: string;
  hints: {
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    clues: string[];
    letterHints: {
      position: number;
      hint: string;
    }[];
  };
}

// Common 5-letter words with hints for international users
const WORD_DATABASE = [
  {
    word: 'PLANT',
    category: 'Nature',
    difficulty: 'Easy' as const,
    clues: [
      'Living organism that grows in soil',
      'Needs water and sunlight to survive',
      'Can be found in gardens and forests',
      'Often green in color'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with a consonant used in "Please"' },
      { position: 3, hint: 'Third letter is a vowel' },
      { position: 5, hint: 'Ends with a consonant that makes a "t" sound' }
    ]
  },
  {
    word: 'OCEAN',
    category: 'Geography',
    difficulty: 'Medium' as const,
    clues: [
      'Large body of saltwater',
      'Covers most of Earth\'s surface',
      'Home to whales and dolphins',
      'Has waves and tides'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with a vowel' },
      { position: 2, hint: 'Second letter is a consonant' },
      { position: 4, hint: 'Fourth letter is a vowel' }
    ]
  },
  {
    word: 'BRAVE',
    category: 'Emotions',
    difficulty: 'Medium' as const,
    clues: [
      'Shows courage in difficult situations',
      'Opposite of cowardly',
      'Heroes are often described this way',
      'Willing to face danger'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "B"' },
      { position: 3, hint: 'Third letter is a vowel' },
      { position: 5, hint: 'Ends with a vowel' }
    ]
  },
  {
    word: 'HOUSE',
    category: 'Building',
    difficulty: 'Easy' as const,
    clues: [
      'Place where people live',
      'Has rooms, doors, and windows',
      'Provides shelter from weather',
      'Often has a roof and walls'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "H"' },
      { position: 2, hint: 'Second letter is a vowel' },
      { position: 5, hint: 'Ends with a vowel' }
    ]
  },
  {
    word: 'MUSIC',
    category: 'Arts',
    difficulty: 'Easy' as const,
    clues: [
      'Art form using sounds and rhythm',
      'Can be played with instruments',
      'Often has melody and harmony',
      'People dance and sing to it'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "M"' },
      { position: 2, hint: 'Second letter is a vowel' },
      { position: 4, hint: 'Fourth letter is "I"' }
    ]
  },
  {
    word: 'LIGHT',
    category: 'Physics',
    difficulty: 'Medium' as const,
    clues: [
      'Electromagnetic radiation visible to human eyes',
      'Opposite of darkness',
      'Helps us see things around us',
      'Can come from sun, bulbs, or fire'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "L"' },
      { position: 2, hint: 'Second letter is "I"' },
      { position: 5, hint: 'Ends with "T"' }
    ]
  },
  {
    word: 'HAPPY',
    category: 'Emotions',
    difficulty: 'Easy' as const,
    clues: [
      'Feeling of joy and contentment',
      'Opposite of sad',
      'Makes you smile',
      'A positive emotion'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "H"' },
      { position: 2, hint: 'Second letter is "A"' },
      { position: 4, hint: 'Fourth letter is "P"' }
    ]
  },
  {
    word: 'WORLD',
    category: 'Geography',
    difficulty: 'Medium' as const,
    clues: [
      'The planet Earth and all life on it',
      'Global community of all nations',
      'Everything that exists around us',
      'Our home in the universe'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "W"' },
      { position: 2, hint: 'Second letter is a vowel' },
      { position: 5, hint: 'Ends with "D"' }
    ]
  },
  {
    word: 'PEACE',
    category: 'Concepts',
    difficulty: 'Medium' as const,
    clues: [
      'State of harmony and tranquility',
      'Absence of war or conflict',
      'What doves symbolize',
      'Inner calm and serenity'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "P"' },
      { position: 2, hint: 'Second letter is a vowel' },
      { position: 5, hint: 'Ends with a vowel' }
    ]
  },
  {
    word: 'DREAM',
    category: 'Psychology',
    difficulty: 'Medium' as const,
    clues: [
      'Images and stories in your mind while sleeping',
      'Goals and aspirations for the future',
      'Something you experience during REM sleep',
      'Can be vivid or forgotten upon waking'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "D"' },
      { position: 2, hint: 'Second letter is "R"' },
      { position: 4, hint: 'Fourth letter is "A"' }
    ]
  },
  {
    word: 'SMILE',
    category: 'Emotions',
    difficulty: 'Easy' as const,
    clues: [
      'Facial expression showing happiness',
      'Upward curve of the lips',
      'Universal sign of friendliness',
      'Can be contagious to others'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "S"' },
      { position: 2, hint: 'Second letter is "M"' },
      { position: 5, hint: 'Ends with a vowel' }
    ]
  },
  {
    word: 'HEART',
    category: 'Biology',
    difficulty: 'Easy' as const,
    clues: [
      'Organ that pumps blood through your body',
      'Symbol of love and emotion',
      'Located in your chest',
      'Beats about 100,000 times per day'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "H"' },
      { position: 2, hint: 'Second letter is a vowel' },
      { position: 5, hint: 'Ends with "T"' }
    ]
  },
  {
    word: 'MAGIC',
    category: 'Fantasy',
    difficulty: 'Easy' as const,
    clues: [
      'Supernatural powers in fairy tales',
      'What wizards and witches use',
      'Illusions performed by entertainers',
      'Something that seems impossible'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "M"' },
      { position: 2, hint: 'Second letter is "A"' },
      { position: 4, hint: 'Fourth letter is "I"' }
    ]
  },
  {
    word: 'STORY',
    category: 'Literature',
    difficulty: 'Easy' as const,
    clues: [
      'Narrative with characters and plot',
      'What books and movies tell',
      'Can be fiction or non-fiction',
      'Has beginning, middle, and end'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "S"' },
      { position: 2, hint: 'Second letter is "T"' },
      { position: 4, hint: 'Fourth letter is "R"' }
    ]
  },
  {
    word: 'FRESH',
    category: 'Quality',
    difficulty: 'Medium' as const,
    clues: [
      'Recently made or obtained',
      'Not stale or spoiled',
      'Clean and pure',
      'New and different'
    ],
    letterHints: [
      { position: 1, hint: 'Starts with "F"' },
      { position: 2, hint: 'Second letter is "R"' },
      { position: 5, hint: 'Ends with "H"' }
    ]
  }
];

// Generate daily hints based on date
export function generateDailyHints(daysBack: number = 30): WordleHint[] {
  const today = new Date();
  const hints: WordleHint[] = [];
  
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Use date as seed to ensure same word for same date
    const dateString = date.toISOString().split('T')[0];
    const wordIndex = getDateBasedIndex(dateString, WORD_DATABASE.length);
    const wordData = WORD_DATABASE[wordIndex];
    
    hints.push({
      date: dateString,
      word: wordData.word,
      hints: {
        category: wordData.category,
        difficulty: wordData.difficulty,
        clues: wordData.clues,
        letterHints: wordData.letterHints
      }
    });
  }
  
  return hints;
}

// Generate consistent index based on date string
function getDateBasedIndex(dateString: string, maxIndex: number): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % maxIndex;
}

// Get today's hint
export function getTodayHint(): WordleHint {
  const hints = generateDailyHints(1);
  return hints[0];
}

// Get hint for specific date
export function getHintForDate(date: string): WordleHint | null {
  const hints = generateDailyHints(365); // Search within a year
  return hints.find(hint => hint.date === date) || null;
}