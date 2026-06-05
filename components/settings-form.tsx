'use client'

import { useState } from 'react'
import { updateProfile, savePreferences } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Settings, Check, Globe, Coins, ShieldCheck, AlertTriangle } from 'lucide-react'

interface SettingsFormProps {
  user: {
    name?: string | null
    image?: string | null
  }
  initialLang: 'sk' | 'en'
  initialCurrency: 'EUR' | 'USD'
}

const presetAvatars = [
  { emoji: '🦁', gradient: 'from-amber-400 to-orange-600', label: 'Lion' },
  { emoji: '🦊', gradient: 'from-orange-400 to-red-600', label: 'Fox' },
  { emoji: '🐼', gradient: 'from-zinc-400 to-zinc-700', label: 'Panda' },
  { emoji: '🦄', gradient: 'from-fuchsia-400 to-violet-600', label: 'Unicorn' },
  { emoji: '🚀', gradient: 'from-cyan-400 to-indigo-600', label: 'Rocket' },
  { emoji: '💡', gradient: 'from-yellow-300 to-amber-500', label: 'Bulb' },
]

const settingsDict = {
  en: {
    profileSettings: 'Profile Settings',
    profileDesc: 'Update your profile details and select a custom avatar.',
    preferences: 'App Preferences',
    preferencesDesc: 'Set your preferred language and default currency.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    chooseAvatar: 'Choose Profile Avatar',
    langLabel: 'Language',
    currencyLabel: 'Default Currency',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saveSuccess: 'Settings updated successfully!',
    saveError: 'Failed to update settings.',
    noteSlovakEUR: 'Slovak language defaults to EUR.',
  },
  sk: {
    profileSettings: 'Nastavenia profilu',
    profileDesc: 'Aktualizujte svoje osobné údaje a vyberte si vlastného avatara.',
    preferences: 'Predvoľby aplikácie',
    preferencesDesc: 'Nastavte si preferovaný jazyk a predvolenú menu.',
    fullName: 'Celé meno',
    fullNamePlaceholder: 'Zadajte svoje celé meno',
    chooseAvatar: 'Vybrať profilového avatara',
    langLabel: 'Jazyk',
    currencyLabel: 'Predvolená mena',
    saveChanges: 'Uložiť zmeny',
    saving: 'Ukladá sa...',
    saveSuccess: 'Nastavenia boli úspešne uložené!',
    saveError: 'Nepodarilo sa uložiť nastavenia.',
    noteSlovakEUR: 'Pri slovenskom jazyku je predvolená mena vždy EUR.',
  }
}

