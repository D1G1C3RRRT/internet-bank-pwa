BEGIN;

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

COMMIT;
