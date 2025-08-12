const https = require('https');
const dns = require('dns');
const { exec } = require('child_process');

async function networkDiagnosis() {
  console.log('🔍 Network Diagnosis for NYT API Access');
  console.log('='.repeat(50));
  
  // 1. DNS 解析测试
  console.log('\n1. Testing DNS resolution...');
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4('www.nytimes.com', (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log('✅ DNS resolution successful:', addresses);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
  }
  
  // 2. 基本连通性测试
  console.log('\n2. Testing basic connectivity...');
  try {
    await new Promise((resolve, reject) => {
      exec('ping -n 1 www.nytimes.com', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Ping failed:', error.message);
          reject(error);
        } else {
          console.log('✅ Ping successful');
          console.log(stdout);
          resolve();
        }
      });
    });
  } catch (error) {
    // Ping 失败不一定意味着网络不通
    console.log('Note: Ping failure doesn\'t necessarily mean network is down');
  }
  
  // 3. HTTPS 连接测试
  console.log('\n3. Testing HTTPS connection...');
  try {
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'www.nytimes.com',
        port: 443,
        path: '/',
        method: 'HEAD',
        timeout: 10000
      }, (res) => {
        console.log('✅ HTTPS connection successful');
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, Object.keys(res.headers));
        resolve();
      });
      
      req.on('error', (error) => {
        console.log('❌ HTTPS connection failed:', error.message);
        reject(error);
      });
      
      req.on('timeout', () => {
        console.log('❌ HTTPS connection timeout');
        req.destroy();
        reject(new Error('Timeout'));
      });
      
      req.setTimeout(10000);
      req.end();
    });
  } catch (error) {
    console.log('HTTPS connection test failed');
  }
  
  // 4. 测试其他 API 端点
  console.log('\n4. Testing alternative endpoints...');
  
  // 测试 NYT 主页
  await testEndpoint('https://www.nytimes.com', 'NYT Homepage');
  
  // 测试 Wordle 游戏页面
  await testEndpoint('https://www.nytimes.com/games/wordle/index.html', 'Wordle Game Page');
  
  // 5. 建议解决方案
  console.log('\n' + '='.repeat(50));
  console.log('🔧 Suggested Solutions:');
  console.log('1. Check if you\'re behind a corporate firewall');
  console.log('2. Try using a VPN or proxy');
  console.log('3. Check Windows Defender/Antivirus settings');
  console.log('4. Try running from a different network');
  console.log('5. Consider using a proxy service in production');
}

function testEndpoint(url, name) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const req = https.request({
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: 'HEAD',
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        console.log(`✅ ${name}: ${res.statusCode}`);
        resolve();
      });
      
      req.on('error', (error) => {
        console.log(`❌ ${name}: ${error.message}`);
        resolve();
      });
      
      req.on('timeout', () => {
        console.log(`❌ ${name}: Timeout`);
        req.destroy();
        resolve();
      });
      
      req.setTimeout(8000);
      req.end();
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      resolve();
    }
  });
}

networkDiagnosis().catch(console.error);