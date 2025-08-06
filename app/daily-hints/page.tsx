'use client';

import { useState, useEffect } from 'react';
// 移除旧的硬编码系统导入
// import { getTodayWordlePrediction, getWordleHistory, WordlePrediction } from '@/lib/wordle-prediction-system';
import Link from 'next/link';

interface HintData {
  gameNumber: number;
  date: string;
  word: string;
  status: 'candidate' | 'verified' | 'rejected';
  confidence: number;
  verificationSources: string[];
  hints: {
    category: string;
    difficulty: string;
    clues: string[];
    letterHints: string[];
  };
}

export default function DailyHintsPage() {
  const [viewMode, setViewMode] = useState<'today' | 'history' | 'candidates'>('today');
  const [todayHint, setTodayHint] = useState<HintData | null>(null);
  const [historyHints, setHistoryHints] = useState<HintData[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 从新的自动化API获取今日预测
      const todayResponse = await fetch('/api/wordle/auto?type=today');
      const todayData = await todayResponse.json();
      
      if (todayData.success && todayData.data) {
        const prediction = todayData.data;
        setTodayHint({
          gameNumber: prediction.game_number,
          date: prediction.date,
          word: prediction.verified_word || prediction.predicted_word,
          status: prediction.status,
          confidence: prediction.confidence_score,
          verificationSources: prediction.verification_sources || [],
          hints: prediction.hints || {
            category: prediction.status === 'verified' ? 'Verified Answer' : 'Predicting...',
            difficulty: prediction.status === 'verified' ? 'Medium' : 'Unknown',
            clues: prediction.status === 'verified' ? [
              `Today's Wordle answer verified from multiple sources`,
              `Confidence: ${Math.round(prediction.confidence_score * 100)}%`,
              `Sources: ${prediction.verification_sources?.length || 0} verified`
            ] : ['Awaiting verification...'],
            letterHints: []
          }
        });
        setSelectedDate(prediction.date);
      }

      // 获取历史数据
      const historyResponse = await fetch('/api/wordle/auto?type=history&limit=20');
      const historyData = await historyResponse.json();
      
      if (historyData.success && historyData.data) {
        const historyHints = historyData.data.map((p: any) => ({
          gameNumber: p.game_number,
          date: p.date,
          word: p.verified_word || p.predicted_word,
          status: p.status,
          confidence: p.confidence_score,
          verificationSources: p.verification_sources || [],
          hints: {
            category: 'Verified',
            difficulty: 'Medium',
            clues: [`Historical answer #${p.game_number}`],
            letterHints: []
          }
        }));
        setHistoryHints(historyHints);
      }

      // 获取候选预测
      const candidatesResponse = await fetch('/api/wordle/auto?type=candidates&limit=10');
      const candidatesData = await candidatesResponse.json();
      
      if (candidatesData.success && candidatesData.data) {
        const candidates = candidatesData.data.map((p: any) => ({
          gameNumber: p.game_number,
          date: p.date,
          candidateWord: p.predicted_word || p.verified_word,
          status: p.status,
          confidence: p.confidence_score,
          verificationSources: p.verification_sources || []
        }));
        setCandidates(candidates);
      }

      // 获取系统统计
      const statsResponse = await fetch('/api/wordle/auto?type=stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success && statsData.data) {
        setSystemStatus(statsData.data);
      }

    } catch (error) {
      console.error('加载数据失败:', error);
      // 如果新API失败，可以回退到旧的硬编码数据作为备用
      console.log('尝试使用备用数据源...');
    }
  };

  const getStatusBadge = (status: string, confidence: number) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Verified ({Math.round(confidence * 100)}%)
          </span>
        );
      case 'candidate':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            🔍 Candidate ({Math.round(confidence * 100)}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ❓ Unknown
          </span>
        );
    }
  };

  const renderTodayView = () => {
    if (!todayHint) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No prediction data available for today</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Quick Game Access */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to play Wordle?</h3>
              <p className="text-blue-100 text-sm">Use these hints to solve today's puzzle!</p>
            </div>
            <Link 
              href="/"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Play Now →
            </Link>
          </div>
        </div>

        {/* Today's prediction card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Wordle #{todayHint.gameNumber}
              </h2>
              <p className="text-gray-600">{todayHint.date}</p>
            </div>
            {getStatusBadge(todayHint.status, todayHint.confidence)}
          </div>

          {/* Verification sources */}
          {todayHint.verificationSources.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Verification Sources:</p>
              <div className="flex flex-wrap gap-2">
                {todayHint.verificationSources.map((source, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hint information */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📝 Hints</h3>
              <p className="text-sm text-gray-600 mb-2">
                Category: {todayHint.hints.category} | Difficulty: {todayHint.hints.difficulty}
              </p>
              <ul className="space-y-1">
                {todayHint.hints.clues.map((clue, index) => (
                  <li key={index} className="text-sm text-gray-700">• {clue}</li>
                ))}
              </ul>
            </div>

            {todayHint.hints.letterHints.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔤 Letter Hints</h3>
                <ul className="space-y-1">
                  {todayHint.hints.letterHints.map((hint, index) => (
                    <li key={index} className="text-sm text-gray-700 font-mono">• {hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Answer reveal */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Today's Answer:</span>
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
              </button>
            </div>
            {showAnswer && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-center text-blue-600 tracking-wider">
                  {todayHint.word}
                </p>
                {todayHint.status === 'candidate' && (
                  <p className="text-xs text-center text-orange-600 mt-1">
                    ⚠️ This is a predicted answer, awaiting verification
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryView = () => {
    if (historyHints.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No historical verification data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">📚 Verified Historical Answers</h2>
          <Link 
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Play Wordle →
          </Link>
        </div>
        {historyHints.map((hint) => (
          <div key={hint.gameNumber} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Wordle #{hint.gameNumber}
                </h3>
                <p className="text-sm text-gray-600">{hint.date}</p>
              </div>
              {getStatusBadge(hint.status, hint.confidence)}
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-blue-600 tracking-wider">
                {hint.word}
              </span>
              <div className="flex flex-wrap gap-1">
                {hint.verificationSources.map((source, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCandidatesView = () => {
    if (candidates.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No prediction candidates available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">🔮 Future Prediction Candidates</h2>
          <Link 
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Play Wordle →
          </Link>
        </div>
        {candidates.map((candidate) => (
          <div key={candidate.gameNumber} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Wordle #{candidate.gameNumber}
                </h3>
                <p className="text-sm text-gray-600">{candidate.date}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔍 Prediction Candidate
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <span className="text-lg font-bold text-orange-600 tracking-wider">
                {candidate.candidateWord}
              </span>
              <div className="text-xs text-gray-500">
                Confidence: {Math.round(candidate.confidence * 100)}%
              </div>
            </div>
            
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Predicted answer, requires multi-source verification on the corresponding date
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💡 Wordle Daily Hints System
          </h1>
          <p className="text-gray-600">
            Prediction List + Daily Verification Smart Hint System
          </p>
          
          {/* System status */}
          {systemStatus && (
            <div className="mt-4 inline-flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {systemStatus.total}</span>
              <span>Verified: {systemStatus.verified}</span>
              <span>Candidates: {systemStatus.candidates}</span>
              <span>Verification Rate: {Math.round(systemStatus.verificationRate * 100)}%</span>
            </div>
          )}
        </div>

        {/* Navigation tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setViewMode('today')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Today's Hints
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'history'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setViewMode('candidates')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'candidates'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Candidates
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="max-w-4xl mx-auto">
          {viewMode === 'today' && renderTodayView()}
          {viewMode === 'history' && renderHistoryView()}
          {viewMode === 'candidates' && renderCandidatesView()}
        </div>

        {/* System explanation */}
        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🔬 How the System Works</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Prediction List:</strong> Based on community-maintained future answer lists as candidates</p>
            <p><strong>Multi-source Verification:</strong> Requires at least 2 independent sources (Tom's Guide, TechRadar, etc.) for confirmation</p>
            <p><strong>Zero-latency Updates:</strong> Immediate verification after midnight, minute-level transition from "candidate" to "confirmed"</p>
            <p><strong>Confidence Scoring:</strong> Answer reliability calculated based on verification source weights</p>
          </div>
        </div>
      </div>
    </div>
  );
}