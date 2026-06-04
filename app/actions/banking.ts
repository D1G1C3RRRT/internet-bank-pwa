'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bankAccount, transaction } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

/**
 * Resolve the current user id from the Better Auth session.
 * Every server action that touches user data MUST go through this helper.
 */
async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Bank Account Actions
export async function getBankAccounts() {
  const userId = await getUserId()
  return db
    .select()
    .from(bankAccount)
    .where(eq(bankAccount.userId, userId))
    .orderBy(desc(bankAccount.createdAt))
}

export async function createBankAccount(
  accountType: 'checking' | 'savings',
  currency: string = 'USD'
) {
  const userId = await getUserId()
  const accountNumber = `ACC-${uuidv4().slice(0, 12).toUpperCase()}`

  const result = await db
    .insert(bankAccount)
    .values({
      id: uuidv4(),
      userId,
      accountNumber,
      accountType,
      currency,
      balance: '0',
    })
    .returning()

  revalidatePath('/dashboard')
  return result[0]
}

export async function getAccountBalance(accountId: string) {
  const userId = await getUserId()
  const account = await db
    .select()
    .from(bankAccount)
    .where(
      and(
        eq(bankAccount.id, accountId),
        eq(bankAccount.userId, userId)
      )
    )
    .limit(1)

  return account[0]?.balance || '0'
}

// Transaction Actions
export async function getTransactions(limit: number = 20) {
  const userId = await getUserId()
  return db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId))
    .orderBy(desc(transaction.createdAt))
    .limit(limit)
}

export async function getAccountTransactions(
  accountId: string,
  limit: number = 20
) {
  const userId = await getUserId()
  return db
    .select()
    .from(transaction)
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.fromAccountId, accountId)
      )
    )
    .orderBy(desc(transaction.createdAt))
    .limit(limit)
}

export async function createTransaction(
  fromAccountId: string,
  toAccountId: string | null,
  amount: string,
  type: 'transfer' | 'deposit' | 'withdrawal',
  description?: string
) {
  const userId = await getUserId()

  // Verify the fromAccount belongs to the user
  const fromAccount = await db
    .select()
    .from(bankAccount)
    .where(
      and(
        eq(bankAccount.id, fromAccountId),
        eq(bankAccount.userId, userId)
      )
    )
    .limit(1)

  if (!fromAccount[0]) {
    throw new Error('Account not found')
  }

  const currentBalance = parseFloat(fromAccount[0].balance as string)
  const transactionAmount = parseFloat(amount)

  if (currentBalance < transactionAmount) {
    throw new Error('Insufficient funds')
  }

  // Create transaction record
  const newTransaction = await db
    .insert(transaction)
    .values({
      id: uuidv4(),
      userId,
      fromAccountId,
      toAccountId,
      amount,
      type,
      description: description || '',
      status: 'completed',
    })
    .returning()

  // Update account balance
  const newBalance = (currentBalance - transactionAmount).toFixed(2)
  await db
    .update(bankAccount)
    .set({ balance: newBalance })
    .where(eq(bankAccount.id, fromAccountId))

  revalidatePath('/dashboard')
  return newTransaction[0]
}

export async function depositFunds(
  accountId: string,
  amount: string,
  description?: string
) {
  const userId = await getUserId()

  // Verify account belongs to user
  const account = await db
    .select()
    .from(bankAccount)
    .where(
      and(eq(bankAccount.id, accountId), eq(bankAccount.userId, userId))
    )
    .limit(1)

  if (!account[0]) {
    throw new Error('Account not found')
  }

  const currentBalance = parseFloat(account[0].balance as string)
  const depositAmount = parseFloat(amount)
  const newBalance = (currentBalance + depositAmount).toFixed(2)

  // Create transaction record
  await db.insert(transaction).values({
    id: uuidv4(),
    userId,
    fromAccountId: accountId,
    toAccountId: null,
    amount,
    type: 'deposit',
    description: description || 'Deposit',
    status: 'completed',
  })

  // Update account balance
  await db
    .update(bankAccount)
    .set({ balance: newBalance })
    .where(eq(bankAccount.id, accountId))

  revalidatePath('/dashboard')
}
