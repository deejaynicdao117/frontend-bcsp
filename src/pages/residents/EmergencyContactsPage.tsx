import { useEffect, useState } from 'react'
import { PhoneCall } from 'lucide-react'
import { Alert, Card } from '../../components/ui'
import { residentCommunityApi } from '../../shared/api'

type Contact = {
  id: number
  name: string
  office: string | null
  phone: string
  availability: string
}

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const fetchContacts = async () => {
      try {
        const result = await residentCommunityApi.getEmergencyContacts<Contact>()
        if (active) setContacts(result.data)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load emergency contacts.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchContacts()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
          <PhoneCall size={14} /> Emergency contacts
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Quick access hotlines</h1>
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Hotline directory" subtitle="Reliable emergency and barangay contacts." action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{contacts.length}</span>}>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading contacts…</p>
        ) : contacts.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No emergency contacts available.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {contacts.map((contact) => (
              <article key={contact.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{contact.name}</p>
                  {contact.office && <p className="mt-1 text-xs text-slate-500">{contact.office}</p>}
                </div>
                <div className="text-right">
                  <a href={`tel:${contact.phone}`} className="block text-sm font-semibold text-blue-700">{contact.phone}</a>
                  <p className="mt-1 text-[11px] text-slate-400">{contact.availability}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
