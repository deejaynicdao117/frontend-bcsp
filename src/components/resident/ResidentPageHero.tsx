import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type ResidentPageHeroProps = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  tone?: 'blue' | 'teal' | 'rose' | 'amber' | 'emerald'
  action?: ReactNode
}

const tones = {
  blue: 'from-blue-700 via-indigo-700 to-slate-900',
  teal: 'from-teal-700 via-cyan-800 to-slate-900',
  rose: 'from-rose-700 via-orange-800 to-slate-900',
  amber: 'from-amber-600 via-orange-700 to-slate-900',
  emerald: 'from-emerald-700 via-teal-800 to-slate-900',
}

export default function ResidentPageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  tone = 'blue',
  action,
}: ResidentPageHeroProps) {
  return (
    <section className={`relative isolate overflow-hidden rounded-[1.75rem] bg-linear-to-br ${tones[tone]} px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-8`}>
      <div aria-hidden="true" className="absolute -right-16 -top-28 -z-10 size-80 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-36 right-1/3 -z-10 size-72 rounded-full border-38 border-white/6" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur-sm">
            <Icon size={22} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/65 uppercase">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">{description}</p>
          </div>
        </div>
        {action && <div className="relative shrink-0">{action}</div>}
      </div>
    </section>
  )
}