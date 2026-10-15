import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Building2, MailCheck, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  registerResident,
  resendRegistrationCode,
  verifyRegistrationCode,
} from '../shared/api'
import type { AuthSession } from '../shared/session-context'

export type RegisterPageProps = {
  onVerified: (session: AuthSession) => void
}

export default function RegisterPage({ onVerified }: RegisterPageProps) {
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [sex, setSex] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [code, setCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [step, setStep] = useState<'details' | 'verify'>('details')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)

    try {
      const result = await registerResident({
        last_name: lastName.trim(),
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        sex: sex as 'female' | 'male' | 'prefer_not_to_say',
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      setVerificationEmail(result.email)
      setStep('verify')
      setMessage(result.message)
    } catch (registrationError) {
      setError(registrationError instanceof Error
        ? registrationError.message
        : 'Unable to create your resident account.')
    } finally {
      setBusy(false)
    }
  }

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      const result = await verifyRegistrationCode({
        email: verificationEmail,
        code: code.trim(),
      })
      onVerified({ token: result.token, user: result.user })
    } catch (verificationError) {
      setError(verificationError instanceof Error
        ? verificationError.message
        : 'Unable to verify your email address.')
    } finally {
      setBusy(false)
    }
  }

  async function resendCode() {
    setError('')
    setMessage('')
    setBusy(true)

    try {
      const result = await resendRegistrationCode(verificationEmail)
      setMessage(result.message)
    } catch (resendError) {
      setError(resendError instanceof Error
        ? resendError.message
        : 'Unable to send a new verification code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-lg bg-blue-600 text-white">
              <Building2 size={20} strokeWidth={2} />
            </span>
            <p className="text-sm font-semibold text-slate-900">Barangay Citizen Services Portal</p>
          </div>

          <div className="mt-10">
            {step === 'details' ? (
              <>
                <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Resident registration</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign up as a resident. Admin and staff accounts are created by an administrator.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">One more step</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Verify your email</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the six-digit code sent to <strong className="font-medium text-slate-700">{verificationEmail}</strong>.
                </p>
              </>
            )}
          </div>

          {(error || message) && (
            <div
              role={error ? 'alert' : 'status'}
              className={`mt-5 rounded-lg border px-3.5 py-2.5 text-sm ${error
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
            >
              {error || message}
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={submitRegistration} className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-label">
                  First name
                  <input
                    className="input mt-1.5"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    maxLength={100}
                    required
                  />
                </label>

                <label className="field-label">
                  Last name
                  <input
                    className="input mt-1.5"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    maxLength={100}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field-label">
                  Middle name <span className="font-normal text-slate-400">(optional)</span>
                  <input
                    className="input mt-1.5"
                    autoComplete="additional-name"
                    value={middleName}
                    onChange={(event) => setMiddleName(event.target.value)}
                    maxLength={100}
                  />
                </label>

                <label className="field-label">
                  Sex
                  <select
                    className="input mt-1.5"
                    value={sex}
                    onChange={(event) => setSex(event.target.value)}
                    required
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <label className="field-label">
                Email address
                <input
                  className="input mt-1.5"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={255}
                  required
                />
              </label>

              <label className="field-label">
                Password
                <input
                  className="input mt-1.5"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </label>

              <label className="field-label">
                Confirm password
                <input
                  className="input mt-1.5"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  minLength={8}
                  required
                />
              </label>

              <button type="submit" disabled={busy} className="btn btn-primary w-full py-2.5">
                {busy ? 'Sending verification code…' : 'Create resident account'}
                {!busy && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <form onSubmit={submitVerification} className="mt-7 space-y-4">
              <label className="field-label">
                Six-digit verification code
                <input
                  className="input mt-1.5 text-center text-xl tracking-[0.4em]"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                />
              </label>

              <button type="submit" disabled={busy || code.length !== 6} className="btn btn-primary w-full py-2.5">
                {busy ? 'Verifying…' : 'Verify email and continue'}
                {!busy && <MailCheck size={16} />}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setStep('details')
                    setCode('')
                    setError('')
                    setMessage('')
                  }}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft size={14} />
                  Edit details
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void resendCode()}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">Sign in</Link>
          </p>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} />
            Verification codes expire after 10 minutes
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
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">A simpler way to connect with your barangay.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Create a resident account to request documents, share concerns, and receive community updates.
          </p>
        </div>
      </aside>
    </main>
  )
}
