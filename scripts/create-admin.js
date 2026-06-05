const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://bankadmin:banksecurepassword987@localhost:5435/internetbank'

async function createAdmin() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  })

  try {
    // Hash the password
    const password = '23513900'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Detect schema: public locally (darwin), neon_auth on production
    const schema = process.platform === 'darwin' ? 'public' : 'neon_auth'
    const userEmail = 'larsenevans@proton.me'
    const userId = crypto.randomUUID()

    console.log(`Checking existing user using schema "${schema}"...`)
    const existingUser = await pool.query(
      `SELECT id FROM "${schema}"."user" WHERE email = $1`,
      [userEmail]
    )

    let finalUserId
    if (existingUser.rows.length > 0) {
      finalUserId = existingUser.rows[0].id
      await pool.query(
        `UPDATE "${schema}"."user" SET role = $1, "updatedAt" = NOW() WHERE email = $2`,
        ['admin', userEmail]
      )
      console.log(`Updated existing user ${userEmail} to admin role`)
    } else {
      finalUserId = userId
      await pool.query(
        `INSERT INTO "${schema}"."user" (id, email, name, "emailVerified", role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, userEmail, 'Super Admin', true, 'admin']
      )
      console.log(`Created new admin user ${userEmail}`)
    }

    const existingAccount = await pool.query(
      `SELECT id FROM "${schema}"."account" WHERE "userId" = $1 AND "providerId" = $2`,
      [finalUserId, 'credential']
    )

    if (existingAccount.rows.length === 0) {
      const accountId = crypto.randomUUID()
      await pool.query(
        `INSERT INTO "${schema}"."account" (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [
          accountId,
          finalUserId,
          'credential',
          userEmail,
          hashedPassword,
        ]
      )
      console.log(`Created password authentication for ${userEmail}`)
    } else {
      await pool.query(
        `UPDATE "${schema}"."account" SET password = $1, "updatedAt" = NOW() WHERE "userId" = $2 AND "providerId" = $3`,
        [hashedPassword, finalUserId, 'credential']
      )
      console.log(`Updated password for ${userEmail}`)
    }

    console.log('\nAdmin account created successfully!')
    console.log(`Email: ${userEmail}`)
    console.log(`Password: ${password}`)
    console.log(`Role: admin`)
  } catch (error) {
    console.error('Error creating admin account:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

createAdmin()
