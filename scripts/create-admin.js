import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

async function createAdmin() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
  })

  try {
    // Hash the password
    const password = '23513900'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Using neon_auth schema
    const userEmail = 'larsenevans@proton.me'
    const userId = crypto.randomUUID()

    // Check if user already exists in neon_auth schema
    const existingUser = await pool.query(
      'SELECT id FROM neon_auth."user" WHERE email = $1',
      [userEmail]
    )

    let finalUserId
    if (existingUser.rows.length > 0) {
      finalUserId = existingUser.rows[0].id
      // Update existing user to be admin
      await pool.query(
        'UPDATE neon_auth."user" SET role = $1, "updatedAt" = NOW() WHERE email = $2',
        ['admin', userEmail]
      )
      console.log(`Updated existing user ${userEmail} to admin role`)
    } else {
      finalUserId = userId
      // Create new admin user
      await pool.query(
        `INSERT INTO neon_auth."user" (id, email, name, "emailVerified", role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, userEmail, 'Super Admin', true, 'admin']
      )
      console.log(`Created new admin user ${userEmail}`)
    }

    // Check if account already exists for this user
    const existingAccount = await pool.query(
      'SELECT id FROM neon_auth."account" WHERE "userId" = $1 AND "providerId" = $2',
      [finalUserId, 'credential']
    )

    if (existingAccount.rows.length === 0) {
      // Create account for password authentication
      const accountId = crypto.randomUUID()
      await pool.query(
        `INSERT INTO neon_auth."account" (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt")
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
      // Update existing account password
      await pool.query(
        'UPDATE neon_auth."account" SET password = $1, "updatedAt" = NOW() WHERE "userId" = $2 AND "providerId" = $3',
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
