'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'

export function LanguageSelector() {
  const router = useRouter()
  const [lang, setLang] = useState<'en' | 'sk'>('sk')

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)
    if (match && (match[1] === 'en' || match[1] === 'sk')) {
      setLang(match[1] as 'en' | 'sk')
    }
  }, [])

  const handleLanguageChange = (newLang: 'en' | 'sk') => {
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax` // 1 year
    setLang(newLang)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl border border-slate-200/80 transition-all shadow-sm">
      <Languages className="w-4 h-4 text-slate-500" />
      <select
        value={lang}
        onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'sk')}
        className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs font-semibold text-slate-700 cursor-pointer pr-1"
      >
        <option value="en">EN</option>
        <option value="sk">SK</option>
      </select>
    </div>
  )
}
