const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const migrationPath = path.resolve(__dirname, '..', '..', 'supabase', 'migrations', '20260913000100_frontend_schema.sql')
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  if (!process.env.DIRECT_URL) throw new Error('DIRECT_URL is not configured')

  await client.connect()
  const result = await client.query('select to_regclass($1) as table_name', ['public.profiles'])

  if (!result.rows[0].table_name) {
    await client.query(fs.readFileSync(migrationPath, 'utf8'))
    console.log('Supabase frontend migration applied')
  } else {
    console.log('Supabase frontend migration already applied')
  }

  await client.query(`
    insert into public.profiles (id, name)
    select id, coalesce(raw_user_meta_data ->> 'name', email)
    from auth.users
    on conflict (id) do nothing
  `)
  console.log('Existing Auth users synchronized with profiles')
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => client.end())
