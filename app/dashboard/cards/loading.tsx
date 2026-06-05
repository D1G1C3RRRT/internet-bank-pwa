export default function CardsLoading() {
  return (
    <div className="min-h-screen bg-background px-4 pb-28 pt-24 md:pl-72 md:pr-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-8">
        <div className="h-10 w-40 rounded-2xl bg-zinc-200 dark:bg-zinc-900" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-56 rounded-[2rem] bg-zinc-200 dark:bg-zinc-900" />
            <div className="h-56 rounded-[2rem] bg-zinc-200 dark:bg-zinc-900" />
          </div>
          <div className="h-96 rounded-[2rem] bg-zinc-200 dark:bg-zinc-900" />
        </div>
      </div>
    </div>
  )
}
