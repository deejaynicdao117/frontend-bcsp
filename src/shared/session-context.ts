import { createContext, useContext } from 'react'
import type { PortalUser, Role } from './types'

export type AuthSession = { token: string; user: PortalUser }

export type SessionValue = {
  session: AuthSession
  onLogout: () => void
}

export const SessionContext = createContext<SessionValue | null>(null)

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside SessionContext.Provider')
  return value
}

export function homePath(role: Role): string {
  if (role === 'admin') return '/admin'
  if (role === 'staff') return '/staff'
  return '/resident'
}
