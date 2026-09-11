import { http,HttpResponse,bypass } from 'msw'
import { credentialsSchema } from '../features/auth/schemas'
import { createIngredientSchema,estimateExpirySchema } from '../features/ingredient/schemas'
import { db } from './db'
import { ingredientCatalog,calculateEstimate } from './fixtures/ingredientCatalog'
import type { ZodError } from 'zod'
import type { Ingredient } from '../features/ingredient/types'
const base=(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/,'')
export const apiUrl=(path:string)=>`${base}${path}`
const fail=(status:number,code:string,message:string,fieldErrors?:Record<string,string>)=>HttpResponse.json({error:{code,message,...(fieldErrors ? {fieldErrors} : {})}},{status})
const invalid=(error:ZodError)=>fail(400,'VALIDATION_ERROR','입력 내용을 확인해주세요.',Object.fromEntries(error.issues.map(x=>[x.path.join('.'),x.message])))
const unauthorized=()=>fail(401,'UNAUTHORIZED','다시 로그인해주세요.')
async function body(request:Request) {try{return await request.json()}catch{return null}}
export function createHandlers({auth=true,fridge=true}:{auth?:boolean;fridge?:boolean}={}) {
 async function userId(request:Request):Promise<string|null> {
  if(auth) return db.sessionUserId
  const response=await fetch(bypass(new Request(new URL(apiUrl('/auth/me'),request.url),{credentials:'include',headers:request.headers})))
  if(!response.ok) return null
  const result=await response.json();return typeof result.user?.id==='string' ? result.user.id : null
 }
 return [
 ...(auth ? [
  http.post(apiUrl('/auth/signup'),async({request})=>{
   const result=credentialsSchema.safeParse(await body(request));if(!result.success)return invalid(result.error)
   if(db.accounts.some(x=>x.nickname.toLowerCase()===result.data.nickname.toLowerCase()))return fail(409,'NICKNAME_TAKEN','이미 사용 중인 닉네임이에요.',{nickname:'이미 사용 중인 닉네임이에요.'})
   const user={id:crypto.randomUUID(),nickname:result.data.nickname};db.accounts.push({...user,password:result.data.password});db.ingredients.set(user.id,[])
   return HttpResponse.json({user},{status:201})
  }),
  http.post(apiUrl('/auth/login'),async({request})=>{
   const result=credentialsSchema.safeParse(await body(request));if(!result.success)return invalid(result.error)
   const account=db.accounts.find(x=>x.nickname.toLowerCase()===result.data.nickname.toLowerCase() && x.password===result.data.password)
   if(!account)return fail(401,'INVALID_CREDENTIALS','닉네임 또는 비밀번호를 확인해주세요.')
   db.sessionUserId=account.id;return HttpResponse.json({user:{id:account.id,nickname:account.nickname}})
  }),
  http.get(apiUrl('/auth/me'),()=>{const account=db.accounts.find(x=>x.id===db.sessionUserId);return account ? HttpResponse.json({user:{id:account.id,nickname:account.nickname}}) : unauthorized()}),
  http.post(apiUrl('/auth/logout'),()=>{db.sessionUserId=null;return new HttpResponse(null,{status:204})}),
 ] : []),
 ...(fridge ? [
  http.get(apiUrl('/ingredients/catalog'),async({request})=>await userId(request) ? HttpResponse.json({items:ingredientCatalog.map(({id,label})=>({id,label}))}) : unauthorized()),
  http.post(apiUrl('/ingredients/estimate-expiry'),async({request})=>{
   if(!await userId(request))return unauthorized()
   const result=estimateExpirySchema.safeParse(await body(request));if(!result.success)return invalid(result.error)
   const {standardIngredientId,storage,registeredOn}=result.data
   if(standardIngredientId!==null && !ingredientCatalog.some(x=>x.id===standardIngredientId))return fail(400,'VALIDATION_ERROR','표준 재료를 확인해주세요.',{standardIngredientId:'알 수 없는 표준 재료예요.'})
   return HttpResponse.json({estimate:calculateEstimate(standardIngredientId,storage,registeredOn)})
  }),
  http.get(apiUrl('/fridge/ingredients'),async({request})=>{const id=await userId(request);return id ? HttpResponse.json({items:db.ingredients.get(id) ?? []}) : unauthorized()}),
  http.post(apiUrl('/fridge/ingredients'),async({request})=>{
   const id=await userId(request);if(!id)return unauthorized()
   const result=createIngredientSchema.safeParse(await body(request));if(!result.success)return invalid(result.error)
   const {estimateInput,...data}=result.data
   if(data.standardIngredientId!==null && !ingredientCatalog.some(x=>x.id===data.standardIngredientId))return fail(400,'VALIDATION_ERROR','표준 재료를 확인해주세요.',{standardIngredientId:'알 수 없는 표준 재료예요.'})
   const estimate=estimateInput.mode==='automatic' ? calculateEstimate(data.standardIngredientId,data.storage,data.registeredOn) : null
   const item:Ingredient={...data,id:crypto.randomUUID(),createdAt:new Date().toISOString(),registrationMethod:'manual',estimatedExpiry:estimateInput.mode==='manual' ? {date:estimateInput.date,source:'user',basis:'사용자 지정'} : estimate ? {...estimate,source:'calculated'} : null}
   db.ingredients.set(id,[...(db.ingredients.get(id) ?? []),item]);return HttpResponse.json({item},{status:201})
  }),
 ] : []),
 ]
}
export const handlers=createHandlers()
