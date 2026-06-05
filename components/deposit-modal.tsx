'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { depositFunds } from '@/app/actions/banking'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { getTranslation, Language } from '@/lib/i18n'

interface BankAccount {
  id: string
  accountNumber: string
  accountType: string
  balance: string | number
  currency: string
  isActive: boolean
}

interface DepositModalProps {
  accounts: BankAccount[]
}

export function DepositModal({ accounts }: DepositModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [lang, setLang] = useState<Language>('sk')

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)
    if (match && (match[1] === 'en' || match[1] === 'sk')) {
      setLang(match[1] as Language)
    }
  }, [isOpen])

  const t = getTranslation(lang)

  // Initialize selected account with the first account if available
  const openModal = () => {
    if (accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setAmount('')
    setDescription('')
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccountId) {
      setError('Please select an account')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await depositFunds(selectedAccountId, amount, description || 'Central Dashboard Deposit')
      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        closeModal()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit funds')
    } finally {
      setLoading(false)
    }
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)
  const currencySymbol = selectedAccount?.currency === 'EUR' ? '€' : '$'

  return (
    <>
      <button
        onClick={openModal}
        disabled={accounts.length === 0}
        className="flex-1 flex items-center justify-center gap-2 bg-[#670884] hover:bg-[#7d119c] text-white disabled:opacity-50 rounded-full py-3.5 px-4 text-xs font-extrabold border-0 transition-all active:translate-y-0.5 cursor-pointer shadow-md shadow-purple-950/20"
      >
        <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-extrabold select-none">
          +
        </span>
        {t.addMoney}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-150 dark:border-zinc-900 text-foreground p-6 rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all scale-100 duration-300 animate-in fade-in zoom-in-95">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {t.addMoneyTitle}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 relative">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-emerald-500 dark:text-emerald-400">{t.depositSuccess}</h4>
                <p className="text-sm text-muted-foreground">
                  {currencySymbol}{parseFloat(amount).toFixed(2)} {t.depositSuccessDesc}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative">
                {/* Account Selector */}
                <div className="space-y-2">
                  <Label htmlFor="account-select" className="text-foreground text-sm font-bold">
                    {t.selectDestination}
                  </Label>
                  <select
                    id="account-select"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-semibold text-sm"
                    required
                  >
                    {accounts.map((acc) => {
                      const displayType = acc.accountType === 'checking'
                        ? t.checkingAccount
                        : acc.accountType === 'savings'
                          ? t.savingsAccount
                          : acc.accountType
                      return (
                        <option key={acc.id} value={acc.id} className="bg-white dark:bg-black">
                          {displayType} ({acc.accountNumber}) — {acc.currency === 'EUR' ? '€' : '$'}{parseFloat(acc.balance as string).toFixed(2)}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground text-sm font-bold">
                    {t.amount}
                  </Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-muted-foreground font-extrabold text-lg">{currencySymbol}</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-9 py-6 bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-black text-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground text-sm font-bold">
                    {t.descriptionOpt}
                  </Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={lang === 'sk' ? 'napr. Osobný vklad' : 'e.g. Personal deposit'}
                    className="py-6 bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-medium text-sm focus:outline-none"
                  />
                </div>

                {/* Error Box */}
                {error && (
                  <div className="flex gap-3 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1 py-6 border-slate-200 dark:border-zinc-850 text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-foreground rounded-2xl font-bold"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !amount}
                    className="flex-1 py-6 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-500/10 font-bold"
                  >
                    {loading ? t.processing : t.deposit}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
