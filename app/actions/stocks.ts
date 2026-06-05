'use server'

import { randomUUID } from 'node:crypto'
import { and, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireUserId } from '@/lib/auth/require-user'
import { db } from '@/lib/db'
import {
  stockPosition,
  stockTrade,
  stockWatchlist,
  user,
} from '@/lib/db/schema'
import { mockStockQuoteProvider } from '@/lib/market/stocks'
import { roundMoney } from '@/lib/utils'
import {
  stockSymbolSchema,
  stockTradeSchema,
  type StockTradeInput,
} from '@/lib/validation/stocks'

export type StockActionResult = { ok: boolean; message: string }

function firstIssue(error: { issues?: Array<{ message?: string }> }) {
  return error.issues?.[0]?.message ?? 'Invalid stock data'
}

function refreshStocks() {
  revalidatePath('/dashboard/stocks')
}

export async function getStocksOverview() {
  const userId = await requireUserId()
  const [quotes, watchlistRows, positions, trades] = await Promise.all([
    mockStockQuoteProvider.getQuotes(),
    db
      .select({ symbol: stockWatchlist.symbol })
      .from(stockWatchlist)
      .where(eq(stockWatchlist.userId, userId)),
    db
      .select({
        id: stockPosition.id,
        symbol: stockPosition.symbol,
        quantity: stockPosition.quantity,
        averagePrice: stockPosition.averagePrice,
      })
      .from(stockPosition)
      .where(eq(stockPosition.userId, userId)),
    db
      .select({
        id: stockTrade.id,
        symbol: stockTrade.symbol,
        type: stockTrade.type,
        quantity: stockTrade.quantity,
        price: stockTrade.price,
        total: stockTrade.total,
        createdAt: stockTrade.createdAt,
      })
      .from(stockTrade)
      .where(eq(stockTrade.userId, userId))
      .orderBy(desc(stockTrade.createdAt))
      .limit(50),
  ])

  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]))

  return {
    quotes,
    watchlist: watchlistRows.map((row) => row.symbol),
    positions: positions.map((position) => ({
      ...position,
      quote: quoteMap.get(position.symbol as (typeof quotes)[number]['symbol']) ?? null,
    })),
    trades,
  }
}

export async function toggleStockWatchlist(symbol: string): Promise<StockActionResult> {
  const userId = await requireUserId()
  const parsed = stockSymbolSchema.safeParse(symbol)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }

  let added = false
  await db.transaction(async (tx) => {
    await tx.execute(sql`
      SELECT ${user.id} FROM ${user} WHERE ${user.id} = ${userId} FOR UPDATE
    `)

    const existing = await tx
      .select({ id: stockWatchlist.id })
      .from(stockWatchlist)
      .where(
        and(
          eq(stockWatchlist.userId, userId),
          eq(stockWatchlist.symbol, parsed.data)
        )
      )
      .limit(1)

    if (existing[0]) {
      await tx
        .delete(stockWatchlist)
        .where(
          and(
            eq(stockWatchlist.id, existing[0].id),
            eq(stockWatchlist.userId, userId)
          )
        )
      return
    }

    await tx.insert(stockWatchlist).values({
      id: randomUUID(),
      userId,
      symbol: parsed.data,
    })
    added = true
  })

  refreshStocks()
  return { ok: true, message: added ? 'Added to watchlist' : 'Removed from watchlist' }
}

export async function executeDemoStockTrade(
  input: StockTradeInput
): Promise<StockActionResult> {
  const userId = await requireUserId()
  const parsed = stockTradeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) }

  const quote = await mockStockQuoteProvider.getQuote(parsed.data.symbol)
  const quantity = parsed.data.quantity
  const quantityValue = quantity.toFixed(6)
  const priceValue = quote.price.toFixed(4)
  const totalValue = roundMoney(quantity * quote.price).toFixed(2)

  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT ${user.id} FROM ${user} WHERE ${user.id} = ${userId} FOR UPDATE
      `)

      const positions = await tx
        .select({
          id: stockPosition.id,
          quantity: stockPosition.quantity,
          averagePrice: stockPosition.averagePrice,
        })
        .from(stockPosition)
        .where(
          and(
            eq(stockPosition.userId, userId),
            eq(stockPosition.symbol, parsed.data.symbol)
          )
        )
        .limit(1)

      const current = positions[0]
      const currentQuantity = Number(current?.quantity ?? 0)

      if (parsed.data.type === 'sell' && currentQuantity < quantity) {
        throw new Error('INSUFFICIENT_POSITION')
      }

      if (parsed.data.type === 'buy') {
        if (current) {
          const nextQuantity = currentQuantity + quantity
          const nextAverage = (
            (currentQuantity * Number(current.averagePrice) + quantity * quote.price) /
            nextQuantity
          )
          await tx
            .update(stockPosition)
            .set({
              quantity: nextQuantity.toFixed(6),
              averagePrice: nextAverage.toFixed(4),
              updatedAt: new Date(),
            })
            .where(
              and(eq(stockPosition.id, current.id), eq(stockPosition.userId, userId))
            )
        } else {
          await tx.insert(stockPosition).values({
            id: randomUUID(),
            userId,
            symbol: parsed.data.symbol,
            quantity: quantityValue,
            averagePrice: priceValue,
          })
        }
      } else if (current) {
        const nextQuantity = currentQuantity - quantity
        if (nextQuantity < 0.000001) {
          await tx
            .delete(stockPosition)
            .where(
              and(eq(stockPosition.id, current.id), eq(stockPosition.userId, userId))
            )
        } else {
          await tx
            .update(stockPosition)
            .set({ quantity: nextQuantity.toFixed(6), updatedAt: new Date() })
            .where(
              and(eq(stockPosition.id, current.id), eq(stockPosition.userId, userId))
            )
        }
      }

      await tx.insert(stockTrade).values({
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
    if (error instanceof Error && error.message === 'INSUFFICIENT_POSITION') {
      return { ok: false, message: 'You do not own enough shares for this demo sale' }
    }
    console.error('Demo stock trade failed', error)
    return { ok: false, message: 'Demo trade could not be completed' }
  }

  refreshStocks()
  return {
    ok: true,
    message: parsed.data.type === 'buy' ? 'Demo shares added' : 'Demo shares sold',
  }
}
