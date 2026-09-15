const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const migrationsDirectory = path.resolve(__dirname, '..', '..', 'supabase', 'migrations')
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  if (!process.env.DIRECT_URL) throw new Error('DIRECT_URL is not configured')

  await client.connect()
  const result = await client.query('select to_regclass($1) as table_name', ['public.profiles'])

  if (!result.rows[0].table_name) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260913000100_frontend_schema.sql'), 'utf8'))
    console.log('Supabase frontend migration applied')
  } else {
    console.log('Supabase frontend migration already applied')
  }

  const transparencyPolicyResult = await client.query(`
    select exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'financial_entries'
        and policyname = 'Authenticated users can read financial entries'
    ) as applied
  `)
  if (!transparencyPolicyResult.rows[0].applied) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260915000100_transparency_policies.sql'), 'utf8'))
    console.log('Supabase transparency policies applied')
  }

  const documentsResult = await client.query('select to_regclass($1) as table_name', ['public.financial_documents'])
  if (!documentsResult.rows[0].table_name) {
    await client.query(fs.readFileSync(path.join(migrationsDirectory, '20260915000200_financial_documents.sql'), 'utf8'))
    console.log('Supabase financial documents migration applied')
  } else {
    console.log('Supabase financial documents migration already applied')
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
