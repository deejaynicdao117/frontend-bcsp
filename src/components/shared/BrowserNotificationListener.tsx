import { useEffect, useRef, useState } from 'react'
import { BellRing } from 'lucide-react'
import { getPortalAlerts } from '../../shared/api/notifications'
import { useSession } from '../../shared/session-context'

const POLL_INTERVAL_MS = 15_000

export default function BrowserNotificationListener() {
  const { session } = useSession()
  const latestId = useRef<number | undefined>(undefined)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => (
    'Notification' in window && window.isSecureContext ? Notification.permission : 'unsupported'
  ))
  const permissionRef = useRef(permission)

  useEffect(() => {
    permissionRef.current = permission
  }, [permission])

  useEffect(() => {
    let active = true
    let isInitialLoad = true

    const poll = async () => {
      try {
        const result = await getPortalAlerts(latestId.current)
        if (!active) return

        if (isInitialLoad) {
          latestId.current = result.latest_id
          isInitialLoad = false
          return
        }

        for (const alert of result.data) {
          if (permissionRef.current === 'granted') {
            try {
              const notification = new Notification(alert.title, {
                body: alert.message,
                tag: `portal-alert-${alert.id}`,
                data: { type: alert.type },
              })
              notification.onclick = () => {
                window.focus()
                if (alert.type === 'announcement.published') {
                  window.location.assign(session.user.role === 'staff' ? '/staff/announcements' : '/resident/announcements')
                } else if (session.user.role === 'admin') {
                  window.location.assign('/admin/notifications')
                }
              }
            } catch {
              // Browser notification APIs can fail if permission or browser policy changes.
            }
          }
          latestId.current = Math.max(latestId.current ?? 0, alert.id)
        }
      } catch {
        // Keep polling; a temporary API/network failure should not break the portal.
      }
    }

    void poll()
    const timer = window.setInterval(() => { void poll() }, POLL_INTERVAL_MS)

    return () => {
      active = false
      window.clearInterval(timer)
      latestId.current = undefined
    }
  }, [session.user.id, session.user.role])

  async function enableNotifications() {
    if (!('Notification' in window)) return
    try {
      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)
    } catch {
      setPermission(Notification.permission)
    }
  }

  if (permission === 'granted' || (permission === 'unsupported' && !('Notification' in window))) return null

  return (
    <aside className="fixed right-4 bottom-4 z-100 flex max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10" aria-live="polite">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
        <BellRing size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Stay up to date</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {permission === 'denied'
            ? 'Browser alerts are blocked. Allow notifications in your browser site settings.'
            : permission === 'unsupported'
              ? 'Browser alerts require a secure connection. Open this portal over HTTPS or localhost.'
              : 'Enable browser alerts for new announcements and portal updates.'}
        </p>
      </div>
      {permission === 'default' && (
        <button type="button" onClick={() => void enableNotifications()} className="btn btn-primary btn-sm shrink-0">
          Enable
        </button>
      )}
    </aside>
  )
}