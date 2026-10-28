import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-700">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-100 text-blue-700">
            <ShieldCheck size={22} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Legal</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Terms and Conditions</h1>
          </div>
        </div>

        <div className="mt-8 space-y-5 text-sm leading-7">
          <p>
            By using the Barangay Citizen Services Portal, you agree to use the platform for lawful,
            authorized, and community-related purposes only.
          </p>

          <p>
            Residents may submit service requests, complaints, and document applications through the portal.
            Barangay staff and administrators may review and process submitted requests in accordance with
            existing local procedures, government regulations, and internal policies.
          </p>

          <p>
            Users are responsible for providing accurate information, maintaining the confidentiality of their
            account credentials, and ensuring that submitted documents, complaints, or requests are truthful
            and respectful.
          </p>

          <p>
            The barangay may update, suspend, or restrict access to the portal when necessary to protect the
            integrity of services, data security, or community operations. The portal is provided on an “as is”
            basis for informational and processing purposes.
          </p>

          <p>
            We reserve the right to reject or remove any content or request that violates applicable laws,
            public policies, or platform standards.
          </p>

          <p>
            This portal may be updated or modified at any time without prior notice. Continued use of the portal
            after changes are published indicates acceptance of the updated terms.
          </p>
        </div>
      </div>
    </main>
  )
}
