'use server'

import { randomUUID } from 'node:crypto'
import { and, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { bankAccount, savingsGoal, savingsMovement } from '@/lib/db/schema'
import { requireUserId } from '@/lib/auth/require-user'
import {
  createSavingsGoalSchema,
  savingsGoalIdSchema,
  savingsMovementSchema,
  type CreateSavingsGoalInput,
  type SavingsMovementInput,
} from '@/lib/validation/savings'

export type SavingsActionResult = { ok: boolean; message: string }

function firstIssue(error: { issues?: Array<{ message?: string }> }) {
  return error.issues?.[0]?.message ?? 'Invalid savings data'
}

function refreshSavings(goalId?: string) {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/savings')
  if (goalId) revalidatePath(`/dashboard/savings/${goalId}`)
}

export async function getSavingsGoals() {
  const userId = await requireUserId()

  return db
    .select({
      id: savingsGoal.id,
      bankAccountId: savingsGoal.bankAccountId,
      name: savingsGoal.name,
      targetAmount: savingsGoal.targetAmount,
      currentAmount: savingsGoal.currentAmount,
      currency: savingsGoal.currency,
      targetDate: savingsGoal.targetDate,
      status: savingsGoal.status,
      createdAt: savingsGoal.createdAt,
      accountNumber: bankAccount.accountNumber,
      accountBalance: bankAccount.balance,
    })
    .from(savingsGoal)
    .innerJoin(bankAccount, eq(savingsGoal.bankAccountId, bankAccount.id))
    .where(eq(savingsGoal.userId, userId))
    .orderBy(desc(savingsGoal.createdAt))
}

export async function getSavingsGoal(goalId: string) {
  const userId = await requireUserId()
  const parsedId = savingsGoalIdSchema.safeParse(goalId)
  if (!parsedId.success) return null

  const goals = await db
    .select({
      id: savingsGoal.id,
      bankAccountId: savingsGoal.bankAccountId,
      name: savingsGoal.name,
      targetAmount: savingsGoal.targetAmount,
      currentAmount: savingsGoal.currentAmount,
      currency: savingsGoal.currency,
      targetDate: savingsGoal.targetDate,
      status: savingsGoal.status,
      createdAt: savingsGoal.createdAt,
      accountNumber: bankAccount.accountNumber,
      accountBalance: bankAccount.balance,
    })
    .from(savingsGoal)
    .innerJoin(bankAccount, eq(savingsGoal.bankAccountId, bankAccount.id))
    .where(and(eq(savingsGoal.id, parsedId.data), eq(savingsGoal.userId, userId)))
    .limit(1)

  if (!goals[0]) return null

  const movements = await db
    .select({
      id: savingsMovement.id,
      type: savingsMovement.type,
      amount: savingsMovement.amount,
      createdAt: savingsMovement.createdAt,
    })
    .from(savingsMovement)
    .where(
      and(
        eq(savingsMovement.goalId, parsedId.data),
        eq(savingsMovement.userId, userId)
      )
    )
    .orderBy(desc(savingsMovement.createdAt))
    .limit(50)

  return { goal: goals[0], movements }
}

export async function createSavingsGoal(
  input: CreateSavingsGoalInput
): Promise<SavingsActionResult> {
  const userId = await requireUserId()
  const parsed = createSavingsGoalSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }

  const accounts = await db
    .select({ id: bankAccount.id, currency: bankAccount.currency })
    .from(bankAccount)
    .where(
      and(
        eq(bankAccount.id, parsed.data.bankAccountId),
        eq(bankAccount.userId, userId),
        eq(bankAccount.isActive, true)
      )
    )
    .limit(1)

  if (!accounts[0]) return { ok: false, message: 'Selected account is not available' }

  let targetDate: Date | null = null
  if (parsed.data.targetDate) {
    targetDate = new Date(`${parsed.data.targetDate}T00:00:00.000Z`)
    if (Number.isNaN(targetDate.getTime()) || targetDate <= new Date()) {
      return { ok: false, message: 'Target date must be in the future' }
    }
  }

  await db.insert(savingsGoal).values({
    id: randomUUID(),
    userId,
    bankAccountId: parsed.data.bankAccountId,
    name: parsed.data.name,
    targetAmount: parsed.data.targetAmount.toFixed(2),
    currentAmount: '0.00',
    currency: accounts[0].currency,
    targetDate,
    status: 'active',
  })

  refreshSavings()
  return { ok: true, message: 'Savings goal created' }
}

