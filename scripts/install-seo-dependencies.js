#!/usr/bin/env node

/**
 * SEO依赖安装脚本
 * 安装Google APIs和其他SEO相关依赖
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Installing SEO dependencies...')

try {
  // 检查package.json是否存在
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in current directory')
  }

  // 读取当前package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  console.log('📦 Current version:', packageJson.version)

  // 检查是否已经安装了googleapis
  if (packageJson.dependencies && packageJson.dependencies.googleapis) {
    console.log('✅ googleapis already installed:', packageJson.dependencies.googleapis)
  } else {
    console.log('📥 Installing googleapis...')
    execSync('npm install googleapis@^144.0.0', { stdio: 'inherit' })
    console.log('✅ googleapis installed successfully')
  }

  // 检查其他可能需要的依赖
  const additionalDeps = {
    'google-auth-library': '^9.0.0'
  }

  for (const [dep, version] of Object.entries(additionalDeps)) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} already installed:`, packageJson.dependencies[dep])
    } else {
      console.log(`📥 Installing ${dep}...`)
      try {
        execSync(`npm install ${dep}@${version}`, { stdio: 'inherit' })
        console.log(`✅ ${dep} installed successfully`)
      } catch (error) {
        console.warn(`⚠️ Failed to install ${dep}, but continuing...`)
      }
    }
  }

  console.log('\n🎉 SEO dependencies installation completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Set up Google Service Account credentials')
  console.log('2. Add environment variables to .env.local:')
  console.log('   - GOOGLE_SERVICE_ACCOUNT_EMAIL')
  console.log('   - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  console.log('   - GOOGLE_PROJECT_ID')
  console.log('3. Visit /admin/seo to manage SEO settings')

} catch (error) {
  console.error('❌ Error installing SEO dependencies:', error.message)
  process.exit(1)
}