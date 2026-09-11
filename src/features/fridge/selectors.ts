import { expiryInfo,todayLocal } from '../ingredient/expiry'
import type { Ingredient } from '../ingredient/types'
export type FridgeFilter='all'|'fridge'|'freezer'|'urgent'
export type FridgeSort='expiry'|'recent'|'name'
export function countStorage(items:Ingredient[]) {return {fridge:items.filter(x=>x.storage==='fridge').length,freezer:items.filter(x=>x.storage==='freezer').length}}
export function selectIngredients(items:Ingredient[],filter:FridgeFilter,sort:FridgeSort,today=todayLocal()) {
 return items.filter(x=>{const days=expiryInfo(x,today).days;return filter==='all' || (filter==='urgent' ? days!==null && days>=0 && days<=3 : x.storage===filter)}).sort((a,b)=>{
 const order=sort==='name' ? a.name.localeCompare(b.name,'ko') : sort==='recent' ? b.createdAt.localeCompare(a.createdAt) : (expiryInfo(a,today).days ?? Infinity)-(expiryInfo(b,today).days ?? Infinity)
 return order || a.id.localeCompare(b.id)
 })
}
