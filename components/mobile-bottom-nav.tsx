import Link from 'next/link'
import type { Language } from '@/lib/i18n'

// Custom SVGs designed to match the 1:1 look of the mobile footer icons in the image
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3L3 11h3v8h4v-5h4v5h4v-8h3L12 3z" />
    </svg>
  )
}

function CardsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {/* Vertical card split by a clean middle gap */}
      <path d="M8 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h1V3z" />
      <path d="M11 3h6a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-6V3z" />
    </svg>
  )
}

function SavingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {/* Piggy bank silhouette mirrored to face left (snout on the left, tail on the right) */}
      <g transform="scale(-1, 1) translate(-24, 0)">
        <path d="M19 9.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2z" />
        <path d="M12 3c-4.97 0-9 3.58-9 8c0 2.2.98 4.2 2.58 5.66L4.5 19.5a1 1 0 0 0 1.5 1.2l2-1.7c1.23.63 2.62 1 4 1 4.97 0 9-3.58 9-8s-4.03-8-9-8zm-5 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6-4a1.5 1.5 0 0 1 1.5 1.5h-3A1.5 1.5 0 0 1 13 6z" />
      </g>
    </svg>
  )
}

function StocksIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Bars filled */}
      <rect x="4" y="14" width="3" height="7" rx="0.75" fill="currentColor" stroke="none" />
      <rect x="10" y="9" width="3" height="12" rx="0.75" fill="currentColor" stroke="none" />
      <rect x="16" y="4" width="3" height="17" rx="0.75" fill="currentColor" stroke="none" />
      {/* Arrow curve and head */}
      <path d="M3 17c4-5 8-8 15-9.5" />
      <path d="M14 7.5h4v4" />
    </svg>
  )
}

function CryptoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <defs>
        <mask id="bitcoin-mask">
          {/* Main mask body */}
          <rect width="24" height="24" fill="white" />
          {/* Bitcoin cutout inside shield */}
          <text x="12" y="15.8" textAnchor="middle" fontSize="10.5" fontWeight="900" fontFamily="system-ui, sans-serif" fill="black">₿</text>
        </mask>
      </defs>
      <path d="M12 2s8 3 8 7.5V14c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V9.5C4 5 7.5 2 12 2z" mask="url(#bitcoin-mask)" />
    </svg>
  )
}

const items = [
  { key: 'home', href: '/dashboard', labelSk: 'Domov', labelEn: 'Home', Icon: HomeIcon },
  { key: 'cards', href: '/dashboard/cards', labelSk: 'Karty', labelEn: 'Cards', Icon: CardsIcon },
  { key: 'savings', href: '/dashboard/savings', labelSk: 'Sporenie', labelEn: 'Savings', Icon: SavingsIcon },
  { key: 'stocks', href: '/dashboard/stocks', labelSk: 'Akcie', labelEn: 'Stocks', Icon: StocksIcon },
  { key: 'crypto', href: '/dashboard/crypto', labelSk: 'Crypto', labelEn: 'Crypto', Icon: CryptoIcon },
] as const

export function MobileBottomNav({ active, lang }: { active: string; lang: Language }) {
  return (
    <nav
      aria-label={lang === 'sk' ? 'Hlavná navigácia' : 'Main navigation'}
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-zinc-950/40 backdrop-blur-2xl border border-white/[0.08] rounded-[2rem] py-2 px-3 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-40"
    >
      {items.map((item) => {
        const isActive = active === item.key
        const label = lang === 'sk' ? item.labelSk : item.labelEn
        const IconComponent = item.Icon

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-2xl transition-all duration-300 select-none ${
              isActive
                ? 'bg-white/10 backdrop-blur-md border border-white/5 text-sky-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <IconComponent className="w-6 h-6" />
            <span className={`text-[10px] mt-1 ${isActive ? 'font-extrabold' : 'font-semibold'}`}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
