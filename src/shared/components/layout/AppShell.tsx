import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useThemeStore } from '../../store/theme'

type Props = { children: ReactNode; aside?: ReactNode }

export default function AppShell({ children, aside }: Props) {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-[#0b0d17] dark:text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-160 -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-500/30 to-fuchsia-500/30 blur-3xl"
      />

      <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0d17]/70">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
              P
            </div>
            <span className="text-lg font-semibold tracking-tight">Pulse</span>
          </div>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:scale-105 dark:border-white/10 dark:bg-white/10"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">{children}</div>
        <aside className="hidden lg:block">
          <div className="sticky top-24">{aside}</div>
        </aside>
      </main>
    </div>
  )
}