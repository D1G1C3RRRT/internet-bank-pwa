'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction, depositFunds } from '@/app/actions/banking'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { getTranslation, Language } from '@/lib/i18n'

interface BankAccount {
  id: string
  accountNumber: string
  accountType: string
  balance: string | number
  currency: string
  isActive: boolean
}

interface TransferFormProps {
  accountId: string
  accounts: BankAccount[]
  lang?: Language
}

export function TransferForm({ accountId, accounts, lang = 'en' }: TransferFormProps) {
  const t = getTranslation(lang)
  const router = useRouter()
  const [transferType, setTransferType] = useState<'transfer' | 'deposit'>('transfer')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const otherAccounts = accounts.filter((acc) => acc.id !== accountId)
  const currentAccount = accounts.find((acc) => acc.id === accountId)
  const currencySymbol = currentAccount?.currency === 'EUR' ? '€' : '$'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      if (transferType === 'transfer') {
        if (!toAccountId) {
          setError('Please select a recipient account')
          setLoading(false)
          return
        }
        await createTransaction(
          accountId,
          toAccountId,
          amount,
          'transfer',
          description
        )
      } else {
        await depositFunds(accountId, amount, description)
      }

      setSuccess(true)
      setAmount('')
      setDescription('')
      setToAccountId('')
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-900/80 shadow-sm relative overflow-hidden">
      <h3 className="text-lg font-black tracking-tight text-foreground mb-6">
        {transferType === 'transfer' ? t.transferMoney : t.depositFunds}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transfer Type Selector */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-900/80 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setTransferType('transfer')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs transition duration-200 ${
              transferType === 'transfer'
                ? 'bg-white dark:bg-zinc-950 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.transfer}
          </button>
          <button
            type="button"
            onClick={() => setTransferType('deposit')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs transition duration-200 ${
              transferType === 'deposit'
                ? 'bg-white dark:bg-zinc-950 text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.deposit}
          </button>
        </div>

        {/* Recipient Account Selection (Transfer only) */}
        {transferType === 'transfer' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="to-account" className="text-foreground text-xs font-bold">{t.sendTo}</Label>
            <select
              id="to-account"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-3 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-semibold text-sm"
              required
            >
              <option value="" className="bg-white dark:bg-black">{t.selectRecipient}</option>
              {otherAccounts.map((acc) => {
                const displayType = acc.accountType === 'checking'
                  ? t.checkingAccount
                  : acc.accountType === 'savings'
                    ? t.savingsAccount
                    : acc.accountType
                return (
                  <option key={acc.id} value={acc.id} className="bg-white dark:bg-black">
                    {displayType} - {acc.accountNumber} ({acc.currency === 'EUR' ? '€' : '$'}{parseFloat(acc.balance as string).toFixed(2)})
                  </option>
                )
              })}
            </select>
          </div>
        )}

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount" className="text-foreground text-xs font-bold">{t.amount}</Label>
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
              required
              className="pl-9 py-6 bg-white dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-primary/40 transition-all font-black text-lg focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description" className="text-foreground text-xs font-bold">{t.descriptionOpt}</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={lang === 'sk' ? 'napr. Platba za nájom' : 'e.g., Rent payment'}
            className="py-6 bg-white dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:ring-primary/40 transition-all font-medium text-sm focus:outline-none w-full"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {transferType === 'transfer' ? t.transferSuccess : t.depositSuccessMessage}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !amount}
          className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-lg transition-all duration-200 border-0"
        >
          {loading ? t.processing : transferType === 'transfer' ? t.transfer : t.deposit}
        </Button>
      </form>

      {/* Info about multiple accounts */}
      {transferType === 'transfer' && otherAccounts.length === 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
            {t.needMultipleAccounts}
          </p>
        </div>
      )}
    </div>
  )
}
