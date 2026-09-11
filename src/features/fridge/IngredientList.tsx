import type { Ingredient } from '../ingredient/types'
import { expiryInfo } from '../ingredient/expiry'
import { Icon } from '../../shared/ui/Icon'

const emoji: Record<string, string> = { onion: '🧅', carrot: '🥕', milk: '🥛', egg: '🥚', apple: '🍎', tofu: '◻️', spinach: '🥬', chicken: '🍗' }
export function IngredientList({ items, today }: { items: Ingredient[]; today: string }) {
  return <div className="ingredient-grid">{items.map((item) => {
    const info = expiryInfo(item, today)
    const urgent = info.days !== null && info.days <= 3
    const dayText = info.days === null ? '날짜 미등록' : info.days < 0 ? `기한 경과 ${Math.abs(info.days)}일` : info.days === 0 ? 'D-day' : `D-${info.days}`
    return <article key={item.id} aria-label={item.name} className="ingredient-card">
      <div className="card-top"><span className={`food-icon food-${item.standardIngredientId || 'other'}`} aria-hidden="true">{emoji[item.standardIngredientId || ''] || '🌱'}</span><span className={`storage-label ${item.storage}`}><Icon name={item.storage === 'freezer' ? 'snow' : 'fridge'} size={13} />{item.storage === 'freezer' ? '냉동' : '냉장'}</span></div>
      <h3>{item.name}</h3><p className="quantity">{item.quantity} <span>{item.unit}</span></p>
      <div className="card-divider" />
      <div className="expiry-label"><span>{item.actualExpiry ? (item.actualExpiry.kind === 'useBy' ? '소비기한' : '유통기한') : item.estimatedExpiry ? '예상 보관기한' : '기한 정보 없음'}</span>{info.source === 'user' && <span className="user-source">사용자 지정</span>}</div>
      <div className="expiry-value"><span>{info.date?.replaceAll('-', '.') || '—'}</span><span className={`day-badge ${urgent ? (info.days! < 0 ? 'expired' : 'urgent') : ''}`}>{info.isEstimated ? '약 ' : ''}{dayText}</span></div>
    </article>
  })}</div>
}
