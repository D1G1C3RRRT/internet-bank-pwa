'use server'

import { randomInt, randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { bankAccount, cardActivity, paymentCard } from '@/lib/db/schema'
import { requireUserId } from '@/lib/auth/require-user'
import {
  cardIdSchema,
  cardLimitSchema,
  cardStatusSchema,
  createVirtualCardSchema,
  type CardLimitInput,
  type CardStatusInput,
  type CreateVirtualCardInput,
} from '@/lib/validation/cards'

export type CardActionResult = {
  ok: boolean
  message: string
}

function validationMessage(error: unknown) {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues?: Array<{ message?: string }> }).issues
    return issues?.[0]?.message ?? 'Invalid card data'
  }

  return null
}

function refreshCardPages(cardId?: string) {
  revalidatePath('/dashboard/cards')
  if (cardId) revalidatePath(`/dashboard/cards/${cardId}`)
}

export async function getCards() {
  const userId = await requireUserId()

  return db
    .select({
      id: paymentCard.id,
      bankAccountId: paymentCard.bankAccountId,
      label: paymentCard.label,
      cardType: paymentCard.cardType,
      status: paymentCard.status,
      network: paymentCard.network,
      last4: paymentCard.last4,
      dailyLimit: paymentCard.dailyLimit,
      monthlyLimit: paymentCard.monthlyLimit,
      allowContactless: paymentCard.allowContactless,
      allowOnlinePayments: paymentCard.allowOnlinePayments,
      allowInternational: paymentCard.allowInternational,
      expiresAt: paymentCard.expiresAt,
      createdAt: paymentCard.createdAt,
      accountNumber: bankAccount.accountNumber,
      currency: bankAccount.currency,
    })
    .from(paymentCard)
    .innerJoin(bankAccount, eq(paymentCard.bankAccountId, bankAccount.id))
    .where(eq(paymentCard.userId, userId))
    .orderBy(desc(paymentCard.createdAt))
}

export async function getCard(cardId: string) {
  const userId = await requireUserId()
  const parsedCardId = cardIdSchema.safeParse(cardId)
  if (!parsedCardId.success) return null

  const cards = await db
    .select({
      id: paymentCard.id,
      bankAccountId: paymentCard.bankAccountId,
      label: paymentCard.label,
      cardType: paymentCard.cardType,
      status: paymentCard.status,
      network: paymentCard.network,
      last4: paymentCard.last4,
      dailyLimit: paymentCard.dailyLimit,
      monthlyLimit: paymentCard.monthlyLimit,
      allowContactless: paymentCard.allowContactless,
      allowOnlinePayments: paymentCard.allowOnlinePayments,
      allowInternational: paymentCard.allowInternational,
      expiresAt: paymentCard.expiresAt,
      createdAt: paymentCard.createdAt,
      accountNumber: bankAccount.accountNumber,
      currency: bankAccount.currency,
    })
    .from(paymentCard)
    .innerJoin(bankAccount, eq(paymentCard.bankAccountId, bankAccount.id))
    .where(
      and(
        eq(paymentCard.id, parsedCardId.data),
        eq(paymentCard.userId, userId)
      )
    )
    .limit(1)

  if (!cards[0]) return null

  const activity = await db
    .select({
      id: cardActivity.id,
      action: cardActivity.action,
      description: cardActivity.description,
      createdAt: cardActivity.createdAt,
    })
    .from(cardActivity)
    .where(
      and(
        eq(cardActivity.cardId, parsedCardId.data),
        eq(cardActivity.userId, userId)
      )
    )
    .orderBy(desc(cardActivity.createdAt))
    .limit(30)

  return { card: cards[0], activity }
}

export async function createVirtualCard(
  input: CreateVirtualCardInput
): Promise<CardActionResult> {
  const userId = await requireUserId()
  const parsed = createVirtualCardSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, message: validationMessage(parsed.error) ?? 'Invalid card data' }
  }

  const accounts = await db
    .select({ id: bankAccount.id })
    .from(bankAccount)
    .where(
      and(
        eq(bankAccount.id, parsed.data.bankAccountId),
        eq(bankAccount.userId, userId),
        eq(bankAccount.isActive, true)
      )
    )
    .limit(1)

  if (!accounts[0]) {
    return { ok: false, message: 'Selected account is not available' }
  }

  const cardId = randomUUID()
  const last4 = randomInt(0, 10_000).toString().padStart(4, '0')
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 3)

  await db.transaction(async (tx) => {
    await tx.insert(paymentCard).values({
      id: cardId,
      userId,
      bankAccountId: parsed.data.bankAccountId,
      label: parsed.data.label,
      cardType: 'virtual',
      status: 'active',
      network: 'mastercard',
      last4,
      dailyLimit: '500.00',
      monthlyLimit: '3000.00',
      allowContactless: true,
      allowOnlinePayments: true,
      allowInternational: true,
      expiresAt,
    })

    await tx.insert(cardActivity).values({
      id: randomUUID(),
      cardId,
      userId,
      action: 'created',
      description: 'Virtual card created',
    })
  })

  refreshCardPages(cardId)
  return { ok: true, message: 'Virtual card created' }
}

