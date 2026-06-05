'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBankAccount } from '@/app/actions/banking'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getTranslation, Language } from '@/lib/i18n'

export function NewAccountButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState('USD')
  const [lang, setLang] = useState<Language>('sk')

  useEffect(() => {
    const langMatch = document.cookie.match(/(?:^|; )lang=([^;]*)/)
    let currentLang: Language = 'sk'
    if (langMatch && (langMatch[1] === 'en' || langMatch[1] === 'sk')) {
      currentLang = langMatch[1] as Language
      setLang(currentLang)
    }

    const currencyMatch = document.cookie.match(/(?:^|; )currency=([^;]*)/)
    if (currencyMatch && (currencyMatch[1] === 'EUR' || currencyMatch[1] === 'USD')) {
      setCurrency(currencyMatch[1])
    } else {
      setCurrency(currentLang === 'sk' ? 'EUR' : 'USD')
    }
  }, [])

  const t = getTranslation(lang)

  const handleCreateAccount = async (type: 'checking' | 'savings') => {
    setLoading(true)
    try {
      await createBankAccount(type, currency)
      router.refresh()
    } catch (error) {
      console.error('Failed to create account:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-900 border-0 rounded-2xl text-foreground text-xs font-extrabold focus:outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-850/80 transition duration-200"
      >
        <option value="USD" className="bg-white dark:bg-black">USD ($)</option>
        <option value="EUR" className="bg-white dark:bg-black">EUR (€)</option>
      </select>
      <Button
        onClick={() => handleCreateAccount('checking')}
        disabled={loading}
        size="sm"
        variant="default"
        className="gap-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black rounded-2xl font-bold py-5 px-4 transition border-0 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        {t.checkingAccount}
      </Button>
      <Button
        onClick={() => handleCreateAccount('savings')}
        disabled={loading}
        size="sm"
        variant="outline"
        className="gap-2 border border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900 text-foreground rounded-2xl font-bold py-5 px-4 transition shadow-sm"
      >
        <Plus className="w-4 h-4" />
        {t.savingsAccount}
      </Button>
    </div>
  )
}
