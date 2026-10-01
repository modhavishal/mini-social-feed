export default function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="mt-4 h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
      <div className="mt-4 h-52 rounded-2xl bg-slate-200 dark:bg-white/10" />
    </div>
  )
}