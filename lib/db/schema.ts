import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  index,
  uniqueIndex,
  integer,
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
    colorHex: text('colorHex'),
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
    index('idx_transaction_fromAccountId').on(t.fromAccountId),
    index('idx_transaction_toAccountId').on(t.toAccountId),
    index('idx_transaction_createdAt').on(t.createdAt),
  ]
)

export const paymentCard = pgTable(
  'payment_card',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bankAccountId: text('bankAccountId')
      .notNull()
      .references(() => bankAccount.id, { onDelete: 'restrict' }),
    label: text('label').notNull().default('Virtual card'),
    cardType: text('cardType').notNull(), // 'virtual', 'physical'
    status: text('status').notNull().default('active'), // 'active', 'frozen', 'closed'
    network: text('network').notNull().default('mastercard'),
    last4: text('last4').notNull(),
    dailyLimit: decimal('dailyLimit', { precision: 12, scale: 2 })
      .notNull()
      .default('500'),
    monthlyLimit: decimal('monthlyLimit', { precision: 12, scale: 2 })
      .notNull()
      .default('3000'),
    allowContactless: boolean('allowContactless').notNull().default(true),
    allowOnlinePayments: boolean('allowOnlinePayments').notNull().default(true),
    allowInternational: boolean('allowInternational').notNull().default(true),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [
    index('idx_payment_card_userId').on(t.userId),
    index('idx_payment_card_bankAccountId').on(t.bankAccountId),
  ]
)

export const cardActivity = pgTable(
  'card_activity',
  {
    id: text('id').primaryKey(),
    cardId: text('cardId')
      .notNull()
      .references(() => paymentCard.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    index('idx_card_activity_cardId').on(t.cardId),
    index('idx_card_activity_userId').on(t.userId),
    index('idx_card_activity_createdAt').on(t.createdAt),
  ]
)

export const savingsGoal = pgTable(
  'savings_goal',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bankAccountId: text('bankAccountId')
      .notNull()
      .references(() => bankAccount.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    targetAmount: decimal('targetAmount', { precision: 15, scale: 2 }).notNull(),
    currentAmount: decimal('currentAmount', { precision: 15, scale: 2 })
      .notNull()
      .default('0'),
    currency: text('currency').notNull(),
    targetDate: timestamp('targetDate'),
    status: text('status').notNull().default('active'), // 'active', 'completed', 'closed'
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [
    index('idx_savings_goal_userId').on(t.userId),
    index('idx_savings_goal_bankAccountId').on(t.bankAccountId),
  ]
)

export const savingsMovement = pgTable(
  'savings_movement',
  {
    id: text('id').primaryKey(),
    goalId: text('goalId')
      .notNull()
      .references(() => savingsGoal.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    bankAccountId: text('bankAccountId')
      .notNull()
      .references(() => bankAccount.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    type: text('type').notNull(), // 'deposit', 'withdrawal'
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    index('idx_savings_movement_goalId').on(t.goalId),
    index('idx_savings_movement_userId').on(t.userId),
    index('idx_savings_movement_createdAt').on(t.createdAt),
  ]
)

export const stockWatchlist = pgTable(
  'stock_watchlist',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('idx_stock_watchlist_user_symbol').on(t.userId, t.symbol),
    index('idx_stock_watchlist_userId').on(t.userId),
  ]
)

export const stockPosition = pgTable(
  'stock_position',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    quantity: decimal('quantity', { precision: 18, scale: 6 }).notNull(),
    averagePrice: decimal('averagePrice', { precision: 15, scale: 4 }).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('idx_stock_position_user_symbol').on(t.userId, t.symbol),
    index('idx_stock_position_userId').on(t.userId),
  ]
)

export const stockTrade = pgTable(
  'stock_trade',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    type: text('type').notNull(), // 'buy', 'sell'
    quantity: decimal('quantity', { precision: 18, scale: 6 }).notNull(),
    price: decimal('price', { precision: 15, scale: 4 }).notNull(),
    total: decimal('total', { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    index('idx_stock_trade_userId').on(t.userId),
    index('idx_stock_trade_createdAt').on(t.createdAt),
  ]
)

export const cryptoHolding = pgTable(
  'crypto_holding',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    quantity: decimal('quantity', { precision: 30, scale: 12 }).notNull(),
    averagePrice: decimal('averagePrice', { precision: 20, scale: 8 }).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('idx_crypto_holding_user_symbol').on(t.userId, t.symbol),
    index('idx_crypto_holding_userId').on(t.userId),
  ]
)

export const cryptoTrade = pgTable(
  'crypto_trade',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    type: text('type').notNull(), // 'buy', 'sell'
    quantity: decimal('quantity', { precision: 30, scale: 12 }).notNull(),
    price: decimal('price', { precision: 20, scale: 8 }).notNull(),
    total: decimal('total', { precision: 20, scale: 2 }).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (t) => [
    index('idx_crypto_trade_userId').on(t.userId),
    index('idx_crypto_trade_createdAt').on(t.createdAt),
  ]
)

export const passkey = pgTable(
  'passkey',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    publicKey: text('publicKey').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    credentialID: text('credentialID').notNull().unique(),
    counter: integer('counter').notNull(),
    deviceType: text('deviceType').notNull(),
    backedUp: boolean('backedUp').notNull(),
    transports: text('transports'),
    createdAt: timestamp('createdAt'),
  }
)
