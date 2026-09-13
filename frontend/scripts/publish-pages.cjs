const fs = require('node:fs')
const path = require('node:path')

const frontendDir = path.resolve(__dirname, '..')
const repositoryRoot = path.resolve(frontendDir, '..')
const distDir = path.join(frontendDir, 'dist')

if (!fs.existsSync(distDir)) {
  throw new Error(`Build output not found: ${distDir}`)
}

fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'))

const cnamePath = path.join(repositoryRoot, 'CNAME')
if (fs.existsSync(cnamePath)) fs.copyFileSync(cnamePath, path.join(distDir, 'CNAME'))

console.log(`Prepared GitHub Pages artifact at ${distDir}`)
