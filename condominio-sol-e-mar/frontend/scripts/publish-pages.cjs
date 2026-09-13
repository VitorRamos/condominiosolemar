const fs = require('node:fs')
const path = require('node:path')

const frontendDir = path.resolve(__dirname, '..')
const repositoryRoot = path.resolve(frontendDir, '..', '..')
const distDir = path.join(frontendDir, 'dist')

if (!fs.existsSync(distDir)) {
  throw new Error(`Build output not found: ${distDir}`)
}

for (const entry of fs.readdirSync(distDir)) {
  fs.cpSync(path.join(distDir, entry), path.join(repositoryRoot, entry), { recursive: true })
}

fs.copyFileSync(path.join(distDir, 'index.html'), path.join(repositoryRoot, '404.html'))
console.log(`Published ${distDir} to ${repositoryRoot}`)
