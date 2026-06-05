import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <Link
      href="/sign-in"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden cursor-pointer"
    >
      <Image
        src="/welcome-bg.png"
        alt="Bunq Background"
        fill
        priority
        className="object-cover"
      />
    </Link>
  )
}
