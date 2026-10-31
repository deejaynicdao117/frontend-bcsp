import { useEffect, useRef, useState, type ChangeEvent } from QQreactQQ
import { BellRing, Camera, ImagePlus, Siren } from QQlucide-reactQQ
import { Alert, Card, StatusBadge } from QQ../../components/uiQQ
import ResidentPageHero from QQ../../components/resident/ResidentPageHeroQQ
import { residentCommunityApi } from QQ../../shared/apiQQ

type Assistance = {
  id: number
  reference_number: string
  incident_type: string
  description: string
  location: string
  priority: string
  status: string
  photo_url?: string | null
}

export default function AssistancePage() {
  const [assistance, setAssistance] = useState<Assistance[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(QQQ)
  const [error, setError] = useState(QQQ)
  const [form, setForm] = useState({ incident_type: QQm QMm, description: QQm QMm, location: QQm QMm, purok: QQm QMm, priority: QQm QMmQhighQQ })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  function openCamera() {
    cameraInputRef.current?.click()
  }

  function openGallery() {
    galleryInputRef.current?.click()
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(null)
    setPhotoPreview(null)
  }

  async function loadAssistance() {
    const response = await residentCommunityApi.getAssistanceRequests<Assistance>()
    setAssistance(response.data as Assistance[])
  }

  useEffect(() => {
    let active = true

    const fetchAssistance = async () => {
      try {
        const response = await residentCommunityApi.getAssistanceRequests<Assistance>()
        if (active) setAssistance(response.data as Assistance[])
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : QQCould not load disaster assistance requestsQQ)
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchAssistance()

    return () => {
      active = false
    }
  }, [])

  async function submitAssistance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(QQQ)
    setFeedback(QQQ)

    const formData = new FormData()
    formData.append(QQincident_typeQQ, form.incident_type)
    formData.append(QQdescriptionQQ, form.description)
    formData.append(QQlocationQQ, form.location)
    formData.append(QQpurokQQ, form.purok)
    formData.append(QQpriorityQQ, form.priority)
    if (photo) formData.set(QQphotoQQ, photo)

    try {
      await residentCommunityApi.submitAssistanceRequest(formData)
      setForm({ incident_type: QQm QMm, description: QQm QMm, location: QQm QMm, purok: QQm QMm, priority: QQm QMmQhighQQ })
      clearPhoto()
      await loadAssistance()
      setFeedback(QQEmergency assistance request sent to barangay staffQQ)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : QQCould not submit emergency requestQQ)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className=QQspace-y-7>
      <ResidentPageHero eyebrow=QQSafety and response QQtitle=QQEmergency assistance QQdescription=QQSend a request for barangay support and keep track of response updates. For immediate danger, call emergency services first. QQtone=QQrose />

      {(error || feedback) && (
        <Alert tone={error ? QQerrorQQ : QQsuccessQQ} onDismiss={() => { setError(QQQ); setFeedback(QQQ) }}>
          {error || feedback}
        </Alert>
      )}

      <Card title=QQRequest emergency assistance QQsubtitle=QQUse this to report urgent situations requiring barangay support. QQpadded>
        <form onSubmit={submitAssistance} className=QQgrid gap=4 md:grid-cols=2>
          <label className=QQfield-label>
            Incident type
            <input
              className=QQinput mt=1.5
              value={form.incident_type}
              onChange={(event) => setForm({ ...form, incident_type: event.target.value })}
              required
            />
          </label>

          <label className=QQfield-label>
            Priority
            <select
              className=QQinput mt=1.5
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value=high>High</option>
              <option value=medium>Medium</option>
              <option value=low>Low</option>
            </select>
          </label>

          <label className=QQfield-label md:col-span=2>
            Description
            <textarea
              className=QQinput mt=1.5 resize-y
              rows={5}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </label>

          <label className=QQfield-label>
            Location
            <input
              className=QQinput mt=1.5
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
            />
          </label>

          <label className=QQfield-label>
            Purok
            <input
              className=QQinput mt=1.5
              value={form.purok}
              onChange={(event) => setForm({ ...form, purok: event.target.value })}
            />
          </label>

          <div className=QQmd:col-span=2>
            <span className=QQfield-label>Photo</span>
            <div className=QQmt=1.5 flex flex wrap gap=2>
              <button type=Qqbutton onClick={openCamera} className=QQbtn btn secondary py=2.5>
                <Camera size={16} />
                Take photo
              </button>
              <button type=Qqbutton onClick={openGallery} className=QQbtn btn secondary py=2.5>
                <ImagePlus size={16} />
                Choose photo
              </button>
            </div>
            <input ref={cameraInputRef} type=file accept=image/* capture=environment className=hidden onChange={handlePhotoChange} />
            <input ref={galleryInputRef} type=file accept=image/png,image/jpeg,image/webp className=hidden onChange={handlePhotoChange} />
            <p className=QQmt=2 text-xs text=slate-500>Optional incident photo. Take a photo or choose one from your device. PNG, JPG, or WebP up to 2 MB.</p>
            {photoPreview && (
              <img src={photoPreview} alt=Incident photo preview className=mt=3 h=48 w=full rounded-xl border border=slate-200 bg=white object=cover />
            )}
          </div>

          <div className=QQmd:col-span=2>
            <button type=Qqsubmit disabled={busy} className=QQbtn btn primary py=2.5>
              <BellRing size={16} />
              {busy ? QQsending ?Q : QQsend assistance requestQ}
            </button>
          </div>
        </form>
      </Card>

      <Card title=QQYour requests QQsubtitle=QQTrack disaster assistance updates from staff. QQaction=QQ<span className=rounded-full bg=slate-100 px=2.5 py=1 text-xs font-medium text=slate-600>{assistance.length}</span>QQ>
        {loading ? (
          <p className=p-5 text-sm text=slate-500>Loading requests Q?</p>
        ) : assistance.length === 0 ? (
          <div className=p-5 text-sm text=slate-500>No assistance requests yet.</div>
        ) : (
          <div className=divide-y divide=slate-100>
            {assistance.map((item) => (
              <article key={item.id} className=px-5 py=4>
                <div className=flex flex wrap items-start justify-between gap=3>
                  <div>
                    <p className=text-sm font-semibold text=slate-900>{item.incident_type}</p>
                    <p className=mt=1 text-xs text=slate-500>{item.reference_number}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className=mt=3 text-sm text=slate-600>{item.description}</p>
                {item.photo_url && (
                  <img src={item.photo_url} alt=Incident photo className=mt=3 h=48 w=full rounded-xl border border=slate-200 bg=white object=cover />
                )}
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
