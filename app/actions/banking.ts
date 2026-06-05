'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bankAccount, transaction } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
const uuidv4 = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
}

/**
 * Resolve the current user id from the Better Auth session.
 * Every server action that touches user data MUST go through this helper.
 */
async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  return session.user.id
}

// Bank Account Actions
export async function getBankAccounts() {
  const userId = await getUserId()
  let accounts = await db
    .select()
    .from(bankAccount)
    .where(eq(bankAccount.userId, userId))
    .orderBy(bankAccount.createdAt)

  if (accounts.length === 0) {
    // Seed default accounts to match the screenshot
    const defaultAccounts = [
      { accountType: 'checking', currency: 'EUR', balance: '0.00' }, // NL € účet
      { accountType: 'savings', currency: 'EUR', balance: '0.00' },  // sporiaci účet
      { accountType: 'checking', currency: 'EUR', balance: '0.00' }, // Španielsky účet
      { accountType: 'checking', currency: 'EUR', balance: '0.00' }, // Francúzsky účet
      { accountType: 'checking', currency: 'EUR', balance: '0.04' }, // Nemecký účet
      { accountType: 'savings', currency: 'EUR', balance: '0.00' },  // Tringelty /// --->
      { accountType: 'checking', currency: 'EUR', balance: '0.00' }, // Spoločný účet
    ]

    for (const acc of defaultAccounts) {
      const accountNumber = `ACC-${uuidv4().slice(0, 12).toUpperCase()}`
      await db.insert(bankAccount).values({
        id: uuidv4(),
        userId,
        accountNumber,
        accountType: acc.accountType,
        currency: acc.currency,
        balance: acc.balance,
        isActive: true,
      })
    }

    // Fetch again
    accounts = await db
      .select()
      .from(bankAccount)
      .where(eq(bankAccount.userId, userId))
      .orderBy(bankAccount.createdAt)
  }

  return accounts
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
  const results = await db
    .select({
      id: transaction.id,
      userId: transaction.userId,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      currency: bankAccount.currency,
    })
    .from(transaction)
    .leftJoin(bankAccount, eq(transaction.fromAccountId, bankAccount.id))
    .where(eq(transaction.userId, userId))
    .orderBy(desc(transaction.createdAt))
    .limit(limit)

  return results
}

export async function getAccountTransactions(
  accountId: string,
  limit: number = 20
) {
  const userId = await getUserId()
  const results = await db
    .select({
      id: transaction.id,
      userId: transaction.userId,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      currency: bankAccount.currency,
    })
    .from(transaction)
    .leftJoin(bankAccount, eq(transaction.fromAccountId, bankAccount.id))
    .where(
      and(
        eq(transaction.userId, userId),
        eq(transaction.fromAccountId, accountId)
      )
    )
    .orderBy(desc(transaction.createdAt))
    .limit(limit)

  return results
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
