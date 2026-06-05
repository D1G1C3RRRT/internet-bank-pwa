import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'
import '@/lib/auth-env'
import { passkey } from '@better-auth/passkey'

const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL)

function getOrigin(url: string | undefined) {
  if (!url) return null

  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

const trustedOrigins = Array.from(
  new Set(
    [
      baseURL,
      process.env.V0_RUNTIME_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined,
      'http://localhost:4444',
    ]
      .map(getOrigin)
      .filter((origin): origin is string => Boolean(origin))
  )
)

export const auth = betterAuth({
  database: pool,
  baseURL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [passkey()],
  trustedOrigins,
  trustHost: true,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // On localhost HTTP, cookies with secure:true are rejected by browsers.
          // Use sameSite:'lax' + secure:false for local development.
          defaultCookieAttributes: {
            sameSite: 'lax' as const,
            secure: false,
          },
        },
      }
    : {}),
})
