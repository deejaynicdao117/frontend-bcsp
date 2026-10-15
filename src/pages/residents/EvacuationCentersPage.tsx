import { useEffect, useState } from 'react'
import { MapPinned } from 'lucide-react'
import { Alert, Card } from '../../components/ui'
import { residentCommunityApi } from '../../shared/api'

type Center = {
  id: number
  name: string
  address: string
  capacity: number | null
  current_occupancy: number
  status: string
}

export default function EvacuationCentersPage() {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const fetchCenters = async () => {
      try {
        const result = await residentCommunityApi.getEvacuationCenters<Center>()
        if (active) setCenters(result.data)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load evacuation centers.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchCenters()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <MapPinned size={14} /> Evacuation centers
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Shelter readiness map</h1>
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Available centers" subtitle="Shelter information and current readiness." action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{centers.length}</span>}>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading centers…</p>
        ) : centers.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No evacuation centers available.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {centers.map((center) => (
              <article key={center.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{center.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{center.address}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">{center.status}</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Capacity: {center.capacity ?? 0} · Occupied: {center.current_occupancy}
                </p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
