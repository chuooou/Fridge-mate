import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { ErrorState, LoadingState } from '../../shared/ui/AsyncState'

export function RequireAuth() {
  const auth = useAuth()
  const location = useLocation()
  if (auth.loading || auth.busy) return <LoadingState text="내 냉장고를 준비하고 있어요" />
  if (auth.error) return <ErrorState message="로그인 상태를 확인하지 못했어요." onRetry={auth.retry} />
  if (!auth.user) return <Navigate to="/login" replace state={{ returnTo: location.pathname + location.search, needsLogin: true }} />
  return <Outlet />
}
