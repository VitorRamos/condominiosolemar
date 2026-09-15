const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const email = process.argv[2]
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  if (!email) throw new Error('Usage: node scripts/delete-user.cjs user@example.com')
  if (!process.env.DIRECT_URL) throw new Error('DIRECT_URL is not configured')

  await client.connect()
  await client.query('begin')
  const result = await client.query('select id, email from auth.users where email = $1', [email])
  if (result.rowCount === 0) throw new Error(`Auth user not found: ${email}`)

  await client.query('delete from auth.users where id = $1', [result.rows[0].id])
  await client.query('commit')
  console.log(`Deleted ${result.rows[0].email}`)
}

main()
  .catch(async error => {
    await client.query('rollback').catch(() => {})
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => client.end())