import { Snowflake } from 'lucide-react'

type CardVisualProps = {
  label: string
  last4: string
  cardType: string
  status: string
  network: string
  expiresAt: Date
  compact?: boolean
}

export function CardVisual({
  label,
  last4,
  cardType,
  status,
  network,
  expiresAt,
  compact = false,
}: CardVisualProps) {
  const expiry = new Intl.DateTimeFormat('en', {
    month: '2-digit',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(expiresAt)

  return (
    <div
      className={`relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-[#372667] via-[#181126] to-[#08080b] text-white shadow-2xl ${
        compact ? 'min-h-48 p-5' : 'min-h-60 p-7'
      }`}
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-between gap-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">
              {cardType === 'virtual' ? 'Virtual' : 'Physical'}
            </p>
            <p className="mt-1 truncate text-lg font-black">{label}</p>
          </div>
          <div className="flex items-center gap-2">
            {status === 'frozen' && <Snowflake className="h-4 w-4 text-sky-300" />}
            <span className="text-sm font-black uppercase italic tracking-tight">{network}</span>
          </div>
        </div>

        <div className="space-y-5">
          <p className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold tracking-[0.16em]`}>
            •••• •••• •••• {last4}
          </p>
          <div className="flex items-end justify-between text-xs">
            <div>
              <p className="uppercase tracking-widest text-white/45">Valid thru</p>
              <p className="mt-1 font-bold">{expiry}</p>
            </div>
            <span className={`rounded-full px-3 py-1 font-bold capitalize ${
              status === 'active'
                ? 'bg-emerald-400/15 text-emerald-300'
                : status === 'frozen'
                  ? 'bg-sky-400/15 text-sky-300'
                  : 'bg-zinc-400/15 text-zinc-300'
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
