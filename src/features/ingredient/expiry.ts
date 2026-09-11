import type { Ingredient } from './types'
export function todayLocal() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
export function daysUntil(date:string,today=todayLocal()) { return (Date.parse(`${date}T00:00:00Z`)-Date.parse(`${today}T00:00:00Z`))/86400000 }
export function expiryInfo(item:Ingredient,today=todayLocal()) {
 const actual=item.actualExpiry
 const estimated=actual ? null : item.estimatedExpiry
 const date=actual?.date ?? estimated?.date ?? null
 return {date,days:date ? daysUntil(date,today) : null,isEstimated:!!estimated,source:estimated?.source,label:actual ? actual.kind==='useBy' ? '소비기한' : '유통기한' : estimated ? estimated.source==='user' ? '예상 보관기한 · 사용자 지정' : '예상 보관기한' : '기한 정보 없음'}
}
