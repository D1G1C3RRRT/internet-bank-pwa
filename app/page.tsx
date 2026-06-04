import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            Internet Bank
          </h1>
          <p className="text-xl text-gray-300">
            Your secure and simple online banking solution
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in" className="flex-1 sm:flex-none">
              <Button size="lg" variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="pt-12 grid md:grid-cols-3 gap-8">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
              <p className="text-gray-400">
                Your accounts are protected with industry-standard encryption
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">Fast</h3>
              <p className="text-gray-400">
                Transfer funds instantly with just a few clicks
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">Simple</h3>
              <p className="text-gray-400">
                Intuitive interface makes managing your money easy
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
