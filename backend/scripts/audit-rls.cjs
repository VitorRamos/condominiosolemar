const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  await client.connect()
  const result = await client.query(`
    select c.relname as table_name, c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by c.relname
  `)
  console.table(result.rows)
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => client.end())
