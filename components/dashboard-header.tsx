'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Menu, LogOut } from 'lucide-react'

export function DashboardHeader({ user }: { user: { name: string | null; email: string } }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-foreground">
          Internet Bank
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium text-foreground">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-muted rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-4 md:hidden">
            <div className="mb-4">
              <p className="font-medium text-sm">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
