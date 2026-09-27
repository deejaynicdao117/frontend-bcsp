import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: number
  note: string
  icon: LucideIcon
  accent: 'blue' | 'amber' | 'emerald' | 'violet'
}

const accents = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
}

export default function StatCard({ label, value, note, icon: Icon, accent }: StatCardProps) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value.toLocaleString()}</p>
          <p className="mt-1.5 truncate text-xs text-slate-400">{note}</p>
        </div>
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${accents[accent]}`}>
          <Icon size={18} strokeWidth={1.9} />
        </span>
      </div>
    </article>
  )
}
