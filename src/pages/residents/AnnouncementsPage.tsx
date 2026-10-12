import { useEffect, useState } from 'react'
import { Bell, CalendarDays } from 'lucide-react'
import { Alert, Card } from '../../components/ui'
import { residentCommunityApi } from '../../shared/api'

type Announcement = {
  id: number
  title: string
  body: string
  type: string
  severity: string
  published_at: string | null
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const fetchAnnouncements = async () => {
      try {
        const result = await residentCommunityApi.getAnnouncements<Announcement>()
        if (active) setAnnouncements(result.data)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load announcements.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchAnnouncements()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Bell size={14} /> Barangay updates
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Announcements</h1>
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Latest community updates" subtitle="Important notices from your barangay." action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{announcements.length}</span>}>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading announcements…</p>
        ) : announcements.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No announcements posted yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {announcements.map((announcement) => (
              <article key={announcement.id} className="px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{announcement.title}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{announcement.type}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">{announcement.severity}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{announcement.body}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                  <CalendarDays size={12} />
                  {announcement.published_at ? new Date(announcement.published_at).toLocaleString() : 'Recently published'}
                </p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
