const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const email = process.argv[2]
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  if (!email) throw new Error('Usage: node scripts/promote-admin.cjs user@example.com')
  if (!process.env.DIRECT_URL) throw new Error('DIRECT_URL is not configured')

  await client.connect()
  const result = await client.query(`
    update public.profiles
    set role = 'ADMIN'
    where id = (select id from auth.users where email = $1)
    returning id, role
  `, [email])
  await client.query(`
    update public.profiles
    set approved = true
    where id = (select id from auth.users where email = $1)
  `, [email]).catch(() => {})

  if (result.rowCount === 0) throw new Error(`Auth user not found or profile missing: ${email}`)
  console.log(`Promoted ${email} to ${result.rows[0].role}`)
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => client.end())
