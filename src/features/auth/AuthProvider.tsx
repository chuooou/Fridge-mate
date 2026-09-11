import { createContext, useContext, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as authApi from './api'
import { ApiError } from '../../shared/api/errors'
import { meKey, type SessionRuntime } from './session'
import type { Credentials, User } from './types'

type AuthContextValue = {
  user: User | null | undefined
  loading: boolean
  busy: boolean
  error: Error | null
  retry: () => void
  signIn: (input: Credentials) => Promise<void>
  signOut: () => Promise<void>
  runtime: SessionRuntime
}
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ runtime, children }: { runtime: SessionRuntime; children: ReactNode }) {
  const [busy, setBusy] = useState(false)
  const me = useQuery({
    queryKey: meKey,
    queryFn: async ({ signal }) => {
      try { return await authApi.getMe(signal) }
      catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
  })
  async function transition(action: () => Promise<User | null>) {
    setBusy(true)
    runtime.beginTransition()
    await runtime.client.cancelQueries()
    try { await runtime.accept(await action()) }
    finally { setBusy(false) }
  }
  return <AuthContext.Provider value={{
    user: me.data,
    loading: me.isPending,
    busy,
    error: me.error,
    retry: () => { void me.refetch() },
    signIn: (input) => transition(() => authApi.login(input)),
    signOut: () => transition(async () => { await authApi.logout(); return null }),
    runtime,
  }}>{children}</AuthContext.Provider>
}

// Auth state lives in Query; this hook only exposes its transition operations.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider is required')
  return value
}
