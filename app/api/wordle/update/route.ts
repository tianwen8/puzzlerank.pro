import { NextRequest, NextResponse } from 'next/server';
import { manualUpdate } from '@/lib/wordle-updater';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 手动触发Wordle答案更新...');
    
    const result = await manualUpdate();
    
    return NextResponse.json({
      success: result.success,
      data: {
        gameNumber: result.gameNumber,
        word: result.word,
        verified: result.verified,
        sources: result.sources,
        message: result.message
      }
    });
    
  } catch (error) {
    console.error('❌ 手动更新失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Manual update failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

// 支持CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}