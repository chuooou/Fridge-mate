import { api } from '../../shared/api/client'
import type { CreateIngredientInput,Ingredient,StandardIngredient,Estimate,Storage } from './types'
export async function getCatalog(signal?:AbortSignal):Promise<StandardIngredient[]> {return (await api.get('/ingredients/catalog',{signal})).data.items}
export async function estimateExpiry(input:{standardIngredientId:string|null;storage:Storage;registeredOn:string},signal?:AbortSignal):Promise<Estimate|null> {return (await api.post('/ingredients/estimate-expiry',input,{signal})).data.estimate}
export async function createIngredient(input:CreateIngredientInput):Promise<Ingredient> {return (await api.post('/fridge/ingredients',input)).data.item}