export function SettingsForm({ user, initialLang, initialCurrency }: SettingsFormProps) {
  const [name, setName] = useState(user.name || '')
  const [selectedAvatar, setSelectedAvatar] = useState(user.image || '🦁')
  const [lang, setLang] = useState<'sk' | 'en'>(initialLang)
  const [currency, setCurrency] = useState<'EUR' | 'USD'>(initialCurrency)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const t = settingsDict[lang]

  const handleLangChange = (newLang: 'sk' | 'en') => {
    setLang(newLang)
    if (newLang === 'sk') {
      setCurrency('EUR') // Slovak language defaults currency to EUR
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Save Profile DB Settings
      const profileRes = await updateProfile({
        name,
        image: selectedAvatar
      })

      if (!profileRes.ok) {
        throw new Error(profileRes.error || t.saveError)
      }

      // 2. Save Preferences Cookies
      const prefRes = await savePreferences({
        lang,
        currency
      })

      if (!prefRes.ok) {
        throw new Error(prefRes.error || t.saveError)
      }

      setSuccess(t.saveSuccess)
      // Force page reload after short delay to apply language and currency cookies globally
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (err: any) {
      setError(err.message || t.saveError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-[fadeInPage_0.5s_ease-in-out]">
      {/* Success & Error feedbacks */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400 font-bold leading-tight">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold leading-tight">{success}</p>
        </div>
      )}

      {/* 1. Profile Settings */}
      <div className="bg-[#f8f9fa] dark:bg-[#161618] border border-slate-200/50 dark:border-zinc-900/50 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="flex gap-4 items-start pb-2 border-b border-slate-200/40 dark:border-zinc-800/40">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-md font-black tracking-tight text-foreground leading-tight">{t.profileSettings}</h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-0.5">{t.profileDesc}</p>
          </div>
        </div>

        {/* Full Name Input */}
        <div className="space-y-2">
          <Label htmlFor="fullname" className="text-foreground text-sm font-bold">{t.fullName}</Label>
          <Input
            id="fullname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.fullNamePlaceholder}
            className="py-5 bg-white dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all font-medium text-sm"
            required
          />
        </div>

        {/* Choose Avatar Grid */}
        <div className="space-y-3">
          <Label className="text-foreground text-sm font-bold block">{t.chooseAvatar}</Label>
          <div className="grid grid-cols-6 gap-3">
            {presetAvatars.map((av) => {
              const isSelected = selectedAvatar === av.emoji
              return (
                <button
                  key={av.label}
                  type="button"
                  onClick={() => setSelectedAvatar(av.emoji)}
                  className={`w-full aspect-square rounded-2xl bg-gradient-to-tr ${av.gradient} flex items-center justify-center text-2xl relative shadow-md cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected ? 'ring-4 ring-purple-500 ring-offset-2 dark:ring-offset-[#161618] scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <span>{av.emoji}</span>
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-[#f8f9fa] dark:border-[#161618] shadow">
                      <Check className="w-3 h-3 text-white stroke-[3px]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 2. App Preferences */}
      <div className="bg-[#f8f9fa] dark:bg-[#161618] border border-slate-200/50 dark:border-zinc-900/50 rounded-[2rem] p-6 shadow-sm space-y-6">
        <div className="flex gap-4 items-start pb-2 border-b border-slate-200/40 dark:border-zinc-800/40">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-md font-black tracking-tight text-foreground leading-tight">{t.preferences}</h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-0.5">{t.preferencesDesc}</p>
          </div>
        </div>

        {/* Language Button Group */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-bold flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>{t.langLabel}</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleLangChange('sk')}
              className={`py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all border flex items-center justify-center gap-2 ${
                lang === 'sk'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white shadow-md'
                  : 'bg-white text-foreground border-slate-200 dark:bg-black dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900'
              }`}
            >
              <span>🇸🇰</span>
              <span>Slovenčina</span>
            </button>
            <button
              type="button"
              onClick={() => handleLangChange('en')}
              className={`py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all border flex items-center justify-center gap-2 ${
                lang === 'en'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white shadow-md'
                  : 'bg-white text-foreground border-slate-200 dark:bg-black dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* Default Currency Button Group */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-bold flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-purple-400" />
            <span>{t.currencyLabel}</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCurrency('EUR')}
              className={`py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all border flex items-center justify-center gap-1.5 ${
                currency === 'EUR'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white shadow-md'
                  : 'bg-white text-foreground border-slate-200 dark:bg-black dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900'
              }`}
            >
              <span>EUR (€)</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              disabled={lang === 'sk'} // In Slovak, currency is locked to EUR
              className={`py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all border flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                currency === 'USD'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white shadow-md'
                  : 'bg-white text-foreground border-slate-200 dark:bg-black dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900'
              }`}
            >
              <span>USD ($)</span>
            </button>
          </div>
          {lang === 'sk' && (
            <p className="text-[10px] text-amber-500 font-bold mt-1.5 flex items-center gap-1">
              <span>⚠️</span>
              <span>{t.noteSlovakEUR}</span>
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full py-6 bg-[#670884] hover:bg-[#7d119c] text-white rounded-2xl shadow-lg shadow-purple-500/10 font-bold flex gap-2 items-center justify-center transition-all cursor-pointer text-md"
      >
        {loading ? (
          <span>{t.saving}</span>
        ) : (
          <span>{t.saveChanges}</span>
        )}
      </Button>
    </form>
  )
}
