import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  uuid,
  index,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'), // 'user', 'admin'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('idx_session_userId').on(t.userId)]
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [index('idx_account_userId').on(t.userId)]
)

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Banking app tables ------------------------------------------------

export const bankAccount = pgTable(
  'bank_account',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    accountNumber: text('accountNumber').notNull().unique(),
    accountType: text('accountType').notNull(), // 'checking', 'savings'
    balance: decimal('balance', { precision: 15, scale: 2 })
      .notNull()
      .default('0'),
    currency: text('currency').notNull().default('USD'),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [index('idx_bank_account_userId').on(t.userId)]
)

export const transaction = pgTable(
  'transaction',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    fromAccountId: text('fromAccountId'),
    toAccountId: text('toAccountId'),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    type: text('type').notNull(), // 'transfer', 'deposit', 'withdrawal'
    description: text('description'),
    status: text('status').notNull().default('completed'), // 'pending', 'completed', 'failed'
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [
    index('idx_transaction_userId').on(t.userId),
    index('idx_transaction_createdAt').on(t.createdAt),
  ]
)
