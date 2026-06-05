'use client'

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Fingerprint, ScanFace, Trash2, ShieldCheck, AlertTriangle, KeyRound } from 'lucide-react'

export function BiometricSetup() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [passkeys, setPasskeys] = useState<any[]>([])
  const [keyName, setKeyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Check if WebAuthn is supported
    if (typeof window !== 'undefined') {
      const checkSupport = async () => {
        const supported = !!window.PublicKeyCredential && 
          await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setIsSupported(supported)
      }
      checkSupport()
      loadPasskeys()
    }
  }, [])

  const loadPasskeys = async () => {
    try {
      const res = await authClient.passkey.listUserPasskeys()
      if (res && res.data) {
        setPasskeys(res.data)
      }
    } catch (err) {
      console.error('Failed to load passkeys:', err)
    }
  }

  const handleAddPasskey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) {
      setError('Zadajte názov pre Váš kľúč')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await authClient.passkey.addPasskey({
        name: keyName.trim()
      })

      if (result.error) {
        throw new Error(result.error.message || 'Nepodarilo sa pridať kľúč')
      }

      setSuccess(`Zariadenie "${keyName}" bolo úspešne pridané!`)
      setKeyName('')
      await loadPasskeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zlyhalo pridanie biometrického kľúča')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePasskey = async (id: string, name: string) => {
    setActionLoading(id)
    setError(null)
    setSuccess(null)

    try {
      const result = await authClient.passkey.deletePasskey({
        id
      })

      if (result.error) {
        throw new Error(result.error.message || 'Nepodarilo sa odstrániť kľúč')
      }

      setSuccess(`Zariadenie "${name}" bolo odstránené.`)
      await loadPasskeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Zlyhalo odstránenie kľúča')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#161618] text-white p-6 rounded-[2rem] border border-zinc-800/40 relative overflow-hidden shadow-xl flex gap-4 items-start">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl flex-shrink-0 border border-purple-500/20">
          <Fingerprint className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className="text-lg font-black tracking-tight text-white leading-tight">
            Biometrické prihlasovanie (Passkeys)
          </h3>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Prihlasujte sa do svojho účtu bezpečne pomocou FaceID, TouchID alebo Windows Hello bez zadávania hesla. Kľúč je bezpečne šifrovaný a uložený priamo vo Vašom zariadení.
          </p>
        </div>
      </div>

      {/* Error & Success States */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400 font-bold leading-tight">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold leading-tight">{success}</p>
        </div>
      )}

      {/* Support validation & Registering Key */}
      {isSupported === false ? (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-black text-amber-800 dark:text-amber-400">Nepodporované zariadenie</h4>
            <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
              Váš prehliadač alebo toto zariadenie nepodporuje funkciu overovania Passkeys/WebAuthn. Uistite sa, že používate moderný prehliadač s povoleným biometrickým hardvérom.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#f8f9fa] dark:bg-[#161618] border border-slate-200/50 dark:border-zinc-900/50 rounded-[2rem] p-6 shadow-sm space-y-6">
          <h4 className="text-md font-black tracking-tight text-foreground flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-purple-500" />
            <span>Zaregistrovať nové zariadenie</span>
          </h4>
          
          <form onSubmit={handleAddPasskey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name" className="text-foreground text-sm font-bold">
                Názov zariadenia / kľúča
              </Label>
              <Input
                id="key-name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="napr. Môj MacBook, Telefón"
                className="py-5 bg-white dark:bg-black border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all font-medium text-sm"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !keyName.trim()}
              className="w-full py-5 bg-[#670884] hover:bg-[#7d119c] text-white rounded-2xl shadow-lg shadow-purple-500/10 font-bold flex gap-2 items-center justify-center transition-all cursor-pointer"
            >
              {loading ? (
                <span>Čakám na potvrdenie...</span>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  <span>Pridať a aktivovať biometriu</span>
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* List of Registered Keys */}
      <div className="bg-[#f8f9fa] dark:bg-[#161618] border border-slate-200/50 dark:border-zinc-900/50 rounded-[2rem] p-6 shadow-sm space-y-4">
        <h4 className="text-md font-black tracking-tight text-foreground flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-purple-500" />
          <span>Aktivované kľúče ({passkeys.length})</span>
        </h4>

        {passkeys.length === 0 ? (
          <p className="text-xs text-muted-foreground font-semibold py-4 text-center">
            Nemáte zaregistrované žiadne biometrické zariadenia pre tento účet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/40">
            {passkeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-foreground border border-slate-200/40 dark:border-zinc-800/40">
                    <Fingerprint className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">
                      {key.name || 'Neznáme zariadenie'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Pridané: {key.createdAt ? new Date(key.createdAt).toLocaleDateString('sk-SK') : 'Neznáme'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={actionLoading === key.id}
                  onClick={() => handleDeletePasskey(key.id, key.name)}
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
