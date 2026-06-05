BEGIN;

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

COMMIT;
