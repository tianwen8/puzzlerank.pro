const https = require('https');

async function collectYesterday() {
  console.log('🔄 手动补采昨天(8月21日)的Wordle答案...');
  
  // 测试NYT官方API - 昨天的游戏编号是1524
  const testNYTAPI = () => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.nytimes.com',
        port: 443,
        path: '/svc/wordle/v2/1524.json',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.nytimes.com/games/wordle/index.html'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const result = JSON.parse(data);
              console.log('✅ NYT API响应成功:');
              console.log('  游戏编号:', result.id);
              console.log('  答案:', result.solution);
              console.log('  日期:', result.print_date);
              resolve(result);
            } else {
              console.log('❌ NYT API响应失败:', res.statusCode, data);
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          } catch (e) {
            console.log('❌ 解析NYT API响应失败:', data);
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        console.error('❌ NYT API请求错误:', e.message);
        reject(e);
      });

      req.end();
    });
  };

  try {
    const nytResult = await testNYTAPI();
    console.log(`\\n🎯 昨天的正确答案是: ${nytResult.solution.toUpperCase()}`);
    console.log('\\n📝 需要手动更新数据库中游戏编号1524的记录');
    console.log('   - 将答案更新为:', nytResult.solution.toUpperCase());
    console.log('   - 将验证源更新为: ["NYT Official API"]');
    console.log('   - 将状态更新为: verified');
    console.log('   - 将置信度更新为: 1.0');
    
  } catch (error) {
    console.error('❌ 获取昨天答案失败:', error.message);
  }
}

collectYesterday();