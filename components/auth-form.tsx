'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { getTranslation, Language } from '@/lib/i18n'
import Image from 'next/image'
import { Fingerprint, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<Language>('sk')
  const [isBiometricSupported, setIsBiometricSupported] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)
    if (match && (match[1] === 'en' || match[1] === 'sk')) {
      setLang(match[1] as Language)
    }
    if (typeof window !== 'undefined') {
      const checkSupport = async () => {
        const supported =
          !!window.PublicKeyCredential &&
          (await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
        setIsBiometricSupported(supported)
      }
      checkSupport()
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && !isSignUp) {
      const checkAutofill = async () => {
        const isConditionalSupported =
          window.PublicKeyCredential &&
          window.PublicKeyCredential.isConditionalMediationAvailable &&
          (await window.PublicKeyCredential.isConditionalMediationAvailable())
        if (isConditionalSupported) {
          authClient.signIn.passkey({ autoFill: true }).catch((err: any) => {
            if (err.name !== 'AbortError') console.error('Autofill listener error:', err)
          })
        }
      }
      checkAutofill()
    }
  }, [isSignUp])

  const t = getTranslation(lang)

  const handlePasskeySignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await authClient.signIn.passkey()
      if (result?.error) throw new Error(result.error.message || 'Nepodarilo sa prihlásiť pomocou biometrie')
      router.replace('/dashboard')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zlyhalo biometrické prihlásenie')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message ?? (lang === 'sk' ? 'Niečo sa pokazilo' : 'Something went wrong'))
      return
    }
    router.replace('/dashboard')

  }

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden select-none">
      {/* Background Image — untouched */}
      <div className="absolute inset-0 z-0">
        <Image src="/welcome-bg.png" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 pointer-events-none" />
      </div>

      {/* ─── LIQUID GLASS PANEL ─── */}
      <div className="auth-glass-panel relative z-10 w-full max-w-[400px]">

        {/* Specular highlight rim */}
        <div className="auth-glass-rim" aria-hidden="true" />

        {/* Inner glow blob */}
        <div className="auth-glass-blob" aria-hidden="true" />

        {/* Logo mark */}
        <div className="auth-logo-wrap">
          <div className="auth-logo-ring">
            <Sparkles className="auth-logo-icon" />
          </div>
        </div>

        {/* Heading */}
        <div className="auth-heading-wrap">
          <h1 className="auth-title">
            {isSignUp ? t.signUpTitle : t.signInTitle}
          </h1>
          <p className="auth-subtitle">
            {isSignUp
              ? (lang === 'sk' ? 'Zaregistrujte sa a začnite' : 'Create your account')
              : (lang === 'sk' ? 'Prihláste sa do svojho účtu' : 'Welcome back')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form-body">

          {isSignUp && (
            <div className={`auth-field-wrap ${focusedField === 'name' ? 'focused' : ''}`}>
              <label htmlFor="name" className="auth-label">{t.fullName}</label>
              <input
                id="name"
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                autoComplete="name"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className={`auth-field-wrap ${focusedField === 'email' ? 'focused' : ''}`}>
            <label htmlFor="email" className="auth-label">{t.email}</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className={`auth-field-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
            <label htmlFor="password" className="auth-label">{t.password}</label>
            <div className="auth-input-row">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input-pw"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span className="auth-error-dot" />
              {error}
            </div>
          )}

          {/* Primary CTA */}
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                <span>{isSignUp ? t.signUp : t.signIn}</span>
                <ArrowRight size={16} className="auth-arrow" />
              </>
            )}
          </button>

          {/* Biometric divider */}
          {!isSignUp && isBiometricSupported && (
            <>
              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">{lang === 'sk' ? 'alebo' : 'or'}</span>
                <span className="auth-divider-line" />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={handlePasskeySignIn}
                className="auth-biometric-btn"
              >
                <Fingerprint size={18} />
                <span>{lang === 'sk' ? 'Prihlásiť sa biometriou' : 'Sign in with Biometrics'}</span>
              </button>
            </>
          )}
        </form>

        {/* Footer link */}
        <p className="auth-footer-text">
          {isSignUp ? `${t.alreadyHaveAccount} ` : `${t.dontHaveAccount} `}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="auth-footer-link"
          >
            {isSignUp ? t.signIn : t.signUp}
          </Link>
        </p>
      </div>

      {/* ─── PANEL STYLES ─── */}
      <style>{`
        /* ── Panel shell ── */
        .auth-glass-panel {
          position: relative;
          padding: 40px 36px 32px;
          border-radius: 28px;
          overflow: hidden;

          /* Core liquid glass */
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.06) 50%,
            rgba(255,255,255,0.12) 100%
          );
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);

          /* Multi-layer border for the glass edge */
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow:
            0 0 0 0.5px rgba(255,255,255,0.10) inset,
            0 32px 80px rgba(0,0,0,0.45),
            0 8px 32px rgba(0,0,0,0.30),
            0 2px 8px rgba(0,0,0,0.20);
        }

        /* Specular highlight — top-left rim */
        .auth-glass-rim {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.70) 30%,
            rgba(255,255,255,0.90) 50%,
            rgba(255,255,255,0.70) 70%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Inner ambient glow blob */
        .auth-glass-blob {
          position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          filter: blur(20px);
        }

        /* ── Logo ── */
        .auth-logo-wrap {
          position: relative;
          z-index: 2;
          margin-bottom: 24px;
        }
        .auth-logo-ring {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(59,130,246,0.4) 100%);
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 4px 16px rgba(139,92,246,0.35);
          backdrop-filter: blur(8px);
        }
        .auth-logo-icon {
          width: 22px;
          height: 22px;
          color: rgba(255,255,255,0.95);
        }

        /* ── Heading ── */
        .auth-heading-wrap {
          position: relative;
          z-index: 2;
          margin-bottom: 28px;
        }
        .auth-title {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: rgba(255,255,255,0.96);
          line-height: 1.2;
          margin: 0 0 6px;
        }
        .auth-subtitle {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.50);
          margin: 0;
          font-weight: 400;
        }

        /* ── Form body ── */
        .auth-form-body {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Field ── */
        .auth-field-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.2s ease;
        }
        .auth-field-wrap.focused {
          transform: translateY(-1px);
        }
        .auth-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }
        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 14px;
          font-size: 0.925rem;
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          outline: none;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) inset;
          backdrop-filter: blur(4px);
          box-sizing: border-box;
        }
        .auth-input::placeholder {
          color: rgba(255,255,255,0.22);
        }
        .auth-input:focus {
          background: rgba(255,255,255,0.12);
          border-color: rgba(139,92,246,0.60);
          box-shadow:
            0 0 0 3px rgba(139,92,246,0.18),
            0 2px 8px rgba(0,0,0,0.15) inset;
        }
        .auth-input-row {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-pw {
          padding-right: 44px;
        }
        .auth-eye-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          transition: color 0.2s;
          padding: 0;
        }
        .auth-eye-btn:hover {
          color: rgba(255,255,255,0.70);
        }

        /* ── Error ── */
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.82rem;
          color: rgba(255,120,120,0.95);
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.20);
        }
        .auth-error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f87171;
          flex-shrink: 0;
        }

        /* ── Submit button ── */
        .auth-submit-btn {
          position: relative;
          width: 100%;
          padding: 14px 20px;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: #fff;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          overflow: hidden;
          transition: all 0.25s ease;
          margin-top: 4px;

          background: linear-gradient(
            135deg,
            rgba(139,92,246,0.85) 0%,
            rgba(109,40,217,0.90) 50%,
            rgba(79,70,229,0.85) 100%
          );
          box-shadow:
            0 1px 0 rgba(255,255,255,0.20) inset,
            0 8px 24px rgba(109,40,217,0.45),
            0 2px 8px rgba(0,0,0,0.25);
          backdrop-filter: blur(8px);
        }
        .auth-submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%);
          border-radius: inherit;
          pointer-events: none;
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.20) inset,
            0 12px 32px rgba(109,40,217,0.55),
            0 4px 12px rgba(0,0,0,0.30);
        }
        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .auth-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-arrow {
          transition: transform 0.2s ease;
        }
        .auth-submit-btn:hover .auth-arrow {
          transform: translateX(3px);
        }

        /* ── Spinner ── */
        .auth-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Divider ── */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.12);
        }
        .auth-divider-text {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }

        /* ── Biometric button ── */
        .auth-biometric-btn {
          width: 100%;
          padding: 13px 20px;
          border-radius: 16px;
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(255,255,255,0.80);
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: all 0.25s ease;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(8px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset;
        }
        .auth-biometric-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.11);
          border-color: rgba(139,92,246,0.40);
          color: rgba(255,255,255,0.95);
          transform: translateY(-1px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.08) inset,
            0 6px 20px rgba(139,92,246,0.20);
        }
        .auth-biometric-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Footer ── */
        .auth-footer-text {
          position: relative;
          z-index: 2;
          margin-top: 22px;
          text-align: center;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
        }
        .auth-footer-link {
          color: rgba(167,139,250,0.90);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-footer-link:hover {
          color: rgba(196,181,253,1);
          text-decoration: underline;
        }
      `}</style>
    </main>
  )
}
