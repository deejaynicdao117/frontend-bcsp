import { useEffect, useState } from 'react'
import { BadgeCheck, Save } from 'lucide-react'
import { Alert, Card } from '../../components/ui'
import ResidentPageHero from '../../components/resident/ResidentPageHero'
import { residentCommunityApi } from '../../shared/api'

type ProfileData = {
  user: {
    id: number
    name: string
    email: string
    role: string
    email_verified_at?: string | null
  }
  profile: Record<string, string | null> | null
  households: Array<{
    household_code: string
    address: string
    purok: string
    verification_status: string
  }>
}

const profileFields = [
  ['last_name', 'Last name'],
  ['first_name', 'First name'],
  ['middle_name', 'Middle name'],
  ['phone', 'Phone number'],
  ['birth_date', 'Birth date'],
  ['sex', 'Sex'],
  ['civil_status', 'Civil status'],
  ['occupation', 'Occupation'],
  ['address', 'Home address'],
  ['purok', 'Purok'],
] as const

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  async function loadProfile() {
    const response = await residentCommunityApi.getProfile<ProfileData>()
    setProfile(response.data)
  }

  useEffect(() => {
    let active = true

    const fetchProfile = async () => {
      try {
        const response = await residentCommunityApi.getProfile<ProfileData>()
        if (active) setProfile(response.data)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchProfile()

    return () => {
      active = false
    }
  }, [])

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setFeedback('')

    const form = new FormData(event.currentTarget)

    try {
      await residentCommunityApi.updateProfile({
        last_name: String(form.get('last_name') ?? ''),
        first_name: String(form.get('first_name') ?? ''),
        middle_name: String(form.get('middle_name') ?? ''),
        phone: String(form.get('phone') ?? ''),
        birth_date: String(form.get('birth_date') ?? '') || null,
        sex: String(form.get('sex') ?? ''),
        civil_status: String(form.get('civil_status') ?? ''),
        occupation: String(form.get('occupation') ?? ''),
        address: String(form.get('address') ?? ''),
        purok: String(form.get('purok') ?? ''),
      })
      await loadProfile()
      setFeedback('Profile and household details saved for staff verification.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-7">
      <ResidentPageHero
        eyebrow="Resident profile"
        title="Your household details"
        description="Keep your information current so the barangay team can verify your household and serve you better."
        icon={BadgeCheck}
        action={(
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white capitalize backdrop-blur-sm">
            {profile?.profile?.verification_status ?? 'unverified'}
          </span>
        )}
      />

      {(error || feedback) && (
        <Alert tone={error ? 'error' : 'success'} onDismiss={() => { setError(''); setFeedback('') }}>
          {error || feedback}
        </Alert>
      )}

      {loading ? (
        <Card title="Loading profile…" subtitle="Checking your resident details.">
          <p className="text-sm text-slate-500">Loading resident profile…</p>
        </Card>
      ) : (
        <Card title="Personal profile" subtitle="Keep your details accurate for staff review and service delivery." padded>
          <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
            {profileFields.map(([key, label]) => (
              <label key={key} className="field-label">
                {label}
                {key === 'sex' ? (
                  <select
                    name={key}
                    defaultValue={profile?.profile?.[key] ?? ''}
                    className="input mt-1.5"
                  >
                    <option value="">Select an option</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                ) : (
                  <input
                    name={key}
                    type={key === 'birth_date' ? 'date' : 'text'}
                    defaultValue={profile?.profile?.[key] ?? ''}
                    className="input mt-1.5"
                  />
                )}
              </label>
            ))}

            <div className="md:col-span-2">
              <button type="submit" disabled={busy} className="btn btn-primary w-full py-2.5 sm:w-auto">
                <Save size={16} />
                {busy ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
