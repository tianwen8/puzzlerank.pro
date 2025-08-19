import { redirect } from 'next/navigation'
import { WordlePredictionDB } from '@/lib/database/wordle-prediction-db'

export default async function TodayWordlePage() {
  try {
    const todayData = await WordlePredictionDB.getTodayPrediction()
    if (todayData?.game_number) {
      redirect(`/wordle/${todayData.game_number}`)
    } else {
      redirect('/todays-wordle-answer')
    }
  } catch (error) {
    console.error('Failed to redirect to today game:', error)
    redirect('/todays-wordle-answer')
  }
}