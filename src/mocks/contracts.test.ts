import { afterAll,afterEach,beforeAll,beforeEach,expect,it } from 'vitest'
import { server } from './server'
import { resetDb } from './db'
import { signup,login,getMe,logout } from '../features/auth/api'
import { createIngredient,estimateExpiry,getCatalog } from '../features/ingredient/api'
import { getIngredients } from '../features/fridge/api'
import { api } from '../shared/api/client'
import { http,HttpResponse } from 'msw'
import axios from 'axios'
beforeAll(()=>server.listen({onUnhandledRequest:'error'}))
beforeEach(resetDb)
afterEach(()=>server.resetHandlers())
afterAll(()=>server.close())
const input = {name:'집 양파',standardIngredientId:'onion',quantity:2,unit:'개',storage:'fridge' as const,registeredOn:'2026-01-01',actualExpiry:null,estimateInput:{mode:'automatic' as const}}
it('requires auth, signup does not login and duplicate nicknames ignore case',async()=>{
 await expect(getIngredients()).rejects.toMatchObject({status:401})
 await signup({nickname:'Alice',password:'password1'})
 await expect(getMe()).rejects.toMatchObject({status:401})
 await expect(signup({nickname:' alice ',password:'password1'})).rejects.toMatchObject({status:409})
 await expect(login({nickname:'Alice',password:'wrongpwd'})).rejects.toMatchObject({status:401})
 await expect(signup({nickname:'?',password:'x'})).rejects.toMatchObject({status:400,fieldErrors:expect.any(Object)})
})
it('isolates account inventories and saves authoritative expiry modes',async()=>{
 await signup({nickname:'Alice',password:'password1'})
 const user=await login({nickname:'alice',password:'password1'})
 expect(await getMe()).toEqual(user)
 expect(await getIngredients()).toEqual([])
 expect((await getCatalog()).some(x=>x.id==='onion')).toBe(true)
 const estimate=await estimateExpiry({standardIngredientId:'onion',storage:'fridge',registeredOn:'2026-01-01'})
 const auto=await createIngredient(input)
 expect(auto.estimatedExpiry).toMatchObject({...estimate,source:'calculated'})
 const manual=await createIngredient({...input,estimateInput:{mode:'manual',date:'2026-01-03'}})
 expect(manual.estimatedExpiry).toEqual({date:'2026-01-03',source:'user',basis:'사용자 지정'})
 expect((await createIngredient({...input,estimateInput:{mode:'none'}})).estimatedExpiry).toBeNull()
 await api.post('/fridge/ingredients',{...input,userId:'demo'})
 expect(await getIngredients()).toHaveLength(4)
 await logout()
 await expect(getMe()).rejects.toMatchObject({status:401})
 await signup({nickname:'Bob',password:'password1'})
 await login({nickname:'Bob',password:'password1'})
 expect(await getIngredients()).toEqual([])
})
it('does not infer catalog IDs from names and validates API payloads',async()=>{
 await login({nickname:'demo',password:'fridge1234'})
 expect((await createIngredient({...input,standardIngredientId:null})).estimatedExpiry).toBeNull()
 await expect(api.post('/fridge/ingredients',{...input,quantity:-1})).rejects.toMatchObject({status:400})
 await expect(estimateExpiry({standardIngredientId:'unknown',storage:'fridge',registeredOn:'2026-01-01'})).rejects.toMatchObject({status:400})
 const fridge=await estimateExpiry({standardIngredientId:'onion',storage:'fridge',registeredOn:'2026-01-01'})
 const freezer=await estimateExpiry({standardIngredientId:'onion',storage:'freezer',registeredOn:'2026-01-01'})
 expect(fridge?.date).not.toBe(freezer?.date)
 expect(await estimateExpiry({standardIngredientId:'milk',storage:'freezer',registeredOn:'2026-01-01'})).toBeNull()
})
it('normalizes server and network failures while preserving cancellation',async()=>{
 server.use(http.get('/api/fridge/ingredients',()=>HttpResponse.json({error:{code:'UNAVAILABLE',message:'잠시 후 다시 시도해주세요.'}},{status:503})))
 await expect(getIngredients()).rejects.toMatchObject({status:503,code:'UNAVAILABLE'})
 server.use(http.get('/api/fridge/ingredients',()=>HttpResponse.error()))
 await expect(getIngredients()).rejects.toMatchObject({status:0,code:'NETWORK_ERROR'})
 const controller=new AbortController();controller.abort()
 try {await getIngredients(controller.signal);expect.fail('must cancel')} catch(error) {expect(axios.isCancel(error)).toBe(true)}
})
