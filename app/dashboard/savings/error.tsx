'use client'

export default function SavingsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 text-center">
        <h2 className="text-xl font-black">Savings are temporarily unavailable</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">No balance was changed. Please retry.</p>
        <button type="button" onClick={reset} className="mt-6 h-11 rounded-2xl bg-red-600 px-6 text-sm font-extrabold text-white">Try again</button>
      </div>
    </div>
  )
}
