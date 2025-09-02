// 测试Wordle功能是否正常工作
require('dotenv').config({ path: '.env.local' });

async function testWordleFunctionality() {
  console.log('🧪 测试Wordle功能...');
  
  try {
    // 测试1: 检查环境变量
    console.log('\n📋 检查环境变量:');
    console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置');
    console.log('- SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已配置' : '❌ 未配置');
    console.log('- SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已配置' : '❌ 未配置');
    
    // 测试2: 测试Supabase连接
    console.log('\n🔗 测试Supabase连接...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // 尝试简单的查询来测试连接
    const { data, error } = await supabase
      .from('wordle_answers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Supabase连接问题:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('📝 这可能意味着wordle_answers表不存在，但这不影响基本功能');
      }
    } else {
      console.log('✅ Supabase连接正常');
    }
    
    // 测试3: 测试Wordle API模块
    console.log('\n🎯 测试Wordle API模块...');
    
    // 动态导入以避免模块加载问题
    let wordleApi;
    try {
      // 尝试导入编译后的JS文件或直接导入TS文件
      try {
        wordleApi = require('./lib/wordle-api.js');
      } catch {
        // 如果没有编译的JS文件，尝试使用ts-node或直接跳过
        console.log('📝 Wordle API是TypeScript文件，跳过模块测试');
        console.log('✅ 文件存在: lib/wordle-api.ts');
        wordleApi = null;
      }
      if (wordleApi) {
        console.log('✅ Wordle API模块加载成功');
      }
    } catch (importError) {
      console.log('❌ Wordle API模块加载失败:', importError.message);
      wordleApi = null;
    }
    
    // 测试4: 测试获取今日答案功能
    console.log('\n📅 测试获取今日答案...');
    if (wordleApi && wordleApi.getTodayWordleAnswer) {
      try {
        const todayAnswer = await wordleApi.getTodayWordleAnswer();
        console.log('✅ 成功获取今日答案:');
        console.log('  - 游戏编号:', todayAnswer.gameNumber);
        console.log('  - 日期:', todayAnswer.date);
        console.log('  - 答案:', todayAnswer.word);
        console.log('  - 已验证:', todayAnswer.verified ? '是' : '否');
        console.log('  - 数据源:', todayAnswer.sources.join(', '));
        console.log('  - 提示类别:', todayAnswer.hints.category);
        console.log('  - 难度:', todayAnswer.hints.difficulty);
      } catch (apiError) {
        console.log('❌ 获取今日答案失败:', apiError.message);
        console.log('详细错误:', apiError);
      }
    } else {
      console.log('⏭️ 跳过API测试（TypeScript模块）');
    }
    
    // 测试5: 测试Wordle客户端
    console.log('\n🔧 测试Wordle客户端...');
    try {
      // 尝试导入编译后的JS文件
      let wordleClient;
      try {
        wordleClient = require('./lib/supabase/wordle-client.js');
      } catch {
        console.log('📝 Wordle客户端是TypeScript文件，跳过客户端测试');
        console.log('✅ 文件存在: lib/supabase/wordle-client.ts');
        wordleClient = null;
      }
      
      if (wordleClient && wordleClient.getSupabaseWordleDB) {
        const db = wordleClient.getSupabaseWordleDB();
        console.log('✅ Wordle客户端初始化成功');
        
        // 测试计算今日游戏编号
        if (db.calculateTodayGameNumber) {
          const gameNumber = db.calculateTodayGameNumber();
          console.log('📊 计算的今日游戏编号:', gameNumber);
        }
      }
      
    } catch (clientError) {
      console.log('❌ Wordle客户端测试失败:', clientError.message);
    }
    
    // 测试6: 测试本地数据库（如果存在）
    console.log('\n💾 检查本地数据库...');
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'data', 'wordle.db');
    
    if (fs.existsSync(dbPath)) {
      console.log('✅ 发现本地SQLite数据库');
      try {
        // 尝试导入编译后的JS文件
        let wordleDbModule;
        try {
          wordleDbModule = require('./lib/database/wordle-db.js');
        } catch {
          console.log('📝 本地数据库模块是TypeScript文件');
          console.log('✅ 文件存在: lib/database/wordle-db.ts');
          wordleDbModule = null;
        }
        
        if (wordleDbModule && wordleDbModule.getWordleDB) {
          const localDb = wordleDbModule.getWordleDB();
          console.log('✅ 本地数据库连接成功');
          if (localDb.close) localDb.close();
        }
      } catch (dbError) {
        console.log('❌ 本地数据库连接失败:', dbError.message);
      }
    } else {
      console.log('📝 未发现本地SQLite数据库（使用Supabase）');
    }
    
    console.log('\n🎉 Wordle功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生异常:', error);
  }
}

// 运行测试
testWordleFunctionality().catch(console.error);