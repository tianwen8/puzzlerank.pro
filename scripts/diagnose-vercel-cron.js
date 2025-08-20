// 诊断 Vercel Cron 配置
console.log('🔍 Vercel Cron 诊断报告');
console.log('='.repeat(50));

// 1. 检查 vercel.json 配置
const fs = require('fs');
const path = require('path');

try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json 配置:');
  console.log(JSON.stringify(vercelConfig, null, 2));
  
  if (vercelConfig.crons && vercelConfig.crons.length > 0) {
    console.log('\n📅 Cron 任务配置:');
    vercelConfig.crons.forEach((cron, index) => {
      console.log(`  ${index + 1}. ${cron.path} - ${cron.schedule}`);
      
      // 解析 cron 表达式
      const [minute, hour, day, month, weekday] = cron.schedule.split(' ');
      const utcTime = `UTC ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      const beijingHour = (parseInt(hour) + 8) % 24;
      const beijingTime = `北京时间 ${beijingHour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
      
      console.log(`     时间: ${utcTime} = ${beijingTime}`);
    });
  } else {
    console.log('❌ 未找到 cron 配置');
  }
} catch (error) {
  console.log('❌ 读取 vercel.json 失败:', error.message);
}

// 2. 检查环境变量需求
console.log('\n🔐 环境变量检查:');
const requiredEnvVars = [
  'CRON_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: 已设置`);
  } else {
    console.log(`❌ ${envVar}: 未设置`);
  }
});

// 3. 当前时间信息
console.log('\n🕐 时间信息:');
const now = new Date();
console.log(`当前 UTC 时间: ${now.toISOString()}`);
console.log(`当前北京时间: ${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);

// 4. 下次执行时间预测
console.log('\n⏰ 下次 Cron 执行时间预测:');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  if (vercelConfig.crons) {
    vercelConfig.crons.forEach((cron, index) => {
      const [minute, hour] = cron.schedule.split(' ');
      const nextUTC = new Date();
      nextUTC.setUTCHours(parseInt(hour), parseInt(minute), 0, 0);
      
      // 如果时间已过，设置为明天
      if (nextUTC <= now) {
        nextUTC.setUTCDate(nextUTC.getUTCDate() + 1);
      }
      
      const nextBeijing = new Date(nextUTC.getTime() + 8 * 60 * 60 * 1000);
      
      console.log(`  任务 ${index + 1}: ${nextUTC.toISOString()} (UTC)`);
      console.log(`           ${nextBeijing.toLocaleString('zh-CN')} (北京时间)`);
    });
  }
} catch (error) {
  console.log('无法预测下次执行时间');
}

// 5. 建议
console.log('\n💡 建议:');
console.log('1. 确保 Vercel 项目使用 Pro 计划（免费计划不支持 cron）');
console.log('2. 在 Vercel 项目设置中添加 CRON_SECRET 环境变量');
console.log('3. 检查 Vercel 项目的 Functions 日志');
console.log('4. 考虑调整 cron 时间到更合适的时段');

console.log('\n='.repeat(50));
console.log('🏁 诊断完成');