'use client'

export default function StocksError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-md rounded-[2rem] border border-red-500/30 bg-red-500/5 p-8 text-center">
        <h2 className="text-xl font-black">Stocks could not be loaded</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your bank data was not changed. Please try again.</p>
        <button type="button" onClick={reset} className="mt-6 h-11 rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white">
          Try again
        </button>
      </div>
    </div>
  )
}
