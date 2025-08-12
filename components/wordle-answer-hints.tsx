"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Lightbulb, Target, CheckCircle } from 'lucide-react'
import { WordleHints } from '@/lib/supabase/types'

interface WordleAnswerHintsProps {
  gameNumber: number
  date: string
  answer: string
  hints: WordleHints
  status: 'verified' | 'candidate' | 'rejected'
  confidence: number
}

export default function WordleAnswerHints({
  gameNumber,
  date,
  answer,
  hints,
  status,
  confidence
}: WordleAnswerHintsProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [revealedHints, setRevealedHints] = useState<number[]>([])

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index])
    }
  }

  const revealAllHints = () => {
    if (hints.clues) {
      setRevealedHints(hints.clues.map((_, index) => index))
    }
  }

  return (
    <div className="space-y-6">
      {/* Game Info Header */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-800 flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Wordle #{gameNumber} - {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {status === 'verified' ? 'Answer Verified' : 'Predicted Answer'}
            </Badge>
            <Badge variant="outline">
              Difficulty: {hints.difficulty}
            </Badge>
            {confidence < 1.0 && (
              <Badge variant="outline">
                Confidence: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answer Reveal Section */}
      <Card className={`border-2 ${showAnswer ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            {showAnswer ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Today's Answer
              </>
            ) : (
              <>
                <EyeOff className="w-5 h-5 text-gray-600" />
                Answer Hidden - Use Hints First!
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {showAnswer ? (
            <div className="space-y-4">
              <div className="text-6xl font-bold text-green-700 tracking-wider">
                {answer}
              </div>
              <p className="text-gray-600">
                Great job! Now you can practice with unlimited games to improve your skills.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl font-bold text-gray-400 tracking-wider">
                ? ? ? ? ?
              </div>
              <p className="text-gray-600 mb-4">
                Try to solve it using the hints below before revealing the answer!
              </p>
              <Button
                onClick={() => setShowAnswer(true)}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Reveal Answer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Word Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Word Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">First Letter:</span>
              <Badge variant="secondary">{hints.firstLetter}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Word Length:</span>
              <Badge variant="secondary">{hints.length} letters</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Word Type:</span>
              <Badge variant="outline">{hints.wordType}</Badge>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600">Vowels in this word:</span>
              <div className="flex gap-1">
                {hints.vowels?.map((vowel, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                    {vowel}
                  </Badge>
                )) || <Badge variant="secondary">No vowels data</Badge>}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-gray-600">Consonants in this word:</span>
              <div className="flex gap-1 flex-wrap">
                {hints.consonants?.map((consonant, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {consonant}
                  </Badge>
                )) || <Badge variant="secondary">No consonants data</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Progressive Hints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hints.clues?.map((clue, index) => (
              <div key={index} className="space-y-2">
                {revealedHints.includes(index) ? (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{clue}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-500">Hint #{index + 1}</span>
                    <Button
                      onClick={() => revealHint(index)}
                      size="sm"
                      variant="outline"
                    >
                      Reveal
                    </Button>
                  </div>
                )}
              </div>
            )) || (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-500">No hints available</span>
              </div>
            )}
            
            {hints.clues && revealedHints.length < hints.clues.length && (
              <Button
                onClick={revealAllHints}
                variant="secondary"
                className="w-full mt-4"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Reveal All Hints
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Practice Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Ready to Practice?
          </h3>
          <p className="text-gray-600 mb-4">
            Test your skills with unlimited Wordle games and improve your solving strategy!
          </p>
          <a 
            href="/?game=wordle&mode=infinite"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors no-underline font-medium"
          >
            Play Unlimited Practice
          </a>
        </CardContent>
      </Card>
    </div>
  )
}