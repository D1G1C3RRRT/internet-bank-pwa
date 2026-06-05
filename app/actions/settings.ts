'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function updateProfile(data: { name?: string; image?: string }) {
  try {
    const userId = await getUserId()
    
    await db.update(user).set({
      ...(data.name ? { name: data.name } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      updatedAt: new Date(),
    }).where(eq(user.id, userId))
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { ok: true }
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    return { ok: false, error: error.message }
  }
}

export async function savePreferences(data: { lang?: 'sk' | 'en'; currency?: 'EUR' | 'USD' }) {
  try {
    const cookieStore = await cookies()
    
    if (data.lang) {
      cookieStore.set('lang', data.lang, { path: '/' })
      // If language is Slovak, automatically default preferred currency to EUR
      if (data.lang === 'sk') {
        cookieStore.set('currency', 'EUR', { path: '/' })
      }
    }
    
    if (data.currency) {
      // If language is set to Slovak, it should force/default to EUR unless explicitly set
      // (though the user can override, we default it to EUR)
      cookieStore.set('currency', data.currency, { path: '/' })
    }
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { ok: true }
  } catch (error: any) {
    console.error('Failed to save preferences:', error)
    return { ok: false, error: error.message }
  }
}
