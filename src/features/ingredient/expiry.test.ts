import { describe, expect, it } from 'vitest'
import { daysUntil, expiryInfo } from './expiry'
import { createIngredientSchema } from './schemas'
import type { Ingredient } from './types'

export const item: Ingredient = { id: 'a', name: '양파', standardIngredientId: 'onion', quantity: 1, unit: '개', storage: 'fridge', registeredOn: '2026-09-01', createdAt: '2026-09-01T00:00:00Z', registrationMethod: 'manual', actualExpiry: null, estimatedExpiry: null }
describe('calendar expiry', () => {
  it.each([['2027-01-01','2026-12-31',1],['2026-03-09','2026-03-07',2],['2024-03-01','2024-02-28',2],['2026-09-10','2026-09-11',-1]])('counts calendar days %s', (date,today,want) => expect(daysUntil(date,today)).toBe(want))
  it('prioritizes actual dates and keeps manual estimates estimated', () => {
    const estimated = {...item, estimatedExpiry: {date:'2026-09-12',source:'user' as const,basis:'사용자 지정'}}
    expect(expiryInfo(estimated,'2026-09-11')).toMatchObject({isEstimated:true,days:1,source:'user'})
    expect(expiryInfo({...estimated,actualExpiry:{date:'2026-09-11',kind:'useBy'}},'2026-09-11')).toMatchObject({isEstimated:false,days:0,label:'소비기한'})
    expect(expiryInfo(item).days).toBeNull()
  })
  it('rejects impossible dates, future registration, zero quantities and mixed actual/automatic input', () => {
    const input = {name:'양파',standardIngredientId:null,quantity:1,unit:'개',storage:'fridge',registeredOn:'2026-01-01',actualExpiry:null,estimateInput:{mode:'none'}}
    expect(createIngredientSchema.safeParse(input).success).toBe(true)
    for(const patch of [{registeredOn:'2026-02-30'},{registeredOn:'2099-01-01'},{quantity:0},{actualExpiry:{date:'2026-01-01',kind:'useBy'},estimateInput:{mode:'automatic'}}]) expect(createIngredientSchema.safeParse({...input,...patch}).success).toBe(false)
  })
})
