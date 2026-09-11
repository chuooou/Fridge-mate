import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider'
import { messageOf } from '../../shared/api/errors'
import { Icon } from '../../shared/ui/Icon'

export function AppLayout() {
  const { user, signOut, busy } = useAuth()
  const [error, setError] = useState('')
  return <div className="app-shell">
    <header className="app-header"><div className="header-inner">
      <Link className="brand" to="/fridge"><span className="brand-mark"><Icon name="fridge" size={23} /></span><span>냉장고를 부탁해<small>FRIDGE MATE</small></span></Link>
      <nav aria-label="주 메뉴"><NavLink to="/fridge" className="nav-link"><Icon name="fridge" size={18} />내 냉장고</NavLink><NavLink to="/ingredients/new" className="nav-link"><Icon name="plus" size={18} />직접 등록</NavLink></nav>
      <div className="profile"><span className="avatar">{user?.nickname.slice(0, 1)}</span><span className="profile-name">{user?.nickname}님</span><button className="icon-button" aria-label="로그아웃" disabled={busy} onClick={async () => { try { await signOut() } catch (e) { setError(messageOf(e)) } }}><Icon name="logout" /></button></div>
    </div></header>
    {error && <div role="alert" className="notice error page-width">{error}</div>}
    <main className="main-content"><Outlet /></main>
    <footer className="app-footer"><span><Icon name="leaf" size={16} /> 작은 기록, 더 신선한 일상.</span><span>FRIDGE MATE</span></footer>
  </div>
}
