import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Building2, FileText, LineChart, ShieldCheck } from 'lucide-react'

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>
}

const highlights = [
  { icon: FileText, title: 'Document requests', text: 'Submit and track barangay certificates in real time.' },
  { icon: ShieldCheck, title: 'Verified community', text: 'Resident and household records reviewed by staff.' },
  { icon: LineChart, title: 'Clear reporting', text: 'Live insights on requests, complaints, and response times.' },
]

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onLogin(email, password)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center justify-center px-6 py-14 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-lg bg-blue-600 text-white">
              <Building2 size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Barangay Citizen Services Portal</p>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Hello, Kabarangay!</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in with your account. 
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="field-label">
              Email address
              <input
                className="input mt-1.5"
                type="email"
                autoComplete="username"
                placeholder="you@barangay.gov.ph"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field-label">
              Password
              <input
                className="input mt-1.5"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            {error && (
              <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-2.5">
              {isSubmitting ? 'Signing in…' : 'Sign in to portal'}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-8 flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} />
            Protected access with role-based permissions
          </p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-center xl:px-20">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.6) 1px, transparent 0)', backgroundSize: '28px 28px' }}
          aria-hidden="true"
        />
        <div className="absolute -right-40 -bottom-48 size-[28rem] rounded-full bg-blue-700/25 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold tracking-wider text-blue-300 uppercase">Service. Trust. Community.</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Local service, made simpler.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            One connected place for residents, barangay staff, and administrators to keep community services moving.
          </p>

          <ul className="mt-10 space-y-5 border-t border-white/10 pt-8">
            {highlights.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-blue-200">
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 mt-12 text-xs text-slate-500">Barangay Citizen Services Portal</p>
      </aside>
    </main>
  )
}
