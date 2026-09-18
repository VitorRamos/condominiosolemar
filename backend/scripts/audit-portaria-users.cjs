const dotenv = require('dotenv')
const { Client } = require('pg')

dotenv.config()

const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  if (!process.env.DIRECT_URL) throw new Error('DIRECT_URL is not configured')
  await client.connect()
  const result = await client.query(`
    select u.email, coalesce(p.role, 'SEM PERFIL') as role
    from auth.users u
    left join public.profiles p on p.id = u.id
    where lower(u.email) = 'porteiros@solemar.com'
    order by u.email
  `)
  console.table(result.rows)
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(() => client.end())