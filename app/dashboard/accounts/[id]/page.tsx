import { redirect } from 'next/navigation'
import { getAccountTransactions, getBankAccounts } from '@/app/actions/banking'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TransactionsList } from '@/components/transactions-list'
import { TransferForm } from '@/components/transfer-form'
import { ChevronLeft, CreditCard } from 'lucide-react'

export const metadata = {
  title: 'Account Details - Internet Bank',
  description: 'View account details and manage transfers',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AccountDetailPage({ params }: PageProps) {
  const { id } = await params

  const accounts = await getBankAccounts()
  const account = accounts.find((acc) => acc.id === id)

  if (!account) {
    redirect('/dashboard')
  }

  const transactions = await getAccountTransactions(id, 20)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Account Header */}
        <div className="mb-8">
          <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-0 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold capitalize">{account.accountType}</h1>
                  <p className="text-gray-300">{account.accountNumber}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                account.isActive
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {account.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div>
              <p className="text-gray-300 mb-2">Current Balance</p>
              <p className="text-5xl font-bold">
                ${typeof account.balance === 'string' 
                  ? parseFloat(account.balance).toFixed(2)
                  : account.balance.toFixed(2)
                }
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transfer Form */}
          <div className="lg:col-span-1">
            <TransferForm accountId={id} accounts={accounts} />
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Account Transactions
            </h2>
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No transactions for this account yet
                </p>
              </Card>
            ) : (
              <TransactionsList transactions={transactions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
