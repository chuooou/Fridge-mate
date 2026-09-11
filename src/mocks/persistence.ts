import { z } from 'zod'
import { dateSchema } from '../features/ingredient/schemas'
import type { Ingredient } from '../features/ingredient/types'
import type { User } from '../features/auth/types'
import type { PasswordVerifier } from './password'

export const DATA_KEY = 'fridge-mate:mock-data:v1'
export const SESSION_KEY = 'fridge-mate:mock-session:v1'
export type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export type MockAccount = User & PasswordVerifier
export type MockData = { accounts: MockAccount[]; ingredients: Map<string, Ingredient[]> }

const ingredientSchema = z.object({
  id: z.string(), name: z.string(), standardIngredientId: z.string().nullable(),
  quantity: z.number().positive(), unit: z.string(), storage: z.enum(['fridge', 'freezer']),
  registeredOn: dateSchema, createdAt: z.iso.datetime(), registrationMethod: z.literal('manual'),
  actualExpiry: z.object({ date: dateSchema, kind: z.enum(['useBy', 'bestBefore']) }).nullable(),
  estimatedExpiry: z.object({ date: dateSchema, source: z.enum(['calculated', 'user']), basis: z.string() }).nullable(),
})
const snapshotSchema = z.object({
  version: z.literal(1),
  accounts: z.array(z.object({
    id: z.string(), nickname: z.string(), passwordHash: z.string().regex(/^[a-f0-9]{64}$/), passwordSalt: z.string().regex(/^[a-f0-9]{32}$/),
  }).strict()),
  ingredients: z.record(z.string(), z.array(ingredientSchema)),
})

export class MockStorageError extends Error {
  constructor(message = '브라우저에 데이터를 저장하지 못했어요. 저장 공간과 브라우저 설정을 확인해 주세요.') {
    super(message)
    this.name = 'MockStorageError'
  }
}

export function readData(storage: StoragePort): MockData | null {
  try {
    const raw = storage.getItem(DATA_KEY)
    if (raw === null) return null
    const snapshot = snapshotSchema.parse(JSON.parse(raw))
    return { accounts: snapshot.accounts, ingredients: new Map(Object.entries(snapshot.ingredients)) }
  } catch {
    throw new MockStorageError('저장된 데이터를 읽지 못했어요. 기존 데이터는 변경하지 않았어요. 브라우저 저장 설정과 데이터 버전을 확인해 주세요.')
  }
}

export function writeData(storage: StoragePort, data: MockData) {
  try {
    storage.setItem(DATA_KEY, JSON.stringify({ version: 1, accounts: data.accounts, ingredients: Object.fromEntries(data.ingredients) }))
  } catch { throw new MockStorageError() }
}

export function readSession(storage: StoragePort): string | null {
  try { return storage.getItem(SESSION_KEY) }
  catch { throw new MockStorageError('저장된 로그인 상태를 읽지 못했어요. 브라우저 저장 설정을 확인해 주세요.') }
}

export function writeSession(storage: StoragePort, id: string | null) {
  try {
    if (id === null) storage.removeItem(SESSION_KEY)
    else storage.setItem(SESSION_KEY, id)
  } catch { throw new MockStorageError('로그인 상태를 저장하지 못했어요. 브라우저 저장 설정을 확인해 주세요.') }
}
