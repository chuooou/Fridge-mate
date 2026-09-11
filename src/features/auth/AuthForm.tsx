import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { credentialsSchema } from './schemas'
import type { Credentials } from './types'
import { signup } from './api'
import { useAuth } from './AuthProvider'
import { ApiError, messageOf } from '../../shared/api/errors'
import { Icon } from '../../shared/ui/Icon'

function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string') return '/fridge'
  return /^\/(fridge|ingredients\/new)(\?[^#]*)?$/.test(value) ? value : '/fridge'
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const form = useForm<Credentials>({ resolver: zodResolver(credentialsSchema), defaultValues: { nickname: '', password: '' } })
  const isSignup = mode === 'signup'
  async function submit(input: Credentials) {
    setError('')
    try {
      if (isSignup) {
        await signup(input)
        navigate('/login', { replace: true, state: { registered: true, returnTo: location.state?.returnTo } })
      } else {
        await auth.signIn(input)
        navigate(safeReturnPath(location.state?.returnTo), { replace: true })
      }
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 409) {
        form.setError('nickname', { message: '이미 사용 중인 닉네임이에요.' })
      } else setError(messageOf(failure))
    }
  }
  return <div className="auth-form-wrap">
    <Link to="/" className="brand auth-brand"><span className="brand-mark"><Icon name="fridge" size={24} /></span><span>냉장고를 부탁해<small>FRIDGE MATE</small></span></Link>
    <span className="eyebrow">YOUR FRESH START</span>
    <h1>{isSignup ? '신선한 일상의 시작' : '다시 만나 반가워요'}</h1>
    <p className="muted auth-subtitle">{isSignup ? '나만의 냉장고를 함께 채워볼까요?' : '오늘도 냉장고 속 작은 가능성을 만나보세요.'}</p>
    {location.state?.registered && <p className="notice success" role="status">가입이 완료됐어요. 로그인해 주세요.</p>}
    {location.state?.needsLogin && <p className="notice">계속하려면 로그인해 주세요. 로그인 후 원래 화면으로 돌아가요. 미저장 입력은 복원되지 않아요.</p>}
    <form onSubmit={form.handleSubmit(submit)} noValidate>
      <div className="field"><label htmlFor="nickname">닉네임</label><input id="nickname" autoComplete="username" placeholder="닉네임을 입력해 주세요" {...form.register('nickname')} aria-invalid={!!form.formState.errors.nickname} aria-describedby="nickname-error" /><span id="nickname-error" className="field-error">{form.formState.errors.nickname?.message}</span></div>
      <div className="field"><label htmlFor="password">비밀번호</label><input id="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder="8자 이상 입력해 주세요" {...form.register('password')} aria-invalid={!!form.formState.errors.password} aria-describedby="password-error" /><span id="password-error" className="field-error">{form.formState.errors.password?.message}</span></div>
      {error && <p role="alert" className="notice error">{error}</p>}
      <button className="button primary full" disabled={form.formState.isSubmitting || auth.busy}>{form.formState.isSubmitting ? '잠시만 기다려주세요…' : isSignup ? '회원가입' : '로그인'}<Icon name="arrow" /></button>
    </form>
    <p className="auth-switch">{isSignup ? '이미 함께하고 계신가요?' : '아직 계정이 없으신가요?'} <Link to={isSignup ? '/login' : '/signup'} state={{ returnTo: location.state?.returnTo }}>{isSignup ? '로그인' : '회원가입'}</Link></p>
    {import.meta.env.DEV && !isSignup && <div className="demo-note"><span className="eyebrow">미리 둘러보기</span><p>닉네임 <strong>demo</strong> · 비밀번호 <strong>fridge1234</strong></p><small>개발용 데이터는 새로고침하면 초기화돼요.</small></div>}
  </div>
}
