import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getBankAccounts, getTransactions } from '@/app/actions/banking'
import { DashboardHeader } from '@/components/dashboard-header'
import { AccountCard } from '@/components/account-card'
import { TransactionsList } from '@/components/transactions-list'
import { NewAccountButton } from '@/components/new-account-button'

export const metadata = {
  title: 'Dashboard - Internet Bank',
  description: 'Manage your bank accounts and transactions',
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const accounts = await getBankAccounts()
  const recentTransactions = await getTransactions(10)
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance as string),
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Total Balance Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Total Balance
          </h2>
          <p className="text-4xl font-bold text-foreground">
            ${totalBalance.toFixed(2)}
          </p>
        </div>

        {/* Accounts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              Your Accounts
            </h2>
            <NewAccountButton />
          </div>
          {accounts.length === 0 ? (
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any accounts yet
              </p>
              <NewAccountButton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Recent Transactions
          </h2>
          {recentTransactions.length === 0 ? (
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                No transactions yet
              </p>
            </div>
          ) : (
            <TransactionsList transactions={recentTransactions} />
          )}
        </div>
      </div>
    </div>
  )
}