export async function setCardFrozen(
  input: CardStatusInput
): Promise<CardActionResult> {
  const userId = await requireUserId()
  const parsed = cardStatusSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, message: validationMessage(parsed.error) ?? 'Invalid card data' }
  }

  const existing = await db
    .select({ status: paymentCard.status })
    .from(paymentCard)
    .where(
      and(eq(paymentCard.id, parsed.data.cardId), eq(paymentCard.userId, userId))
    )
    .limit(1)

  if (!existing[0]) return { ok: false, message: 'Card not found' }
  if (existing[0].status === 'closed') {
    return { ok: false, message: 'Closed cards cannot be changed' }
  }

  const nextStatus = parsed.data.frozen ? 'frozen' : 'active'
  if (existing[0].status === nextStatus) {
    return { ok: true, message: parsed.data.frozen ? 'Card is already frozen' : 'Card is already active' }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(paymentCard)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(
        and(eq(paymentCard.id, parsed.data.cardId), eq(paymentCard.userId, userId))
      )

    await tx.insert(cardActivity).values({
      id: randomUUID(),
      cardId: parsed.data.cardId,
      userId,
      action: nextStatus,
      description: nextStatus === 'frozen' ? 'Card frozen' : 'Card unfrozen',
    })
  })

  refreshCardPages(parsed.data.cardId)
  return { ok: true, message: nextStatus === 'frozen' ? 'Card frozen' : 'Card unfrozen' }
}

export async function updateCardDailyLimit(
  input: CardLimitInput
): Promise<CardActionResult> {
  const userId = await requireUserId()
  const parsed = cardLimitSchema.safeParse(input)

  if (!parsed.success) {
    return { ok: false, message: validationMessage(parsed.error) ?? 'Invalid card limit' }
  }

  const existing = await db
    .select({ status: paymentCard.status })
    .from(paymentCard)
    .where(
      and(eq(paymentCard.id, parsed.data.cardId), eq(paymentCard.userId, userId))
    )
    .limit(1)

  if (!existing[0]) return { ok: false, message: 'Card not found' }
  if (existing[0].status === 'closed') {
    return { ok: false, message: 'Closed cards cannot be changed' }
  }

  const formattedLimit = parsed.data.dailyLimit.toFixed(2)

  await db.transaction(async (tx) => {
    await tx
      .update(paymentCard)
      .set({ dailyLimit: formattedLimit, updatedAt: new Date() })
      .where(
        and(eq(paymentCard.id, parsed.data.cardId), eq(paymentCard.userId, userId))
      )

    await tx.insert(cardActivity).values({
      id: randomUUID(),
      cardId: parsed.data.cardId,
      userId,
      action: 'limit_changed',
      description: `Daily limit changed to ${formattedLimit}`,
    })
  })

  refreshCardPages(parsed.data.cardId)
  return { ok: true, message: 'Daily limit updated' }
}

export async function updateCardMonthlyLimit(
  input: { cardId: string; monthlyLimit: number }
): Promise<CardActionResult> {
  const userId = await requireUserId()
  const formattedLimit = input.monthlyLimit.toFixed(2)

  await db.transaction(async (tx) => {
    await tx
      .update(paymentCard)
      .set({ monthlyLimit: formattedLimit, updatedAt: new Date() })
      .where(and(eq(paymentCard.id, input.cardId), eq(paymentCard.userId, userId)))

    await tx.insert(cardActivity).values({
      id: randomUUID(),
      cardId: input.cardId,
      userId,
      action: 'limit_changed',
      description: `Monthly limit changed to ${formattedLimit}`,
    })
  })

  refreshCardPages(input.cardId)
  return { ok: true, message: 'Monthly limit updated' }
}

export async function toggleCardContactless(
  input: { cardId: string; allowed: boolean }
): Promise<CardActionResult> {
  const userId = await requireUserId()

  await db.transaction(async (tx) => {
    await tx
      .update(paymentCard)
      .set({ allowContactless: input.allowed, updatedAt: new Date() })
      .where(and(eq(paymentCard.id, input.cardId), eq(paymentCard.userId, userId)))

    await tx.insert(cardActivity).values({
      id: randomUUID(),
      cardId: input.cardId,
      userId,
      action: 'feature_toggled',
      description: input.allowed ? 'Contactless payments enabled' : 'Contactless payments disabled',
    })
  })

  refreshCardPages(input.cardId)
  return { ok: true, message: input.allowed ? 'Contactless enabled' : 'Contactless disabled' }
}

export async function toggleCardOnlinePayments(
  input: { cardId: string; allowed: boolean }
): Promise<CardActionResult> {
  const userId = await requireUserId()

  await db.transaction(async (tx) => {
    await tx
      .update(paymentCard)
      .set({ allowOnlinePayments: input.allowed, updatedAt: new Date() })
      .where(and(eq(paymentCard.id, input.cardId), eq(paymentCard.userId, userId)))

    await tx.insert(cardActivity).values({
      id: randomUUID(),
      cardId: input.cardId,
      userId,
      action: 'feature_toggled',
      description: input.allowed ? 'Online payments enabled' : 'Online payments disabled',
    })
  })

  refreshCardPages(input.cardId)
  return { ok: true, message: input.allowed ? 'Online payments enabled' : 'Online payments disabled' }
}

export async function toggleCardInternational(
  input: { cardId: string; allowed: boolean }
): Promise<CardActionResult> {
  const userId = await requireUserId()

  await db.transaction(async (tx) => {
    await tx
      .update(paymentCard)
      .set({ allowInternational: input.allowed, updatedAt: new Date() })
      .where(and(eq(paymentCard.id, input.cardId), eq(paymentCard.userId, userId)))

    await tx.insert(cardActivity).values({
      id: randomUUID(),
      cardId: input.cardId,
      userId,
      action: 'feature_toggled',
      description: input.allowed ? 'International payments enabled' : 'International payments disabled',
    })
  })

  refreshCardPages(input.cardId)
  return { ok: true, message: input.allowed ? 'International payments enabled' : 'International payments disabled' }
}

