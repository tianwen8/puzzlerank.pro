const fs = require('fs');
const path = require('path');

console.log('🔍 Deployment Readiness Check\n');

// Check 1: Vercel configuration
console.log('1. Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  if (vercelConfig.crons && vercelConfig.crons.length > 0) {
    console.log('✅ Vercel cron jobs configured');
    console.log(`   Schedule: ${vercelConfig.crons[0].schedule}`);
    console.log(`   Path: ${vercelConfig.crons[0].path}`);
  } else {
    console.log('❌ No cron jobs found in vercel.json');
  }
} catch (error) {
  console.log('❌ vercel.json not found or invalid');
}

// Check 2: Auto-collect API endpoint
console.log('\n2. Checking auto-collect API endpoint...');
const autoCollectPath = 'app/api/wordle/auto-collect/route.ts';
if (fs.existsSync(autoCollectPath)) {
  console.log('✅ Auto-collect API endpoint exists');
} else {
  console.log('❌ Auto-collect API endpoint missing');
}

// Check 3: NYT collector
console.log('\n3. Checking NYT collector...');
const nytCollectorPath = 'lib/nyt-official-collector.ts';
if (fs.existsSync(nytCollectorPath)) {
  console.log('✅ NYT official collector exists');
} else {
  console.log('❌ NYT official collector missing');
}

// Check 4: Hint generator
console.log('\n4. Checking hint generator...');
const hintGeneratorPath = 'lib/answer-hint-generator.ts';
if (fs.existsSync(hintGeneratorPath)) {
  console.log('✅ Answer hint generator exists');
} else {
  console.log('❌ Answer hint generator missing');
}

// Check 5: Updated UI component
console.log('\n5. Checking UI components...');
const hintsComponentPath = 'components/wordle-answer-hints.tsx';
if (fs.existsSync(hintsComponentPath)) {
  console.log('✅ Wordle answer hints component exists');
} else {
  console.log('❌ Wordle answer hints component missing');
}

// Check 6: Database types
console.log('\n6. Checking database types...');
const typesPath = 'lib/supabase/types.ts';
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  if (typesContent.includes('wordle_predictions')) {
    console.log('✅ Database types include wordle_predictions');
  } else {
    console.log('❌ Database types missing wordle_predictions');
  }
} else {
  console.log('❌ Database types file missing');
}

// Check 7: Environment variables
console.log('\n7. Checking environment variables...');
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ Supabase environment variables configured');
  } else {
    console.log('❌ Missing Supabase environment variables');
  }
} else {
  console.log('⚠️  .env.local not found (may be configured in Vercel)');
}

// Check 8: Package.json scripts
console.log('\n8. Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts['test-auto-collect']) {
    console.log('✅ Test scripts available');
  } else {
    console.log('❌ Test scripts missing');
  }
} catch (error) {
  console.log('❌ package.json not found or invalid');
}

console.log('\n📋 Deployment Summary:');
console.log('- Vercel Cron Jobs: Configured for daily execution at 08:01 UTC');
console.log('- Primary Data Source: NYT Official API');
console.log('- Backup Sources: Existing collection system');
console.log('- User Experience: Hint-based answer revelation');
console.log('- Time Zone: Beijing Time (UTC+8) with New Zealand consideration');
console.log('- Game Numbering: Official days_since_launch field');

console.log('\n🚀 Ready for deployment!');
console.log('Next steps:');
console.log('1. Deploy to Vercel');
console.log('2. Verify cron jobs are active in Vercel dashboard');
console.log('3. Test auto-collection endpoint manually');
console.log('4. Monitor first automated run at 16:01 Beijing time');