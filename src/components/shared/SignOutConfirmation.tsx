import { useEffect } from 'react'
import { LogOut, X } from 'lucide-react'

type SignOutConfirmationProps = {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function SignOutConfirmation({ open, onCancel, onConfirm }: SignOutConfirmationProps) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-100 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        aria-describedby="sign-out-description"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/25"
      >
        <div className="flex items-start gap-4 px-6 pt-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
            <LogOut size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="sign-out-title" className="text-lg font-semibold tracking-tight text-slate-900">
              Are you sure you want to sign out?
            </h2>
            <p id="sign-out-description" className="mt-1.5 text-sm leading-6 text-slate-500">
              You will be signed out of the Barangay Portal on this device.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close sign-out confirmation"
            onClick={onCancel}
            className="-mr-2 -mt-2 grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <X size={18} />
          </button>
        </div>


        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn btn-secondary justify-center">
            Stay signed in
          </button>
          <button type="button" autoFocus onClick={onConfirm} className="btn justify-center bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40">
            <LogOut size={15} />
            Yes, sign out
          </button>
        </div>
      </section>
    </div>
  )
}