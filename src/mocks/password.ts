export type PasswordVerifier = { passwordHash: string; passwordSalt: string }

const iterations = 100_000
const hex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

async function derive(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bytes = new Uint8Array(salt.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)))
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: bytes, iterations, hash: 'SHA-256' }, key, 256)
  return hex(new Uint8Array(bits))
}

/** Mock-only verifier. Production authentication must be performed by a backend. */
export async function hashPassword(password: string): Promise<PasswordVerifier> {
  const passwordSalt = hex(crypto.getRandomValues(new Uint8Array(16)))
  return { passwordSalt, passwordHash: await derive(password, passwordSalt) }
}

export async function verifyPassword(password: string, account: PasswordVerifier): Promise<boolean> {
  return (await derive(password, account.passwordSalt)) === account.passwordHash
}
