import { CalendarDays, PiggyBank } from 'lucide-react'

export function SavingsGoalCard({
  name,
  currentAmount,
  targetAmount,
  currency,
  targetDate,
  status,
  lang,
}: {
  name: string
  currentAmount: string
  targetAmount: string
  currency: string
  targetDate: Date | null
  status: string
  lang: 'en' | 'sk'
}) {
  const current = Number(currentAmount)
  const target = Number(targetAmount)
  const progress = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0
  const formatter = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
    style: 'currency',
    currency,
  })

  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-pink-500/10 via-background to-violet-500/10 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/15 text-pink-500">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black">{name}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">{status}</p>
          </div>
        </div>
        <span className="text-sm font-black text-pink-500">{progress.toFixed(0)}%</span>
      </div>

      <div className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <p className="text-2xl font-black">{formatter.format(current)}</p>
          <p className="text-xs font-bold text-muted-foreground">/ {formatter.format(target)}</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {targetDate && (
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {new Intl.DateTimeFormat(lang === 'sk' ? 'sk-SK' : 'en-GB', { dateStyle: 'medium' }).format(targetDate)}
        </div>
      )}
    </div>
  )
}
