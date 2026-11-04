import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Building2, CircleAlert, CircleCheck, CircleHelp, X } from 'lucide-react'

export function BarangayLogo({
  src,
  alt = '',
  className = '',
  fallbackClassName = '',
  size = 18,
}: {
  src?: string | null
  alt?: string
  className?: string
  fallbackClassName?: string
  size?: number
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null)

  if (!src || failedSource === src) {
    return <Building2 aria-hidden="true" className={fallbackClassName || className} size={size} strokeWidth={1.8} />
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSource(src)} />
}

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

export function Toast({
  tone,
  title,
  children,
  onDismiss,
}: {
  tone: AlertTone
  title: string
  children: ReactNode
  onDismiss: () => void
}) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className="toast-enter fixed top-20 right-4 z-100 flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xl shadow-slate-950/15 ring-1 ring-black/3 sm:right-6"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${tone === 'error' ? 'bg-linear-to-br from-rose-50 to-orange-50 text-rose-600 ring-rose-100' : 'bg-linear-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-emerald-100'}`}>
        <Icon size={19} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[13px] font-semibold tracking-tight text-slate-900">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-slate-600">{children}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  busy = false,
  tone = 'primary',
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
  tone?: 'primary' | 'danger'
}) {
  useEffect(() => {
    if (!open || busy) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [busy, onCancel, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-100 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (!busy && event.target === event.currentTarget) onCancel()
      }}
    >
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-start gap-4 p-6">
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone === 'danger' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
            <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <button type="button" aria-label="Close confirmation" disabled={busy} onClick={onCancel} className="-mr-2 -mt-2 grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" disabled={busy} onClick={onCancel} className="btn btn-secondary justify-center">Cancel</button>
          <button
            type="button"
            autoFocus
            disabled={busy}
            onClick={onConfirm}
            className={`btn justify-center text-white disabled:cursor-wait disabled:opacity-70 ${tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-500/40' : 'btn-primary'}`}
          >
            {busy && <span className="size-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />}
            {confirmLabel}
          </button>
        </div>
      </section>
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
  released: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  ready_for_release: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  ready_for_pickup: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
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
