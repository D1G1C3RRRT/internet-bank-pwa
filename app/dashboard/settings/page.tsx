import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { Language } from '@/lib/i18n'
import { DashboardHeader } from '@/components/dashboard-header'
import { SettingsForm } from '@/components/settings-form'
import { BiometricSetup } from '@/components/biometric-setup'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export const metadata = {
  title: 'Settings - Internet Bank',
  description: 'Manage your settings and biometric configurations',
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const user = session.user
  const lang = ((await cookies()).get('lang')?.value as Language) || 'sk'
  const currency = ((await cookies()).get('currency')?.value as 'EUR' | 'USD') || (lang === 'sk' ? 'EUR' : 'USD')

  return (
    <>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-28 md:pb-8 animate-[fadeInPage_1s_ease-in-out_0.2s_both]">
        <DashboardHeader user={user} />

        <div className="md:pl-64 pt-20 md:pt-8 min-h-screen">
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            <h1 className="text-3xl font-black tracking-tight text-foreground select-none">
              {lang === 'sk' ? 'Nastavenia' : 'Settings'}
            </h1>
            
            {/* 1. Account Preferences, Language, Currency and Avatar Profile form */}
            <SettingsForm 
              user={{ name: user.name, image: user.image }}
              initialLang={lang}
              initialCurrency={currency}
            />
            
            {/* 2. Biometric Setup component */}
            <BiometricSetup />
          </div>
        </div>

        <MobileBottomNav active="home" lang={lang} />
      </div>
    </>
  )
}
