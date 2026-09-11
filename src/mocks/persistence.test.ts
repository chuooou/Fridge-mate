import { beforeEach, expect, it, vi } from 'vitest'
import { db, resetDb, enablePersistence, updateData, setSession, refreshDb } from './db'
import { hashPassword, verifyPassword } from './password'
import { DATA_KEY, SESSION_KEY } from './persistence'

beforeEach(() => {
  resetDb()
  localStorage.clear()
  sessionStorage.clear()
})

it('restores account, inventory and login after a fresh memory initialization', async () => {
  enablePersistence(localStorage, sessionStorage)
  const verifier = await hashPassword('not-plaintext-123')
  updateData((next) => {
    next.accounts.push({ id: 'alice', nickname: 'Alice', ...verifier })
    next.ingredients.set('alice', [{ id: 'onion-1', name: '우리집 양파', standardIngredientId: 'onion', quantity: 2, unit: '개', storage: 'fridge', registeredOn: '2026-01-01', createdAt: '2026-01-01T00:00:00Z', registrationMethod: 'manual', actualExpiry: null, estimatedExpiry: { date: '2026-01-10', source: 'user', basis: '사용자 지정' } }])
  })
  setSession('alice')
  expect(localStorage.getItem(DATA_KEY)).not.toContain('not-plaintext-123')
  expect(localStorage.getItem(DATA_KEY)).not.toContain('sessionUserId')
  resetDb()
  enablePersistence(localStorage, sessionStorage)
  expect(db.sessionUserId).toBe('alice')
  expect(db.ingredients.get('alice')?.[0].estimatedExpiry?.source).toBe('user')
  expect(await verifyPassword('not-plaintext-123', db.accounts.find((a) => a.id === 'alice')!)).toBe(true)
  expect(await verifyPassword('wrong-password', db.accounts.find((a) => a.id === 'alice')!)).toBe(false)
})

it('keeps logout after reload and separates sessions between tabs', () => {
  enablePersistence(localStorage, sessionStorage)
  setSession('demo')
  expect(sessionStorage.getItem(SESSION_KEY)).toBe('demo')
  const otherTabSession = { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() }
  enablePersistence(localStorage, otherTabSession)
  expect(db.sessionUserId).toBeNull()
  enablePersistence(localStorage, sessionStorage)
  expect(db.sessionUserId).toBe('demo')
  setSession(null)
  resetDb()
  enablePersistence(localStorage, sessionStorage)
  expect(db.sessionUserId).toBeNull()
})

it('does not overwrite broken or unsupported saved data', () => {
  for (const value of ['{broken', '{"version":999}']) {
    localStorage.setItem(DATA_KEY, value)
    expect(() => enablePersistence(localStorage, sessionStorage)).toThrow(/저장/)
    expect(localStorage.getItem(DATA_KEY)).toBe(value)
  }
})

it('rolls back memory and reports storage failure instead of pretending a write succeeded', () => {
  enablePersistence(localStorage, sessionStorage)
  const previous = localStorage.getItem(DATA_KEY)
  const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
  expect(() => updateData((next) => { next.ingredients.set('demo', []) })).toThrow(/저장/)
  expect(db.ingredients.get('demo')).toHaveLength(3)
  expect(localStorage.getItem(DATA_KEY)).toBe(previous)
  expect(() => setSession('demo')).toThrow(/저장/)
  expect(db.sessionUserId).toBeNull()
  setItem.mockRestore()
})

it('reads the latest persisted inventory before a write in another tab', () => {
  enablePersistence(localStorage, sessionStorage)
  const snapshot = JSON.parse(localStorage.getItem(DATA_KEY)!)
  snapshot.ingredients.demo = []
  localStorage.setItem(DATA_KEY, JSON.stringify(snapshot))
  updateData((next) => { next.ingredients.set('new-user', []) })
  refreshDb()
  expect(db.ingredients.get('demo')).toEqual([])
  expect(db.ingredients.has('new-user')).toBe(true)
})
