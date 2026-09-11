import { api } from '../../shared/api/client'
import type { User,Credentials } from './types'
export async function signup(input:Credentials):Promise<User> {return (await api.post('/auth/signup',input)).data.user}
export async function login(input:Credentials):Promise<User> {return (await api.post('/auth/login',input)).data.user}
export async function getMe(signal?:AbortSignal):Promise<User> {return (await api.get('/auth/me',{signal})).data.user}
export async function logout():Promise<void> {await api.post('/auth/logout')}
