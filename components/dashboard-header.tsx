'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Bitcoin, LogOut, Sun, Moon, Home, CreditCard, PiggyBank, TrendingUp, X, QrCode, Settings } from 'lucide-react'
import { LanguageSelector } from '@/components/language-selector'
import { getTranslation, Language } from '@/lib/i18n'

export function DashboardHeader({ user }: { user: { name: string | null; email: string; image?: string | null } }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang] = useState<Language>('sk')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Read language cookie
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)
    if (match && (match[1] === 'en' || match[1] === 'sk')) {
      setLang(match[1] as Language)
    }

    // Read theme preference
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (storedTheme) {
      setTheme(storedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  const t = getTranslation(lang)

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const navItems = [
    {
      label: t.dashboard,
      href: '/dashboard',
      icon: Home,
    },
    {
      label: lang === 'sk' ? 'Karty' : 'Cards',
      href: '/dashboard/cards',
      icon: CreditCard,
    },
    {
      label: lang === 'sk' ? 'Sporenie' : 'Savings',
      href: '/dashboard/savings',
      icon: PiggyBank,
    },
    {
      label: lang === 'sk' ? 'Akcie' : 'Stocks',
      href: '/dashboard/stocks',
      icon: TrendingUp,
    },
    {
      label: 'Crypto',
      href: '/dashboard/crypto',
      icon: Bitcoin,
    },
    {
      label: lang === 'sk' ? 'Nastavenia' : 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  // Get initials for profile avatar
  const initials = (user.name || user.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 border-r border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-black p-6 z-30 justify-between transition-colors duration-300">
        <div className="space-y-8">
          {/* Logo Brand Section */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="bunq logo" className="w-10 h-10 rounded-xl object-contain" />
            <div className="leading-tight">
              <span className="font-extrabold text-lg tracking-tight text-foreground block">
                bunq <span className="text-purple-600 dark:text-purple-400">Web</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                bank of the free
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <span className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-zinc-900 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-zinc-950 hover:text-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Settings & Profile */}
        <div className="space-y-6">
          {/* Quick Settings: Theme & Language */}
          <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-zinc-950 p-2 rounded-2xl border border-slate-100 dark:border-zinc-900">
            <LanguageSelector />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-150 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>

          {/* User Profile Block */}
          <div className="border-t border-slate-150 dark:border-zinc-900 pt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-bold text-foreground text-sm select-none">
                {user.image ? (
                  <span className="text-xl">{user.image}</span>
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="max-w-[120px] leading-tight">
                <p className="text-sm font-bold truncate text-foreground">{user.name || 'Erik Babčan'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-red-500 rounded-xl hover:bg-red-500/5 transition-all"
              title={t.signOut}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header Navigation */}
      <header className="md:hidden flex fixed top-0 left-0 right-0 h-16 items-center justify-between px-4 bg-black border-none z-40 transition-colors duration-300">
        
        {/* Profile Avatar & Dropdown Badge */}
        <div className="flex items-center gap-2">
          {/* Avatar Circle */}
          <button 
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 rounded-full bg-[#111112] border border-zinc-850 flex items-center justify-center text-zinc-400 font-bold text-xs shadow-inner cursor-pointer focus:outline-none"
          >
            {user.image ? (
              <span className="text-lg">{user.image}</span>
            ) : (
              <span>{initials}</span>
            )}
          </button>
          
          {/* Profile Dropdown Badge */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 bg-[#1a1a1c] border border-zinc-800/40 rounded-full px-3.5 py-2 text-xs font-bold text-white cursor-pointer shadow-sm focus:outline-none transition-all hover:bg-zinc-800"
          >
            <span className="truncate max-w-[120px]">{user.name || 'Erik Babčan'}</span>
            <span className="text-zinc-400 text-[10px]">↕</span>
          </button>
        </div>

        {/* Action icons Capsule */}
        <div className="flex items-center gap-2 bg-[#1a1a1c] border border-zinc-800/40 rounded-full p-1.5 shadow-sm">
          {/* Clover / Green icon */}
          <button
            className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-zinc-850 transition-all cursor-pointer"
            aria-label="Clover"
          >
            <span className="text-sm select-none">🍀</span>
          </button>
          
          {/* Subtle Vertical Divider */}
          <div className="w-[1px] h-3.5 bg-zinc-800" />
          
          {/* QR Code Scanner */}
          <button
            className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-zinc-850 transition-all cursor-pointer"
            aria-label="Scanner"
          >
            <QrCode className="w-3.5 h-3.5 text-zinc-300" />
          </button>
        </div>
      </header>

      {/* Collapsible Mobile Navigation Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-80 max-w-sm bg-white dark:bg-black h-full p-6 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-350">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="bunq logo" className="w-8 h-8 rounded-lg object-contain" />
                  <span className="font-extrabold text-md tracking-tight text-foreground">
                    bunq Web
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-950 rounded-xl"
                >
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                      <span className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-100 dark:bg-zinc-900 text-foreground'
                          : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-zinc-950'
                      }`}>
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="space-y-6 border-t border-slate-150 dark:border-zinc-900 pt-6">
              {/* Quick Settings: Theme & Language (inside drawer) */}
              <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-zinc-950 p-2 rounded-2xl border border-slate-100 dark:border-zinc-900">
                <LanguageSelector />
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-150 dark:hover:bg-zinc-900 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-bold text-foreground text-sm select-none">
                  {user.image ? (
                    <span className="text-xl">{user.image}</span>
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{user.name || 'Erik Babčan'}</p>
                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 hover:bg-red-500/5 text-red-500 hover:text-red-600 rounded-2xl py-6"
              >
                <LogOut className="w-5 h-5" />
                {t.signOut}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
