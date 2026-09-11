import type { Storage } from '../../features/ingredient/types'
export const ingredientCatalog: {id:string;label:string;days:Partial<Record<Storage,number>>}[] = [
 {id:'onion',label:'양파',days:{fridge:7,freezer:30}}, {id:'carrot',label:'당근',days:{fridge:7,freezer:30}},
 {id:'milk',label:'우유',days:{fridge:5}}, {id:'egg',label:'계란',days:{fridge:10}},
 {id:'apple',label:'사과',days:{fridge:7}}, {id:'tofu',label:'두부',days:{fridge:3,freezer:14}},
 {id:'spinach',label:'시금치',days:{fridge:3,freezer:14}}, {id:'chicken',label:'닭고기',days:{fridge:2,freezer:30}},
]
// These deliberately small fixtures test the UI contract, not food safety.
export function calculateEstimate(id:string|null,storage:Storage,registeredOn:string) {
 const days=ingredientCatalog.find(x=>x.id===id)?.days[storage]
 if(days===undefined) return null
 const date=new Date(`${registeredOn}T00:00:00Z`);date.setUTCDate(date.getUTCDate()+days)
 return {date:date.toISOString().slice(0,10),basis:'개발용 Mock 기준 — 실제 보관기간 근거가 아니에요.'}
}
