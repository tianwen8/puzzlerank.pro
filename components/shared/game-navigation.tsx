"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMultiGame } from '@/contexts/multi-game-context';
import { GameType } from '@/lib/supabase/types';
import { Grid3x3, SpellCheck } from 'lucide-react';

export default function GameNavigation() {
  const { currentGame, setCurrentGame } = useMultiGame();

  const games = [
    {
      id: 'wordle' as GameType,
      name: 'Word Puzzle',
      icon: SpellCheck,
      description: 'Guess the 5-letter word',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      id: '2048' as GameType,
      name: '2048',
      icon: Grid3x3,
      description: 'Combine tiles to reach 2048',
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleGameSwitch = (gameId: GameType) => {
    setCurrentGame(gameId);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Select Game</h3>
        </div>
        
        <div className="flex space-x-2 mt-3">
          {games.map((game) => {
            const Icon = game.icon;
            const isActive = currentGame === game.id;
            
            return (
              <Button
                key={game.id}
                onClick={() => handleGameSwitch(game.id)}
                variant={isActive ? "default" : "outline"}
                className={`flex-1 h-auto p-4 flex flex-col items-center space-y-2 ${
                  isActive 
                    ? `${game.color} text-white` 
                    : `${game.bgColor} ${game.textColor} border-2 border-gray-200 hover:border-gray-300`
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-semibold">{game.name}</div>
                  <div className="text-xs opacity-80 mt-1">{game.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          Your progress in each game is saved automatically
        </div>
      </CardContent>
    </Card>
  );
} 