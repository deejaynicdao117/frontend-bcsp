import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-700">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
            <LockKeyhole size={22} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Legal</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
          </div>
        </div>

        <div className="mt-8 space-y-5 text-sm leading-7">
          <p>
            We collect personal information necessary to provide barangay services, such as your name, contact
            details, barangay affiliation, and request records.
          </p>

          <p>
            This information is used to process requests, verify identities, communicate updates, and ensure the
            delivery of barangay services and public information.
          </p>

          <p>
            We do not sell or rent personal data to third parties. Information may be shared only with authorized
            barangay personnel or service providers when necessary to fulfill official functions and maintain the
            security of the system.
          </p>

          <p>
            We use reasonable technical and organizational safeguards to protect personal data from unauthorized
            access, misuse, or disclosure.
          </p>

          <p>
            You are responsible for keeping your login credentials secure and for notifying the barangay if you
            suspect account misuse or unauthorized access.
          </p>

          <p>
            By using this portal, you consent to the collection, use, and retention of your information as needed
            to deliver barangay services and comply with lawful requirements.
          </p>
        </div>
      </div>
    </main>
  )
}
