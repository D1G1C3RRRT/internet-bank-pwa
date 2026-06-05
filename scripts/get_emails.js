const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

async function getEmails() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  try {
    console.log('Querying neon_auth.user...')
    try {
      const res1 = await pool.query('SELECT name, email, role FROM neon_auth."user"')
      console.log('Users in neon_auth schema:')
      console.table(res1.rows)
    } catch (e) {
      console.log('Could not query neon_auth."user":', e)
    }

    console.log('Querying public.user...')
    try {
      const res2 = await pool.query('SELECT name, email, role FROM "user"')
      console.log('Users in public schema:')
      console.table(res2.rows)
    } catch (e) {
      console.log('Could not query public."user":', e)
    }
  } catch (err) {
    console.error('Database connection error:', err)
  } finally {
    await pool.end()
  }
}

getEmails()
