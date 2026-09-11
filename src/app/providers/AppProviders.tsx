import { useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../features/auth/AuthProvider'
import { createSessionRuntime } from '../../features/auth/session'

export function AppProviders({ children }: { children: ReactNode }) {
  const [runtime] = useState(createSessionRuntime)
  return <QueryClientProvider client={runtime.client}>
    <AuthProvider runtime={runtime}>{children}</AuthProvider>
  </QueryClientProvider>
}
