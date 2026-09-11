import { QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '../../shared/api/errors'
import type { User } from './types'

export const meKey = ['auth', 'me'] as const

/** One runtime per mounted app/test. The epoch rejects old mutation completions. */
export function createSessionRuntime() {
  let epoch = 0
  const client = new QueryClient({
    queryCache: new QueryCache({
      onError(error, query) {
        if (error instanceof ApiError && error.status === 401 && query.queryKey[0] !== 'auth'
          && query.meta?.epoch === epoch) expire()
      },
    }),
    defaultOptions: {
      queries: {
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
        staleTime: 30_000,
      },
      mutations: { retry: false },
    },
  })
  function expire() {
    epoch++
    void client.cancelQueries()
    client.setQueryData(meKey, null)
    client.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' })
  }
  return {
    client,
    getEpoch: () => epoch,
    beginTransition: () => { epoch++; return epoch },
    expire,
    async accept(user: User | null) {
      await client.cancelQueries()
      client.clear()
      client.setQueryData(meKey, user)
    },
  }
}

export type SessionRuntime = ReturnType<typeof createSessionRuntime>