export async function moveSavings(
  input: SavingsMovementInput
): Promise<SavingsActionResult> {
  const userId = await requireUserId()
  const parsed = savingsMovementSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }

  const amount = parsed.data.amount
  const formattedAmount = amount.toFixed(2)

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT ${savingsGoal.id}
        FROM ${savingsGoal}
        WHERE ${savingsGoal.id} = ${parsed.data.goalId}
          AND ${savingsGoal.userId} = ${userId}
        FOR UPDATE
      `)

      const goals = await tx
        .select({
          id: savingsGoal.id,
          bankAccountId: savingsGoal.bankAccountId,
          currentAmount: savingsGoal.currentAmount,
          targetAmount: savingsGoal.targetAmount,
          status: savingsGoal.status,
        })
        .from(savingsGoal)
        .where(
          and(eq(savingsGoal.id, parsed.data.goalId), eq(savingsGoal.userId, userId))
        )
        .limit(1)

      if (!goals[0]) throw new Error('GOAL_NOT_FOUND')
      if (goals[0].status === 'closed') throw new Error('GOAL_CLOSED')

      await tx.execute(sql`
        SELECT ${bankAccount.id}
        FROM ${bankAccount}
        WHERE ${bankAccount.id} = ${goals[0].bankAccountId}
          AND ${bankAccount.userId} = ${userId}
        FOR UPDATE
      `)

      const accounts = await tx
        .select({ id: bankAccount.id, balance: bankAccount.balance })
        .from(bankAccount)
        .where(
          and(
            eq(bankAccount.id, goals[0].bankAccountId),
            eq(bankAccount.userId, userId),
            eq(bankAccount.isActive, true)
          )
        )
        .limit(1)

      if (!accounts[0]) throw new Error('ACCOUNT_NOT_FOUND')

      const accountBalance = Number(accounts[0].balance)
      const currentAmount = Number(goals[0].currentAmount)
      const targetAmount = Number(goals[0].targetAmount)

      if (parsed.data.type === 'deposit' && accountBalance < amount) {
        throw new Error('INSUFFICIENT_ACCOUNT_FUNDS')
      }
      if (parsed.data.type === 'withdrawal' && currentAmount < amount) {
        throw new Error('INSUFFICIENT_SAVINGS_FUNDS')
      }

      const nextGoalAmount = parsed.data.type === 'deposit'
        ? currentAmount + amount
        : currentAmount - amount
      const nextStatus = nextGoalAmount >= targetAmount ? 'completed' : 'active'

      await tx
        .update(bankAccount)
        .set({
          balance: parsed.data.type === 'deposit'
            ? sql`${bankAccount.balance} - ${formattedAmount}`
            : sql`${bankAccount.balance} + ${formattedAmount}`,
          updatedAt: new Date(),
        })
        .where(and(eq(bankAccount.id, accounts[0].id), eq(bankAccount.userId, userId)))

      await tx
        .update(savingsGoal)
        .set({
          currentAmount: nextGoalAmount.toFixed(2),
          status: nextStatus,
          updatedAt: new Date(),
        })
        .where(and(eq(savingsGoal.id, goals[0].id), eq(savingsGoal.userId, userId)))

      await tx.insert(savingsMovement).values({
        id: randomUUID(),
        goalId: goals[0].id,
        userId,
        bankAccountId: accounts[0].id,
        amount: formattedAmount,
        type: parsed.data.type,
      })
    })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    const messages: Record<string, string> = {
      GOAL_NOT_FOUND: 'Savings goal not found',
      GOAL_CLOSED: 'Closed savings goals cannot be changed',
      ACCOUNT_NOT_FOUND: 'Linked account is not available',
      INSUFFICIENT_ACCOUNT_FUNDS: 'Insufficient account balance',
      INSUFFICIENT_SAVINGS_FUNDS: 'Insufficient savings balance',
    }

    if (messages[code]) return { ok: false, message: messages[code] }
    console.error('Savings movement failed', error)
    return { ok: false, message: 'Savings transfer could not be completed' }
  }

  refreshSavings(parsed.data.goalId)
  return {
    ok: true,
    message: parsed.data.type === 'deposit' ? 'Money added to savings' : 'Money returned to account',
  }
}
