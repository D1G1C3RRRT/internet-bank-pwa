import Link from 'next/link'
import { getTranslation, Language } from '@/lib/i18n'

interface BankAccount {
  id: string
  accountNumber: string
  accountType: string
  balance: string | number
  currency: string
  colorHex?: string | null
  isActive: boolean
}

interface AccountCardProps {
  account: BankAccount
  lang?: Language
  index?: number
}

export function AccountCard({ account, lang = 'en', index }: AccountCardProps) {
  const t = getTranslation(lang)
  const balance = typeof account.balance === 'string' 
    ? parseFloat(account.balance) 
    : account.balance

  const parts = balance.toFixed(2).split('.')
  const integerVal = parseInt(parts[0], 10)
  const decimalPart = parts[1]
  const symbol = account.currency === 'EUR' ? '€' : '$'
  const commaOrDot = account.currency === 'EUR' ? ',' : '.'

  // Format integer part with thousands separator according to language locale
  const integerPart = new Intl.NumberFormat(lang === 'sk' ? 'sk-SK' : 'en-US', {
    useGrouping: true,
  }).format(integerVal)

  const getFlagFromIBAN = (iban: string) => {
    if (!iban || iban.length < 2) return null
    const cc = iban.substring(0, 2).toUpperCase()
    const flagMap: Record<string, string> = {
      'SK': '🇸🇰', 'CZ': '🇨🇿', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'NL': '🇳🇱', 'AT': '🇦🇹', 'IT': '🇮🇹', 'GB': '🇬🇧', 'US': '🇺🇸'
    }
    return flagMap[cc] || null
  }

  const flag = getFlagFromIBAN(account.accountNumber)
  
  const iconStyle = account.colorHex 
    ? { backgroundColor: `${account.colorHex}25`, color: account.colorHex, borderColor: `${account.colorHex}30` }
    : undefined

  // Restore previous index-based logic to maintain compatibility and tests
  const getAccountInfo = (idx?: number) => {
    if (idx === undefined) {
      const isSavings = account.accountType === 'savings'
      return {
        name: account.accountType === 'checking' 
          ? t.checkingAccount 
          : account.accountType === 'savings'
            ? t.savingsAccount
            : account.accountType,
        icon: flag ? (
          <div 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl overflow-hidden shadow-inner border"
            style={iconStyle || { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {flag}
          </div>
        ) : (
          <div 
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner border ${
              !iconStyle ? (isSavings ? 'bg-amber-950/20 text-[#f3c144] border-amber-500/10' : 'bg-teal-950/20 text-teal-400 border-teal-500/10') : ''
            }`}
            style={iconStyle}
          >
            {isSavings ? '🐷' : '🏛️'}
          </div>
        )
      }
    }

    switch (idx) {
      case 0:
        return {
          name: lang === 'sk' ? 'NL € účet' : 'NL € account',
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner border"
              style={iconStyle || { backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#2dd4bf', borderColor: 'rgba(20, 184, 166, 0.15)' }}
            >
              🏛️
            </div>
          )
        }
      case 1:
        return {
          name: lang === 'sk' ? 'sporiaci účet' : 'savings account',
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner border"
              style={iconStyle || { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f3c144', borderColor: 'rgba(245, 158, 11, 0.15)' }}
            >
              🐷
            </div>
          )
        }
      case 2:
        return {
          name: lang === 'sk' ? 'Španielsky účet' : 'Spanish account',
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl overflow-hidden border shadow-inner"
              style={iconStyle || { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.15)' }}
            >
              🇪🇸
            </div>
          )
        }
      case 3:
        return {
          name: lang === 'sk' ? 'Francúzsky účet' : 'French account',
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl overflow-hidden border shadow-inner"
              style={iconStyle || { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.15)' }}
            >
              🇫🇷
            </div>
          )
        }
      case 4:
        return {
          name: lang === 'sk' ? 'Nemecký účet' : 'German account',
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl overflow-hidden border shadow-inner"
              style={iconStyle || { backgroundColor: 'rgba(115, 115, 115, 0.1)', borderColor: 'rgba(115, 115, 115, 0.15)' }}
            >
              🇩🇪
            </div>
          )
        }
      case 5:
        return {
          name: lang === 'sk' ? 'Tringelty /// --->' : 'Tips /// --->',
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner border"
              style={iconStyle || { backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.15)' }}
            >
              🐷
            </div>
          )
        }
      case 6:
        return {
          name: lang === 'sk' ? 'Spoločný účet' : 'Joint account',
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner border"
              style={iconStyle || { backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.15)' }}
            >
              ❤️
            </div>
          )
        }
      default: {
        const isSavings = account.accountType === 'savings'
        return {
          name: account.accountType === 'checking' 
            ? t.checkingAccount 
            : account.accountType === 'savings'
              ? t.savingsAccount
              : account.accountType,
          icon: (
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner border"
              style={iconStyle || (isSavings ? { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f3c144', borderColor: 'rgba(245, 158, 11, 0.15)' } : { backgroundColor: 'rgba(20, 184, 166, 0.1)', color: '#2dd4bf', borderColor: 'rgba(20, 184, 166, 0.15)' })}
            >
              {isSavings ? '🐷' : '🏛️'}
            </div>
          )
        }
      }
    }
  }

  const { name, icon } = getAccountInfo(index)

  return (
    <Link href={`/dashboard/accounts/${account.id}`} className="block">
      <div className="flex items-center justify-between py-3.5 px-4 hover:bg-slate-100/50 dark:hover:bg-zinc-900/40 transition-colors duration-200 cursor-pointer rounded-2xl">
        <div className="flex items-center gap-4">
          {icon}
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">
              {name}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[17px] font-black text-foreground inline-flex items-baseline tracking-tight">
            <span>{integerPart}</span>
            <span className="text-[0.6em] font-black relative -top-[0.45em] ml-0.5">
              {commaOrDot}{decimalPart} {symbol}
            </span>
          </span>
          {!account.isActive && (
            <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider mt-0.5">
              {t.inactive}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
