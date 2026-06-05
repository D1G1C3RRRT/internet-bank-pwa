export default function StocksLoading() {
  return (
    <div className="min-h-screen bg-background px-4 pb-28 pt-24 md:pl-72 md:pr-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-12 w-56 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-52 rounded-[2rem] bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-52 rounded-[2rem] bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
