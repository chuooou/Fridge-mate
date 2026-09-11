import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../features/auth/AuthProvider'
import { getIngredients } from '../features/fridge/api'
import { selectIngredients, countStorage } from '../features/fridge/selectors'
import { IngredientList } from '../features/fridge/IngredientList'
import { expiryInfo, todayLocal } from '../features/ingredient/expiry'
import { ErrorState, LoadingState } from '../shared/ui/AsyncState'
import { Icon } from '../shared/ui/Icon'

type Filter = 'all' | 'fridge' | 'freezer' | 'urgent'
type Sort = 'expiry' | 'recent' | 'name'
export function FridgePage() {
  const { user, runtime } = useAuth()
  const location = useLocation()
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('expiry')
  const [today, setToday] = useState(todayLocal)
  useEffect(() => {
    const refresh = () => setToday(todayLocal())
    const timer = window.setInterval(refresh, 30_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh) }
  }, [])
  const ingredients = useQuery({ queryKey: ['fridge', user!.id], queryFn: ({ signal }) => getIngredients(signal), meta: { epoch: runtime.getEpoch() } })
  const items = ingredients.data ?? []
  const counts = countStorage(items)
  const urgent = selectIngredients(items, 'urgent', 'expiry', today)
  const expired = items.filter((item) => (expiryInfo(item, today).days ?? Infinity) < 0)
  const filtered = selectIngredients(items, filter, sort, today)
  return <div className="page-width fridge-page">
    <div className="page-heading"><div><span className="eyebrow">FRESH THINGS, EVERY DAY</span><h1>내 냉장고<span className="heading-dot">.</span></h1><p className="muted">{user!.nickname}님의 재료, 오늘도 신선하게 챙겨요.</p></div><Link className="button primary" to="/ingredients/new" aria-label="재료 추가"><Icon name="plus" />재료 추가</Link></div>
    {location.state?.notice && <p role="status" className="notice success">{location.state.notice}</p>}
    <section className="summary-grid" aria-label="냉장고 요약"><div className="summary-card summary-total"><div><span>함께하고 있는 재료</span><strong>{items.length}<small>가지</small></strong></div><span className="summary-icon"><Icon name="leaf" size={30} /></span></div><div className="summary-card"><div><span>냉장 보관</span><strong>{counts.fridge}<small>가지</small></strong></div><span className="summary-icon cool"><Icon name="fridge" size={28} /></span></div><div className="summary-card"><div><span>냉동 보관</span><strong>{counts.freezer}<small>가지</small></strong></div><span className="summary-icon ice"><Icon name="snow" size={28} /></span></div></section>
    {ingredients.isPending ? <LoadingState text="냉장고 속 재료를 확인하고 있어요" /> : !ingredients.data && ingredients.isError ? <ErrorState message="재료를 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요." onRetry={() => void ingredients.refetch()} /> : <>
      {ingredients.isError && <p className="notice warning" role="alert">최신 정보를 불러오지 못했어요. 이전 목록을 표시하고 있어요. <button className="text-button" onClick={() => void ingredients.refetch()}>다시 시도</button></p>}
      {expired.length > 0 && <p className="notice warning">기한이 지난 재료가 {expired.length}가지 있어요. 실제 날짜인지 예상 날짜인지 확인하고 상태를 살펴보세요.</p>}
      {urgent.length > 0 && <section className="urgent-section"><div className="urgent-title"><span className="urgent-symbol"><Icon name="clock" size={21} /></span><div><h2>먼저 챙겨주세요 <span>{urgent.length}</span></h2><p>기한이 3일 이내로 남은 재료예요.</p></div></div><div className="urgent-items">{urgent.slice(0, 3).map((item) => { const info = expiryInfo(item, today); return <div key={item.id}><span>{item.name}</span><strong>{info.isEstimated ? '약 ' : ''}{info.days === 0 ? 'D-day' : `D-${info.days}`}</strong></div> })}</div></section>}
      <section className="inventory-section" aria-labelledby="inventory-heading"><div className="inventory-heading"><h2 id="inventory-heading">전체 재료 <span>{items.length}</span></h2><label className="sort-label">정렬<select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="expiry">기한 임박순</option><option value="recent">최근 등록순</option><option value="name">이름순</option></select></label></div>
        <div className="filter-row" role="group" aria-label="재료 필터">{([['all', '전체'], ['fridge', '냉장'], ['freezer', '냉동'], ['urgent', '기한 임박']] as const).map(([value, label]) => <button key={value} className={`filter-chip ${filter === value ? 'selected' : ''}`} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
        {filtered.length ? <IngredientList items={filtered} today={today} /> : <div className="empty-state"><span className="empty-icon"><Icon name="box" size={40} /></span><h3>{items.length ? '조건에 맞는 재료가 없어요' : '냉장고의 첫 재료를 기다리고 있어요'}</h3><p>{items.length ? '다른 필터를 선택해 보세요.' : '위의 재료 추가 버튼으로 신선한 시작을 기록해 보세요.'}</p>{items.length > 0 && <button className="text-button" onClick={() => setFilter('all')}>전체 재료 보기</button>}</div>}
      </section>
      {items.some((item) => item.estimatedExpiry) && <p className="list-footnote"><Icon name="leaf" size={15} /> ‘약’으로 표시된 기한은 예상이에요. 실제 상태와 보관 환경에 따라 달라질 수 있어요.</p>}
    </>}
  </div>
}
