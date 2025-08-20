const https = require('https');

// 测试生产环境的 cron 端点
async function testCronEndpoint() {
  console.log('🧪 测试 Vercel Cron 端点...');
  
  const options = {
    hostname: 'puzzlerank.pro',
    port: 443,
    path: '/api/wordle/auto-collect',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Vercel-Cron/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`状态码: ${res.statusCode}`);
      console.log(`响应头:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ 响应结果:', result);
          resolve(result);
        } catch (error) {
          console.log('📄 原始响应:', data);
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ 请求失败:', error);
      reject(error);
    });
    
    req.end();
  });
}

// 测试带认证的请求
async function testWithAuth() {
  console.log('🔐 测试带认证的请求...');
  
  const options = {
    hostname: 'puzzlerank.pro',
    port: 443,
    path: '/api/wordle/auto-collect',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-secret',
      'User-Agent': 'Vercel-Cron/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`状态码: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ 认证测试结果:', result);
          resolve(result);
        } catch (error) {
          console.log('📄 原始响应:', data);
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ 认证请求失败:', error);
      reject(error);
    });
    
    req.end();
  });
}

async function main() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 开始测试 Cron 端点');
    console.log('='.repeat(50));
    
    // 测试 POST 请求（手动触发）
    await testCronEndpoint();
    
    console.log('\n' + '-'.repeat(30) + '\n');
    
    // 测试 GET 请求（Vercel Cron）
    await testWithAuth();
    
    console.log('\n='.repeat(50));
    console.log('✅ 测试完成');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

main();