import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CircleHelp, X } from 'lucide-react'

/* ---------------------------------- Layout --------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{eyebrow}</p>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function Card({
  title,
  subtitle,
  action,
  children,
  padded = false,
  className = '',
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  padded?: boolean
  className?: string
}) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="card-header">
          <div>
            <h2 className="card-title">{title}</h2>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

/* --------------------------------- Feedback -------------------------------- */

type AlertTone = 'error' | 'success'

const alertTones: Record<AlertTone, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export function Alert({
  tone,
  children,
  onDismiss,
}: {
  tone: AlertTone
  children: ReactNode
  onDismiss?: () => void
}) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${alertTones[tone]}`}>
      <span>{children}</span>
      {onDismiss && (
        <button type="button" aria-label="Dismiss message" onClick={onDismiss} className="mt-0.5 shrink-0 opacity-60 transition hover:opacity-100">
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <span className="mx-auto grid size-10 place-items-center rounded-full bg-slate-100 text-slate-400">
        <CircleHelp size={19} />
      </span>
      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="grid min-h-64 place-items-center">
      <div className="flex items-center gap-2.5 text-sm text-slate-500">
        <span className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        {label}
      </div>
    </div>
  )
}

/* ---------------------------------- Badges --------------------------------- */

const statusTones: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  ready_for_release: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200/80',
  closed: 'bg-rose-50 text-rose-700 ring-rose-200/80',
  under_review: 'bg-blue-50 text-blue-700 ring-blue-200/80',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-200/80',
  acknowledged: 'bg-blue-50 text-blue-700 ring-blue-200/80',
  dispatched: 'bg-violet-50 text-violet-700 ring-violet-200/80',
}

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTones[status] ?? 'bg-amber-50 text-amber-700 ring-amber-200/80'
  return <span className={`badge ${tone} capitalize`}>{status.replaceAll('_', ' ')}</span>
}

/* ---------------------------------- Misc ----------------------------------- */

export function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <article className="card flex items-center gap-4 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
        <Icon size={19} strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">{value.toLocaleString()}</p>
      </div>
    </article>
  )
}
