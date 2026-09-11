import type { Ingredient } from '../features/ingredient/types'
import { todayLocal } from '../features/ingredient/expiry'
import { readData, writeData, readSession, writeSession, type MockData, type StoragePort } from './persistence'

export const db: MockData & { sessionUserId: string | null } = { accounts: [], sessionUserId: null, ingredients: new Map() }
let persistence: { data: StoragePort; session: StoragePort } | null = null

function seedData(): MockData {
 const accounts = [{id:'demo',nickname:'demo',passwordSalt:'7d82e1da54bb4d80a657c7da33e1ac22',passwordHash:'c5cbfb9591feabe7a6a7311d0cd61a574362150052b2cce04087713e8886c304'}]
 const ingredients = new Map<string, Ingredient[]>()
 const today=todayLocal();const plus=(n:number)=>{const d=new Date(`${today}T00:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
 ingredients.set('demo',[
  {id:'demo-milk',name:'우유',standardIngredientId:'milk',quantity:1,unit:'팩',storage:'fridge',registeredOn:today,createdAt:new Date().toISOString(),registrationMethod:'manual',actualExpiry:{date:plus(1),kind:'useBy'},estimatedExpiry:null},
  {id:'demo-onion',name:'양파',standardIngredientId:'onion',quantity:3,unit:'개',storage:'fridge',registeredOn:today,createdAt:new Date().toISOString(),registrationMethod:'manual',actualExpiry:null,estimatedExpiry:{date:plus(2),source:'calculated',basis:'개발용 Mock 기준 — 실제 보관기간 근거가 아니에요.'}},
  {id:'demo-chicken',name:'닭고기',standardIngredientId:'chicken',quantity:500,unit:'g',storage:'freezer',registeredOn:today,createdAt:new Date().toISOString(),registrationMethod:'manual',actualExpiry:null,estimatedExpiry:{date:plus(14),source:'user',basis:'사용자 지정'}},
 ])
 return { accounts, ingredients }
}

/** Test reset detaches persistence without deleting a user's browser data. */
export function resetDb() {
  persistence = null
  Object.assign(db, seedData(), { sessionUserId: null })
}

export function enablePersistence(dataStorage: StoragePort, sessionStorage: StoragePort) {
  const saved = readData(dataStorage)
  const sessionUserId = readSession(sessionStorage)
  const data = saved ?? seedData()
  if (!saved) writeData(dataStorage, data)
  persistence = { data: dataStorage, session: sessionStorage }
  Object.assign(db, data, { sessionUserId: data.accounts.some((a) => a.id === sessionUserId) ? sessionUserId : null })
}

export function refreshDb() {
  if (!persistence) return
  const saved = readData(persistence.data)
  const sessionUserId = readSession(persistence.session)
  const data = saved ?? seedData()
  if (!saved) writeData(persistence.data, data)
  Object.assign(db, data, { sessionUserId: data.accounts.some((a) => a.id === sessionUserId) ? sessionUserId : null })
}

/** Save before replacing memory so a failed write cannot produce a false success. */
export function updateData(update: (data: MockData) => void) {
  refreshDb()
  const next = structuredClone({ accounts: db.accounts, ingredients: db.ingredients })
  update(next)
  if (persistence) writeData(persistence.data, next)
  Object.assign(db, next)
}

export function setSession(id: string | null) {
  if (persistence) writeSession(persistence.session, id)
  db.sessionUserId = id
}
resetDb()
