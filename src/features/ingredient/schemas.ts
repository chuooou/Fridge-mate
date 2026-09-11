import { z } from 'zod'
import { todayLocal } from './expiry'
export const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'날짜를 입력해주세요.').refine(value=>{const d=new Date(`${value}T00:00:00Z`);return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value},'유효한 날짜를 입력해주세요.')
const registeredOn=dateSchema.refine(value=>value<=todayLocal(),'등록 날짜는 오늘 이후일 수 없어요.')
export const estimateExpirySchema=z.object({standardIngredientId:z.string().nullable(),storage:z.enum(['fridge','freezer']),registeredOn})
export const createIngredientSchema=z.object({
 name:z.string().trim().min(1,'재료명을 입력해주세요.').max(50,'재료명은 50자 이하로 입력해주세요.'),
 standardIngredientId:z.string().nullable(),quantity:z.number({error:'수량을 입력해주세요.'}).positive('수량은 0보다 커야 해요.'),
 unit:z.string().trim().min(1,'단위를 입력해주세요.').max(10,'단위는 10자 이하로 입력해주세요.'),storage:z.enum(['fridge','freezer']),registeredOn,
 actualExpiry:z.object({date:dateSchema,kind:z.enum(['useBy','bestBefore'])}).nullable(),
 estimateInput:z.discriminatedUnion('mode',[z.object({mode:z.literal('automatic')}),z.object({mode:z.literal('manual'),date:dateSchema}),z.object({mode:z.literal('none')})]),
}).refine(x=>!x.actualExpiry || x.estimateInput.mode==='none',{message:'실제 기한과 예상 기한을 함께 저장할 수 없어요.',path:['estimateInput']})
