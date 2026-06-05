// scripts/init-db.js
// Creates all database tables for the Internet Bank PWA
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Manually load .env.local if it exists
let dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  try {
    const envPath = path.join(__dirname, '../.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      const match = envContent.match(/^DATABASE_URL=(.+)$/m)
      if (match) {
        dbUrl = match[1].trim()
      }
    }
  } catch {
    // Ignore error loading env file
  }
}

// Fallback default
dbUrl = dbUrl || 'postgresql://bankadmin:banksecurepassword987@localhost:5435/internetbank'

// Print connection info (mask password)
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')
console.log(`🔌 Attempting to connect using: ${maskedUrl}`)

const pool = new Pool({
  connectionString: dbUrl,
})

async function initDb() {
  const client = await pool.connect()
  try {
    console.log('🔌 Connected to PostgreSQL')

    // Better Auth tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL DEFAULT false,
        "image" TEXT,
        "role" TEXT NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `)
    console.log('✅ Table "user" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT PRIMARY KEY,
        "expiresAt" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session"("userId");
    `)
    console.log('✅ Table "session" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account"("userId");
    `)
    console.log('✅ Table "account" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      );
    `)
    console.log('✅ Table "verification" created')

    // Banking tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS "bank_account" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "accountNumber" TEXT NOT NULL UNIQUE,
        "accountType" TEXT NOT NULL,
        "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_bank_account_userId" ON "bank_account"("userId");
    `)
    console.log('✅ Table "bank_account" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "transaction" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "fromAccountId" TEXT,
        "toAccountId" TEXT,
        "amount" DECIMAL(15,2) NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'completed',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_transaction_userId" ON "transaction"("userId");
      CREATE INDEX IF NOT EXISTS "idx_transaction_fromAccountId" ON "transaction"("fromAccountId");
      CREATE INDEX IF NOT EXISTS "idx_transaction_toAccountId" ON "transaction"("toAccountId");
      CREATE INDEX IF NOT EXISTS "idx_transaction_createdAt" ON "transaction"("createdAt");
    `)
    console.log('✅ Table "transaction" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "payment_card" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "bankAccountId" TEXT NOT NULL REFERENCES "bank_account"("id") ON DELETE RESTRICT,
        "label" TEXT NOT NULL DEFAULT 'Virtual card',
        "cardType" TEXT NOT NULL CHECK ("cardType" IN ('virtual', 'physical')),
        "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'frozen', 'closed')),
        "network" TEXT NOT NULL DEFAULT 'mastercard' CHECK ("network" IN ('mastercard', 'visa')),
        "last4" TEXT NOT NULL CHECK ("last4" ~ '^[0-9]{4}$'),
        "dailyLimit" DECIMAL(12,2) NOT NULL DEFAULT 500 CHECK ("dailyLimit" >= 10 AND "dailyLimit" <= 50000),
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_payment_card_userId" ON "payment_card"("userId");
      CREATE INDEX IF NOT EXISTS "idx_payment_card_bankAccountId" ON "payment_card"("bankAccountId");
    `)
    console.log('✅ Table "payment_card" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "card_activity" (
        "id" TEXT PRIMARY KEY,
        "cardId" TEXT NOT NULL REFERENCES "payment_card"("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "action" TEXT NOT NULL CHECK ("action" IN ('created', 'active', 'frozen', 'limit_changed')),
        "description" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_card_activity_cardId" ON "card_activity"("cardId");
      CREATE INDEX IF NOT EXISTS "idx_card_activity_userId" ON "card_activity"("userId");
      CREATE INDEX IF NOT EXISTS "idx_card_activity_createdAt" ON "card_activity"("createdAt");
    `)
    console.log('✅ Table "card_activity" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "savings_goal" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "bankAccountId" TEXT NOT NULL REFERENCES "bank_account"("id") ON DELETE RESTRICT,
        "name" TEXT NOT NULL,
        "targetAmount" DECIMAL(15,2) NOT NULL CHECK ("targetAmount" >= 1),
        "currentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK ("currentAmount" >= 0),
        "currency" TEXT NOT NULL,
        "targetDate" TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'completed', 'closed')),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_savings_goal_userId" ON "savings_goal"("userId");
      CREATE INDEX IF NOT EXISTS "idx_savings_goal_bankAccountId" ON "savings_goal"("bankAccountId");
    `)
    console.log('✅ Table "savings_goal" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "savings_movement" (
        "id" TEXT PRIMARY KEY,
        "goalId" TEXT NOT NULL REFERENCES "savings_goal"("id") ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "bankAccountId" TEXT NOT NULL REFERENCES "bank_account"("id") ON DELETE RESTRICT,
        "amount" DECIMAL(15,2) NOT NULL CHECK ("amount" > 0),
        "type" TEXT NOT NULL CHECK ("type" IN ('deposit', 'withdrawal')),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_savings_movement_goalId" ON "savings_movement"("goalId");
      CREATE INDEX IF NOT EXISTS "idx_savings_movement_userId" ON "savings_movement"("userId");
      CREATE INDEX IF NOT EXISTS "idx_savings_movement_createdAt" ON "savings_movement"("createdAt");
    `)
    console.log('✅ Table "savings_movement" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "stock_watchlist" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "symbol" TEXT NOT NULL CHECK ("symbol" IN ('AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN')),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_stock_watchlist_user_symbol" UNIQUE ("userId", "symbol")
      );
      CREATE INDEX IF NOT EXISTS "idx_stock_watchlist_userId" ON "stock_watchlist"("userId");
    `)
    console.log('✅ Table "stock_watchlist" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "stock_position" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "symbol" TEXT NOT NULL CHECK ("symbol" IN ('AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN')),
        "quantity" DECIMAL(18,6) NOT NULL CHECK ("quantity" > 0),
        "averagePrice" DECIMAL(15,4) NOT NULL CHECK ("averagePrice" > 0),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_stock_position_user_symbol" UNIQUE ("userId", "symbol")
      );
      CREATE INDEX IF NOT EXISTS "idx_stock_position_userId" ON "stock_position"("userId");
    `)
    console.log('✅ Table "stock_position" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "stock_trade" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "symbol" TEXT NOT NULL CHECK ("symbol" IN ('AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN')),
        "type" TEXT NOT NULL CHECK ("type" IN ('buy', 'sell')),
        "quantity" DECIMAL(18,6) NOT NULL CHECK ("quantity" > 0),
        "price" DECIMAL(15,4) NOT NULL CHECK ("price" > 0),
        "total" DECIMAL(18,2) NOT NULL CHECK ("total" > 0),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_stock_trade_userId" ON "stock_trade"("userId");
      CREATE INDEX IF NOT EXISTS "idx_stock_trade_createdAt" ON "stock_trade"("createdAt");
    `)
    console.log('✅ Table "stock_trade" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "crypto_holding" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "symbol" TEXT NOT NULL CHECK ("symbol" IN ('BTC', 'ETH', 'SOL', 'ADA')),
        "quantity" DECIMAL(30,12) NOT NULL CHECK ("quantity" > 0),
        "averagePrice" DECIMAL(20,8) NOT NULL CHECK ("averagePrice" > 0),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_crypto_holding_user_symbol" UNIQUE ("userId", "symbol")
      );
      CREATE INDEX IF NOT EXISTS "idx_crypto_holding_userId" ON "crypto_holding"("userId");
    `)
    console.log('✅ Table "crypto_holding" created')

    await client.query(`
      CREATE TABLE IF NOT EXISTS "crypto_trade" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "symbol" TEXT NOT NULL CHECK ("symbol" IN ('BTC', 'ETH', 'SOL', 'ADA')),
        "type" TEXT NOT NULL CHECK ("type" IN ('buy', 'sell')),
        "quantity" DECIMAL(30,12) NOT NULL CHECK ("quantity" > 0),
        "price" DECIMAL(20,8) NOT NULL CHECK ("price" > 0),
        "total" DECIMAL(20,2) NOT NULL CHECK ("total" > 0),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS "idx_crypto_trade_userId" ON "crypto_trade"("userId");
      CREATE INDEX IF NOT EXISTS "idx_crypto_trade_createdAt" ON "crypto_trade"("createdAt");
    `)
    console.log('✅ Table "crypto_trade" created')

    console.log('\n🎉 All tables created successfully!')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

initDb()
