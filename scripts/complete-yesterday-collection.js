const https = require('https');

// 模拟NYT官方采集器
class NYTOfficialCollector {
  async collectAnswer(gameNumber) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.nytimes.com',
        port: 443,
        path: `/svc/wordle/v2/${gameNumber}.json`,
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
              resolve({
                success: true,
                data: {
                  gameNumber: result.id,
                  answer: result.solution.toUpperCase(),
                  date: result.print_date
                }
              });
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });
  }
}

// 调用生产API更新数据库
async function updateDatabase(gameNumber, answer) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      gameNumber: gameNumber,
      answer: answer,
      source: 'NYT Official API',
      status: 'verified',
      confidence: 1.0
    });

    const options = {
      hostname: 'puzzlerank.pro',
      port: 443,
      path: '/api/wordle/update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve({ success: false, error: 'Invalid JSON response', raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function completeYesterdayCollection() {
  console.log('🔄 开始完整的昨天数据补采...');
  
  try {
    // 1. 从NYT官方API获取昨天的答案
    console.log('📡 从NYT官方API获取答案...');
    const collector = new NYTOfficialCollector();
    const result = await collector.collectAnswer(1524); // 昨天的游戏编号
    
    if (result.success) {
      console.log('✅ NYT API成功获取答案:');
      console.log(`   游戏编号: #${result.data.gameNumber}`);
      console.log(`   答案: ${result.data.answer}`);
      console.log(`   日期: ${result.data.date}`);
      
      // 2. 更新数据库
      console.log('\\n💾 更新数据库...');
      const updateResult = await updateDatabase(result.data.gameNumber, result.data.answer);
      
      if (updateResult.success) {
        console.log('✅ 数据库更新成功!');
        console.log('📊 更新详情:', updateResult);
      } else {
        console.log('❌ 数据库更新失败:', updateResult);
      }
      
    } else {
      console.log('❌ NYT API获取失败:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 补采过程失败:', error.message);
  }
}

completeYesterdayCollection();