BEGIN;

CREATE TABLE IF NOT EXISTS "stock_watchlist" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "symbol" TEXT NOT NULL CHECK ("symbol" IN ('AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "uq_stock_watchlist_user_symbol" UNIQUE ("userId", "symbol")
);

CREATE INDEX IF NOT EXISTS "idx_stock_watchlist_userId" ON "stock_watchlist"("userId");

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

COMMIT;
