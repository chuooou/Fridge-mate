import type { User } from '../features/auth/types'
import type { Ingredient } from '../features/ingredient/types'
import { todayLocal } from '../features/ingredient/expiry'
export const db:{accounts:(User & {password:string})[];sessionUserId:string|null;ingredients:Map<string,Ingredient[]>}={accounts:[],sessionUserId:null,ingredients:new Map()}
export function resetDb() {
 db.accounts=[{id:'demo',nickname:'demo',password:'fridge1234'}];db.sessionUserId=null;db.ingredients.clear()
 const today=todayLocal();const plus=(n:number)=>{const d=new Date(`${today}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
 db.ingredients.set('demo',[
  {id:'demo-milk',name:'우유',standardIngredientId:'milk',quantity:1,unit:'팩',storage:'fridge',registeredOn:today,createdAt:new Date().toISOString(),registrationMethod:'manual',actualExpiry:{date:plus(1),kind:'useBy'},estimatedExpiry:null},
  {id:'demo-onion',name:'양파',standardIngredientId:'onion',quantity:3,unit:'개',storage:'fridge',registeredOn:today,createdAt:new Date().toISOString(),registrationMethod:'manual',actualExpiry:null,estimatedExpiry:{date:plus(2),source:'calculated',basis:'개발용 Mock 기준 — 실제 보관기간 근거가 아니에요.'}},
  {id:'demo-chicken',name:'닭고기',standardIngredientId:'chicken',quantity:500,unit:'g',storage:'freezer',registeredOn:today,createdAt:new Date().toISOString(),registrationMethod:'manual',actualExpiry:null,estimatedExpiry:{date:plus(14),source:'user',basis:'사용자 지정'}},
 ])
}
resetDb()
