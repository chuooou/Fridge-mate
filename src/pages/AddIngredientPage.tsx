import { Link } from 'react-router-dom'
import { IngredientForm } from '../features/ingredient/IngredientForm'
import { Icon } from '../shared/ui/Icon'
export function AddIngredientPage() {
  return <div className="page-width add-page">
    <Link to="/fridge" className="back-link">← 내 냉장고</Link>
    <div className="page-heading"><div><span className="eyebrow">A FRESH ADDITION</span><h1>새로운 재료를 기록해요</h1><p className="muted">작은 기록 하나로, 더 오래 신선하게.</p></div></div>
    <div className="add-layout"><IngredientForm /><aside className="form-aside"><span className="aside-icon"><Icon name="leaf" size={32} /></span><h2>잘 기억하면,<br />덜 버리게 되니까.</h2><p>재료의 이름과 보관 위치만 먼저 기록해 보세요. 정확한 기한을 몰라도 괜찮아요.</p><div className="aside-divider" /><h3>실제 날짜와 예상 날짜</h3><p>포장지에 적힌 날짜는 소비기한이나 유통기한으로, 직접 예상한 날짜는 예상 보관기한으로 구분해요.</p><span className="eyebrow">ONE SMALL HABIT, EVERY DAY.</span></aside></div>
  </div>
}
