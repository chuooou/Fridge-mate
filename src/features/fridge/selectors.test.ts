import { expect,it } from 'vitest'
import { selectIngredients,countStorage } from './selectors'
import type { Ingredient } from '../ingredient/types'
const base: Ingredient = {id:'a',name:'양파',standardIngredientId:null,quantity:1,unit:'개',storage:'fridge',registeredOn:'2026-09-01',createdAt:'2026-09-01T00:00:00Z',registrationMethod:'manual',actualExpiry:null,estimatedExpiry:null}
it('filters urgent 0 through 3 days and orders expired before no-date items without mutating',()=>{
 const items = [base,...['2026-09-10','2026-09-11','2026-09-14','2026-09-15'].map((date,i)=>({...base,id:String(i),storage:'freezer' as const,actualExpiry:{date,kind:'useBy' as const}}))]
 expect(selectIngredients(items,'urgent','expiry','2026-09-11').map(x=>x.id)).toEqual(['1','2'])
 expect(selectIngredients(items,'all','expiry','2026-09-11').map(x=>x.id)).toEqual(['0','1','2','3','a'])
 expect(items[0].id).toBe('a')
 expect(countStorage(items)).toEqual({fridge:1,freezer:4})
})
