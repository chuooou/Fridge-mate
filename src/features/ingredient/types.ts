export type Storage = 'fridge' | 'freezer'
export interface StandardIngredient { id:string; label:string }
export interface Estimate { date:string; basis:string }
export type EstimateInput = {mode:'automatic'} | {mode:'manual';date:string} | {mode:'none'}
export interface CreateIngredientInput {
 name:string; standardIngredientId:string|null; quantity:number; unit:string; storage:Storage; registeredOn:string;
 actualExpiry:{date:string;kind:'useBy'|'bestBefore'}|null; estimateInput:EstimateInput
}
export interface Ingredient extends Omit<CreateIngredientInput,'estimateInput'> {
 id:string; createdAt:string; registrationMethod:'manual'; estimatedExpiry:(Estimate & {source:'calculated'|'user'})|null
}
