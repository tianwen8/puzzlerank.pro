import Link from "next/link"
import { Mail, BookOpen, Home, Trophy } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white/80 text-sm">
          <div>
            <h3 className="font-semibold text-white mb-2">PuzzleRank</h3>
            <p className="mb-3">Ultimate puzzle games platform with global leaderboards, ranking system, and comprehensive statistics tracking.</p>
            <div className="flex items-center space-x-2 text-white/90">
              <Mail className="w-4 h-4" />
              <a href="mailto:support@puzzlerank.pro" className="hover:text-white transition-colors">
                support@puzzlerank.pro
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Quick Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Home className="w-3 h-3" />
                  <span>Play Games</span>
                </Link>
              </li>
              <li>
                <Link href="/strategy" className="flex items-center space-x-2 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3" />
                  <span>Game Strategy</span>
                </Link>
              </li>
              <li>
                <Link href="/wordle-answers" className="flex items-center space-x-2 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3" />
                  <span>Answers Archive</span>
                </Link>
              </li>
              <li>
                <a href="#leaderboard" className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Trophy className="w-3 h-3" />
                  <span>Global Rankings</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">How to Play</h3>
            <div className="space-y-3">
              {/* Word Puzzle Section */}
              <div>
                <h4 className="font-medium text-green-300 text-xs mb-1">WORD PRACTICE GAME</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Guess the 5-letter word in 6 attempts</li>
                  <li>• 🟩 Green = correct letter & position</li>
                  <li>• 🟨 Yellow = correct letter, wrong position</li>
                  <li>• ⬜ Gray = letter not in word</li>
                </ul>
              </div>
              
              {/* 2048 Section */}
              <div>
                <h4 className="font-medium text-orange-300 text-xs mb-1">2048 NUMBER GAME</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Swipe or use arrow keys to move tiles</li>
                  <li>• Merge identical numbers (2+2=4, 4+4=8)</li>
                  <li>• Reach 2048 tile to win the game</li>
                  <li>• Continue playing for higher scores</li>
                </ul>
              </div>
              
              {/* Tips */}
              <div>
                <h4 className="font-medium text-blue-300 text-xs mb-1">PRO TIPS</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Play daily to maintain your streak</li>
                  <li>• Track stats and compete globally</li>
                  <li>• Try different difficulty modes</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">Platform Features</h3>
            <ul className="space-y-1">
              <li>• Real-time global rankings</li>
              <li>• Personal statistics tracking</li>
              <li>• Multiple difficulty levels</li>
              <li>• Cross-platform compatibility</li>
              <li>• Competitive leaderboards</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 pt-6 text-center text-white/60 text-sm">
          <p>&copy; 2025 PuzzleRank.pro. All rights reserved.</p>
          <p className="mt-2">
            <span>Contact us: </span>
            <a href="mailto:support@puzzlerank.pro" className="text-white/80 hover:text-white transition-colors">
              support@puzzlerank.pro
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
