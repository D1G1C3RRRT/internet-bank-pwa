import { ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react'
import { Language } from '@/lib/i18n'

interface Transaction {
  id: string
  amount: string | number
  type: string
  description: string | null
  status: string
  createdAt: Date
  currency?: string | null
}

export function TransactionsList({ transactions, lang = 'sk' }: { transactions: Transaction[]; lang?: Language }) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-4 h-4 text-green-500" />
      case 'withdrawal':
        return <ArrowDownLeft className="w-4 h-4 text-red-500" />
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4 text-blue-500" />
      default:
        return <Plus className="w-4 h-4" />
    }
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-zinc-900/60">
      {transactions.map((txn) => {
        const isCredit = txn.type === 'deposit'
        const balanceVal = typeof txn.amount === 'string'
          ? parseFloat(txn.amount)
          : txn.amount

        const formattedNumber = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true,
        }).format(balanceVal)

        const symbol = txn.currency === 'EUR' ? '€' : '$'
        const amountDisplay = txn.currency === 'EUR'
          ? `${formattedNumber} ${symbol}`
          : `${symbol}${formattedNumber}`

        return (
          <div key={txn.id} className="py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-950/30 px-3 transition-colors rounded-2xl duration-200">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                txn.type === 'deposit'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : txn.type === 'withdrawal'
                    ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                    : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
              }`}>
                {getTransactionIcon(txn.type)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground capitalize leading-tight">
                  {txn.type}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[150px] sm:max-w-xs truncate">
                  {txn.description || new Date(txn.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-extrabold ${
                isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
              }`}>
                {isCredit ? '+' : '-'}{amountDisplay}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">
                {txn.status}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
