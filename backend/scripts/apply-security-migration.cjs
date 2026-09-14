const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const migrationPath = path.resolve(__dirname, '..', '..', 'supabase', 'migrations', '20260913000200_enable_rls_legacy_tables.sql')
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  if (!process.env.DIRECT_URL) throw new Error('DIRECT_URL is not configured')

  await client.connect()
  await client.query(fs.readFileSync(migrationPath, 'utf8'))
  console.log('Legacy table RLS migration applied')
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => client.end())
