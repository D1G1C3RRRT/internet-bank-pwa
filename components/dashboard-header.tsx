import Link from 'next/link'

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-foreground">
          Internet Bank
        </Link>
      </div>
    </header>
  )
}
