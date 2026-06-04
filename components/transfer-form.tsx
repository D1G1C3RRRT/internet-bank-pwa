'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction, depositFunds } from '@/app/actions/banking'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

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
}

export function TransferForm({ accountId, accounts }: TransferFormProps) {
  const router = useRouter()
  const [transferType, setTransferType] = useState<'transfer' | 'deposit'>('transfer')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const otherAccounts = accounts.filter((acc) => acc.id !== accountId)

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
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        {transferType === 'transfer' ? 'Transfer Money' : 'Deposit Funds'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transfer Type Selector */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTransferType('transfer')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              transferType === 'transfer'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => setTransferType('deposit')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              transferType === 'deposit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Deposit
          </button>
        </div>

        {/* Recipient Account Selection (Transfer only) */}
        {transferType === 'transfer' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="to-account">Send to</Label>
            <select
              id="to-account"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              required
            >
              <option value="">Select a recipient account</option>
              {otherAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1)} - {acc.accountNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="flex-1"
            />
          </div>
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Rent payment"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">
              {transferType === 'transfer' ? 'Transfer' : 'Deposit'} completed successfully!
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !amount}
          className="w-full"
        >
          {loading ? 'Processing...' : transferType === 'transfer' ? 'Transfer' : 'Deposit'}
        </Button>
      </form>

      {/* Info about multiple accounts */}
      {transferType === 'transfer' && otherAccounts.length === 0 && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-600">
            You need at least 2 accounts to make transfers
          </p>
        </div>
      )}
    </Card>
  )
}
