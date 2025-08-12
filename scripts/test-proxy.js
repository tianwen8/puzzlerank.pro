const https = require('https');

async function testProxy() {
  const targetUrl = 'https://www.nytimes.com/svc/wordle/v2/2025-08-12.json';
  
  console.log('🌐 Testing NYT API access via proxy services...');
  console.log(`Target URL: ${targetUrl}`);
  console.log('='.repeat(60));
  
  // 测试不同的代理服务
  const proxyServices = [
    {
      name: 'AllOrigins',
      url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
      parseResponse: (data) => {
        const parsed = JSON.parse(data);
        if (parsed.status && parsed.status.http_code === 200) {
          return JSON.parse(parsed.contents);
        }
        throw new Error(`Proxy returned status: ${parsed.status.http_code}`);
      }
    },
    {
      name: 'CodeTabs',
      url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
      parseResponse: (data) => JSON.parse(data)
    }
  ];
  
  for (const proxy of proxyServices) {
    console.log(`\n🔄 Testing ${proxy.name}...`);
    console.log(`Proxy URL: ${proxy.url}`);
    
    try {
      const response = await makeRequest(proxy.url);
      console.log(`📥 Raw response length: ${response.length} characters`);
      console.log(`📥 Raw response preview: ${response.substring(0, 200)}...`);
      
      const data = proxy.parseResponse(response);
      
      if (data.solution && data.days_since_launch) {
        console.log(`✅ SUCCESS with ${proxy.name}!`);
        console.log(`   ID: ${data.id}`);
        console.log(`   Solution: ${data.solution}`);
        console.log(`   Print Date: ${data.print_date}`);
        console.log(`   Days Since Launch: ${data.days_since_launch}`);
        console.log(`   Editor: ${data.editor}`);
        
        console.log(`\n🎉 ${proxy.name} proxy successfully accessed NYT API!`);
        return data;
      } else {
        console.log(`❌ ${proxy.name}: Invalid response format`);
      }
      
    } catch (error) {
      console.log(`❌ ${proxy.name} failed: ${error.message}`);
    }
  }
  
  console.log('\n💥 All proxy services failed');
  throw new Error('All proxy services failed');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://puzzlerank.pro'
      },
      timeout: 30000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.setTimeout(30000);
    req.end();
  });
}

// 运行测试
testProxy()
  .then(data => {
    console.log('\n🎉 Proxy test SUCCESSFUL!');
    console.log('This method can be used to access NYT API in production.');
  })
  .catch(error => {
    console.log('\n💥 All proxy tests FAILED!');
    console.log('Error:', error.message);
    
    console.log('\n🔍 Final Diagnosis:');
    console.log('The network environment is blocking direct access to NYT API.');
    console.log('Possible solutions:');
    console.log('1. Deploy to Vercel (production environment may have better network access)');
    console.log('2. Use a VPN service');
    console.log('3. Set up a custom proxy server');
    console.log('4. Contact network administrator to whitelist NYT domains');
  });