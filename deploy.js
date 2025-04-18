// deploy.js
const { execSync } = require('child_process')
const fs = require('fs')

// 构建
console.log('Building...')
execSync('npm run build', { stdio: 'inherit' })

// 进入构建输出目录
console.log('Navigating to dist folder...')
process.chdir('dist')

// 初始化git仓库
console.log('Initializing git repository...')
execSync('git init', { stdio: 'inherit' })
execSync('git add -A', { stdio: 'inherit' })
execSync('git commit -m "deploy"', { stdio: 'inherit' })

// 推送到GitHub Pages分支
console.log('Pushing to GitHub...')
// 请替换为您的GitHub仓库URL
execSync('git push -f https://github.com/wjianhui/WBROMProductPrototype.git master:gh-pages', { stdio: 'inherit' })

console.log('Deployment complete!')