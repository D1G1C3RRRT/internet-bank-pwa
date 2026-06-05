BEGIN;

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

COMMIT;
