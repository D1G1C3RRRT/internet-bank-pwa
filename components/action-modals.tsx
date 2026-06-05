'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { getTranslation, Language } from '@/lib/i18n'

interface BankAccount {
  id: string
  accountNumber: string
  accountType: string
  balance: string | number
  currency: string
  isActive: boolean
}

interface ActionModalProps {
  accounts: BankAccount[]
}

export function PayModal({ accounts }: ActionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [lang, setLang] = useState<Language>('sk')

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)
    if (match && (match[1] === 'en' || match[1] === 'sk')) {
      setLang(match[1] as Language)
    }
  }, [isOpen])

  const t = getTranslation(lang)

  const openModal = () => {
    if (accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setAmount('')
    setRecipient('')
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)
  const currencySymbol = selectedAccount?.currency === 'EUR' ? '€' : '$'

  return (
    <>
      <button 
        onClick={openModal}
        className="flex-1 flex items-center justify-center gap-2 bg-[#823d0d] hover:bg-[#96471f] text-white border-0 rounded-full py-3.5 px-4 text-xs font-extrabold transition-all active:translate-y-0.5 cursor-pointer shadow-md shadow-orange-950/20"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-extrabold select-none">
          ↑
        </span>
        {lang === 'sk' ? 'Zaplatiť' : 'Pay'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-150 dark:border-zinc-900 text-foreground p-6 rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all scale-100 duration-300 animate-in fade-in zoom-in-95">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-[var(--color-bunq-accent-orange)] opacity-10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {lang === 'sk' ? 'Zaplatiť' : 'Pay'}
              </h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5 relative">
              <div className="space-y-2">
                <Label htmlFor="pay-account" className="text-foreground text-sm font-bold">
                  {lang === 'sk' ? 'Z účtu' : 'From account'}
                </Label>
                <select
                  id="pay-account"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#823d0d]/40 transition-all font-semibold text-sm"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-white dark:bg-black">
                      {acc.accountType === 'checking' ? t.checkingAccount : t.savingsAccount} ({acc.accountNumber}) — {acc.currency === 'EUR' ? '€' : '$'}{parseFloat(acc.balance as string).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay-amount" className="text-foreground text-sm font-bold">
                  {t.amount}
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground font-extrabold text-lg">{currencySymbol}</span>
                  <Input
                    id="pay-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-9 py-6 bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-[#823d0d]/40 focus:border-[#823d0d] transition-all font-black text-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pay-recipient" className="text-foreground text-sm font-bold">
                  {lang === 'sk' ? 'Príjemca' : 'Recipient'}
                </Label>
                <Input
                  id="pay-recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={lang === 'sk' ? 'Meno alebo IBAN' : 'Name or IBAN'}
                  className="py-6 bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-[#823d0d]/40 focus:border-[#823d0d] transition-all font-medium text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 py-6 border-slate-200 dark:border-zinc-850 text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-2xl font-bold">
                  {t.cancel}
                </Button>
                <Button type="button" onClick={closeModal} className="flex-1 py-6 bg-[#823d0d] hover:bg-[#96471f] text-white rounded-2xl shadow-lg font-bold">
                  {lang === 'sk' ? 'Pokračovať' : 'Continue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export function RequestModal({ accounts }: ActionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('')
  const [lang, setLang] = useState<Language>('sk')

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)
    if (match && (match[1] === 'en' || match[1] === 'sk')) {
      setLang(match[1] as Language)
    }
  }, [isOpen])

  const t = getTranslation(lang)

  const openModal = () => {
    if (accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setAmount('')
    setPayer('')
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)
  const currencySymbol = selectedAccount?.currency === 'EUR' ? '€' : '$'

  return (
    <>
      <button 
        onClick={openModal}
        className="flex-1 flex items-center justify-center gap-2 bg-[#0c59a4] hover:bg-[#126abf] text-white border-0 rounded-full py-3.5 px-4 text-xs font-extrabold transition-all active:translate-y-0.5 cursor-pointer shadow-md shadow-blue-950/20"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-extrabold select-none">
          ↓
        </span>
        {lang === 'sk' ? 'Žiadosť' : 'Request'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-150 dark:border-zinc-900 text-foreground p-6 rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all scale-100 duration-300 animate-in fade-in zoom-in-95">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-[#0c59a4] opacity-10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {lang === 'sk' ? 'Vytvoriť žiadosť' : 'Create request'}
              </h3>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5 relative">
              <div className="space-y-2">
                <Label htmlFor="req-account" className="text-foreground text-sm font-bold">
                  {lang === 'sk' ? 'Na účet' : 'To account'}
                </Label>
                <select
                  id="req-account"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#0c59a4]/40 transition-all font-semibold text-sm"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-white dark:bg-black">
                      {acc.accountType === 'checking' ? t.checkingAccount : t.savingsAccount} ({acc.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-amount" className="text-foreground text-sm font-bold">
                  {t.amount}
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground font-extrabold text-lg">{currencySymbol}</span>
                  <Input
                    id="req-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-9 py-6 bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-[#0c59a4]/40 focus:border-[#0c59a4] transition-all font-black text-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-payer" className="text-foreground text-sm font-bold">
                  {lang === 'sk' ? 'Od koho' : 'From whom'}
                </Label>
                <Input
                  id="req-payer"
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  placeholder={lang === 'sk' ? 'Meno' : 'Name'}
                  className="py-6 bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-[#0c59a4]/40 focus:border-[#0c59a4] transition-all font-medium text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 py-6 border-slate-200 dark:border-zinc-850 text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-2xl font-bold">
                  {t.cancel}
                </Button>
                <Button type="button" onClick={closeModal} className="flex-1 py-6 bg-[#0c59a4] hover:bg-[#126abf] text-white rounded-2xl shadow-lg font-bold">
                  {lang === 'sk' ? 'Zdieľať žiadosť' : 'Share request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
