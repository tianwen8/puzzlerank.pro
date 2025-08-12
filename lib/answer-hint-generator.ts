interface WordHints {
  firstLetter: string
  length: number
  vowels: string[]
  consonants: string[]
  wordType: string
  difficulty: string
  clues: string[]
}

export class AnswerHintGenerator {
  private readonly commonWords = new Set([
    'ABOUT', 'ABOVE', 'AFTER', 'AGAIN', 'AMONG', 'APPLE', 'BEACH', 'BREAD', 'BRING', 'BUILD',
    'CHAIR', 'CLEAN', 'CLEAR', 'CLOSE', 'COULD', 'DANCE', 'DREAM', 'DRIVE', 'EARLY', 'EARTH',
    'FIELD', 'FIRST', 'FRESH', 'FRONT', 'FRUIT', 'GLASS', 'GREAT', 'GREEN', 'HAPPY', 'HEART',
    'HOUSE', 'LIGHT', 'MIGHT', 'MONEY', 'MUSIC', 'NIGHT', 'OTHER', 'PAPER', 'PARTY', 'PEACE',
    'PLACE', 'PLANT', 'POINT', 'POWER', 'QUICK', 'QUIET', 'RIGHT', 'ROUND', 'SMALL', 'SMILE',
    'SOUND', 'SPACE', 'SPEAK', 'SPEND', 'START', 'STORY', 'STUDY', 'TABLE', 'THANK', 'THINK',
    'THREE', 'TODAY', 'UNDER', 'UNTIL', 'VOICE', 'WATER', 'WHERE', 'WHILE', 'WHITE', 'WORLD'
  ])

  private readonly wordTypes: { [key: string]: string[] } = {
    'noun': ['APPLE', 'BEACH', 'BREAD', 'CHAIR', 'DREAM', 'EARTH', 'FIELD', 'FRUIT', 'GLASS', 'HEART', 'HOUSE', 'MONEY', 'MUSIC', 'PAPER', 'PARTY', 'PEACE', 'PLACE', 'PLANT', 'POINT', 'POWER', 'SMILE', 'SOUND', 'SPACE', 'STORY', 'TABLE', 'VOICE', 'WATER', 'WORLD'],
    'verb': ['BRING', 'BUILD', 'CLEAN', 'CLEAR', 'CLOSE', 'DANCE', 'DRIVE', 'SPEAK', 'SPEND', 'START', 'STUDY', 'THANK', 'THINK'],
    'adjective': ['EARLY', 'FIRST', 'FRESH', 'GREAT', 'GREEN', 'HAPPY', 'OTHER', 'QUICK', 'QUIET', 'RIGHT', 'ROUND', 'SMALL', 'WHITE'],
    'adverb': ['ABOUT', 'ABOVE', 'AFTER', 'AGAIN', 'AMONG', 'TODAY', 'UNDER', 'UNTIL', 'WHERE', 'WHILE']
  }

  generateHints(answer: string): WordHints {
    const upperAnswer = answer.toUpperCase()
    const vowels = this.extractVowels(upperAnswer)
    const consonants = this.extractConsonants(upperAnswer)
    const wordType = this.determineWordType(upperAnswer)
    const difficulty = this.determineDifficulty(upperAnswer)
    const clues = this.generateClues(upperAnswer)

    return {
      firstLetter: upperAnswer[0],
      length: upperAnswer.length,
      vowels,
      consonants,
      wordType,
      difficulty,
      clues
    }
  }

  private extractVowels(word: string): string[] {
    const vowels = new Set<string>()
    const vowelChars = 'AEIOU'
    
    for (const char of word) {
      if (vowelChars.includes(char)) {
        vowels.add(char)
      }
    }
    
    return Array.from(vowels).sort()
  }

  private extractConsonants(word: string): string[] {
    const consonants = new Set<string>()
    const vowelChars = 'AEIOU'
    
    for (const char of word) {
      if (!vowelChars.includes(char) && /[A-Z]/.test(char)) {
        consonants.add(char)
      }
    }
    
    return Array.from(consonants).sort()
  }

  private determineWordType(word: string): string {
    for (const [type, words] of Object.entries(this.wordTypes)) {
      if (words.includes(word)) {
        return type
      }
    }
    return 'common word'
  }

  private determineDifficulty(word: string): string {
    if (this.commonWords.has(word)) {
      return 'Easy'
    }
    
    // Check for uncommon letter combinations
    const uncommonPatterns = ['QU', 'XY', 'ZZ', 'JJ', 'VV']
    const hasUncommonPattern = uncommonPatterns.some(pattern => word.includes(pattern))
    
    // Check for repeated letters
    const hasRepeatedLetters = new Set(word).size < word.length
    
    // Check for uncommon letters
    const uncommonLetters = 'QXZJV'
    const hasUncommonLetters = word.split('').some(char => uncommonLetters.includes(char))
    
    if (hasUncommonPattern || (hasUncommonLetters && hasRepeatedLetters)) {
      return 'Hard'
    } else if (hasUncommonLetters || hasRepeatedLetters) {
      return 'Medium'
    }
    
    return 'Easy'
  }

  private generateClues(word: string): string[] {
    const clues: string[] = []
    
    // Letter frequency clue
    const vowelCount = word.split('').filter(char => 'AEIOU'.includes(char)).length
    if (vowelCount >= 3) {
      clues.push('This word is vowel-rich')
    } else if (vowelCount <= 1) {
      clues.push('This word has few vowels')
    }
    
    // Pattern clues
    if (new Set(word).size < word.length) {
      clues.push('Contains repeated letters')
    }
    
    // Position clues
    if ('AEIOU'.includes(word[0])) {
      clues.push('Starts with a vowel')
    }
    
    if ('AEIOU'.includes(word[word.length - 1])) {
      clues.push('Ends with a vowel')
    }
    
    // Common letter patterns
    if (word.includes('TH')) {
      clues.push('Contains the "TH" combination')
    }
    
    if (word.includes('ING')) {
      clues.push('Contains the "ING" ending')
    }
    
    if (word.includes('ED')) {
      clues.push('Contains the "ED" combination')
    }
    
    // If no specific clues, add generic ones
    if (clues.length === 0) {
      clues.push('Pay attention to letter positioning')
      clues.push('Consider word patterns and frequency')
    }
    
    return clues.slice(0, 3) // Limit to 3 clues max
  }
}