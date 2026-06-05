'use server'

import { randomUUID } from 'node:crypto'
import { and, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireUserId } from '@/lib/auth/require-user'
import { db } from '@/lib/db'
import { cryptoHolding, cryptoTrade, user } from '@/lib/db/schema'
import { mockCryptoQuoteProvider } from '@/lib/market/crypto'
import { roundMoney } from '@/lib/utils'
import { cryptoTradeSchema, type CryptoTradeInput } from '@/lib/validation/crypto'

export type CryptoActionResult = { ok: boolean; message: string }

function firstIssue(error: { issues?: Array<{ message?: string }> }) {
  return error.issues?.[0]?.message ?? 'Invalid crypto data'
}

export async function getCryptoOverview() {
  const userId = await requireUserId()
  const [quotes, holdings, trades] = await Promise.all([
    mockCryptoQuoteProvider.getQuotes(),
    db
      .select({
        id: cryptoHolding.id,
        symbol: cryptoHolding.symbol,
        quantity: cryptoHolding.quantity,
        averagePrice: cryptoHolding.averagePrice,
      })
      .from(cryptoHolding)
      .where(eq(cryptoHolding.userId, userId)),
    db
      .select({
        id: cryptoTrade.id,
        symbol: cryptoTrade.symbol,
        type: cryptoTrade.type,
        quantity: cryptoTrade.quantity,
        price: cryptoTrade.price,
        total: cryptoTrade.total,
        createdAt: cryptoTrade.createdAt,
      })
      .from(cryptoTrade)
      .where(eq(cryptoTrade.userId, userId))
      .orderBy(desc(cryptoTrade.createdAt))
      .limit(50),
  ])

  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]))
  return {
    quotes,
    holdings: holdings.map((holding) => ({
      ...holding,
      quote: quoteMap.get(holding.symbol as (typeof quotes)[number]['symbol']) ?? null,
    })),
    trades,
  }
}

export async function executeDemoCryptoTrade(
  input: CryptoTradeInput
): Promise<CryptoActionResult> {
  const userId = await requireUserId()
  const parsed = cryptoTradeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }

  const quote = await mockCryptoQuoteProvider.getQuote(parsed.data.symbol)
  const quantity = parsed.data.quantity
  const total = quantity * quote.price
  if (total < 0.01) {
    return { ok: false, message: 'Demo trade value must be at least $0.01' }
  }

  const quantityValue = quantity.toFixed(12)
  const priceValue = quote.price.toFixed(8)
  const totalValue = roundMoney(total).toFixed(2)

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT ${user.id} FROM ${user} WHERE ${user.id} = ${userId} FOR UPDATE
      `)

      const holdings = await tx
        .select({
          id: cryptoHolding.id,
          quantity: cryptoHolding.quantity,
          averagePrice: cryptoHolding.averagePrice,
        })
        .from(cryptoHolding)
        .where(
          and(
            eq(cryptoHolding.userId, userId),
            eq(cryptoHolding.symbol, parsed.data.symbol)
          )
        )
        .limit(1)

      const current = holdings[0]
      const currentQuantity = Number(current?.quantity ?? 0)
      if (parsed.data.type === 'sell' && currentQuantity < quantity) {
        throw new Error('INSUFFICIENT_HOLDING')
      }

      if (parsed.data.type === 'buy') {
        if (current) {
          const nextQuantity = currentQuantity + quantity
          const nextAverage = (
            (currentQuantity * Number(current.averagePrice) + quantity * quote.price) /
            nextQuantity
          )
          await tx
            .update(cryptoHolding)
            .set({
              quantity: nextQuantity.toFixed(12),
              averagePrice: nextAverage.toFixed(8),
              updatedAt: new Date(),
            })
            .where(
              and(eq(cryptoHolding.id, current.id), eq(cryptoHolding.userId, userId))
            )
        } else {
          await tx.insert(cryptoHolding).values({
            id: randomUUID(),
            userId,
            symbol: parsed.data.symbol,
            quantity: quantityValue,
            averagePrice: priceValue,
          })
        }
      } else if (current) {
        const nextQuantity = currentQuantity - quantity
        if (nextQuantity < 0.000000000001) {
          await tx
            .delete(cryptoHolding)
            .where(
              and(eq(cryptoHolding.id, current.id), eq(cryptoHolding.userId, userId))
            )
        } else {
          await tx
            .update(cryptoHolding)
            .set({ quantity: nextQuantity.toFixed(12), updatedAt: new Date() })
            .where(
              and(eq(cryptoHolding.id, current.id), eq(cryptoHolding.userId, userId))
            )
        }
      }

      await tx.insert(cryptoTrade).values({
        id: randomUUID(),
        userId,
        symbol: parsed.data.symbol,
        type: parsed.data.type,
        quantity: quantityValue,
        price: priceValue,
        total: totalValue,
      })
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_HOLDING') {
      return { ok: false, message: 'You do not own enough crypto for this demo sale' }
    }
    console.error('Demo crypto trade failed', error)
    return { ok: false, message: 'Demo crypto trade could not be completed' }
  }

  revalidatePath('/dashboard/crypto')
  return {
    ok: true,
    message: parsed.data.type === 'buy' ? 'Demo crypto added' : 'Demo crypto sold',
  }
}
