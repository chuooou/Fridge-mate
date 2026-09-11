import { api } from '../../shared/api/client'
import type { Ingredient } from '../ingredient/types'
export async function getIngredients(signal?:AbortSignal):Promise<Ingredient[]> {return (await api.get('/fridge/ingredients',{signal})).data.items}
