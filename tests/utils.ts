import type { Link } from '../shared/schemas/link'
import { env, SELF } from 'cloudflare:test'
import { expect } from 'vitest'
import { LINK_PASSWORD_HASH_PREFIX, LINK_PASSWORD_MASK_PREFIX } from '../shared/utils/link-password'

export const TEST_USER_ID = 'test-user'
export const TEST_AUTH_SESSION_COOKIE = 'sink_session'
const TEST_SESSION_SECRET = import.meta.env.NUXT_AUTH_SESSION_SECRET || 'test-session-secret'
const encoder = new TextEncoder()

function base64UrlEncode(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input
  let value = ''
  for (const byte of bytes)
    value += String.fromCharCode(byte)

  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

async function signSessionCookie(value: unknown, secret: string): Promise<string> {
  const payload = base64UrlEncode(JSON.stringify(value))
  const signature = await crypto.subtle.sign('HMAC', await getSigningKey(secret), encoder.encode(payload))
  return `${payload}.${base64UrlEncode(new Uint8Array(signature))}`
}

interface TestAuthUser {
  id?: string
  email?: string
  name?: string
}

export async function getAuthCookie(user: TestAuthUser = {}): Promise<string> {
  const userId = user.id ?? TEST_USER_ID
  const session = await signSessionCookie({
    issuer: import.meta.env.NUXT_AUTH_ISSUER || 'https://auth.example.test',
    expiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
    user: {
      id: userId,
      email: user.email ?? `${userId}@example.com`,
      name: user.name ?? 'Test User',
      roles: ['admin'],
    },
  }, TEST_SESSION_SECRET)

  return `${TEST_AUTH_SESSION_COOKIE}=${session}`
}

export async function fetchWithAuth(path: string, options?: RequestInit, user?: TestAuthUser): Promise<Response> {
  return SELF.fetch(`http://localhost${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Cookie: await getAuthCookie(user),
    },
  })
}

export function fetch(path: string, options?: RequestInit): Promise<Response> {
  return SELF.fetch(`http://localhost${path}`, options)
}

export async function postJson(path: string, body: unknown, withAuth = true, user?: TestAuthUser): Promise<Response> {
  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }
  return withAuth ? fetchWithAuth(path, options, user) : fetch(path, options)
}

export async function putJson(path: string, body: unknown, withAuth = true, user?: TestAuthUser): Promise<Response> {
  const options = {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }
  return withAuth ? fetchWithAuth(path, options, user) : fetch(path, options)
}

export async function getStoredLink(slug: string) {
  return await env.KV.get<Link>(`link:${slug}`, { type: 'json' })
}

export async function getStoredD1Link(slug: string) {
  return await env.DB.prepare('SELECT * FROM links WHERE slug = ?').bind(slug).first<{
    id: string
    owner_id: string
    slug: string
    url: string
    status: string
    deleted_at: number | null
  }>()
}

export async function deleteStoredLink(slug: string) {
  await env.KV.delete(`link:${slug}`)
  await env.DB.prepare('DELETE FROM links WHERE slug = ?').bind(slug).run()
}

export async function deleteStoredLinks(slugs: string[]) {
  await Promise.all(slugs.map(slug => deleteStoredLink(slug)))
}

export function expectMaskedPassword(password: string | undefined, plainText: string) {
  expect(password).toBeDefined()
  expect(password?.startsWith(LINK_PASSWORD_MASK_PREFIX), password).toBe(true)
  expect(password).toContain(plainText.slice(-3))
  expect(password).not.toBe(plainText)
  expect(password?.startsWith(LINK_PASSWORD_HASH_PREFIX)).toBe(false)
}

export async function expectStoredHashedPassword(slug: string, plainText: string) {
  const storedLink = await getStoredLink(slug)
  expect(storedLink?.password?.startsWith(LINK_PASSWORD_HASH_PREFIX), storedLink?.password).toBe(true)
  expect(storedLink?.password).not.toBe(plainText)
}

// 1x1 transparent PNG for testing
export const TEST_PNG_BYTES = new Uint8Array([
  0x89,
  0x50,
  0x4E,
  0x47,
  0x0D,
  0x0A,
  0x1A,
  0x0A,
  0x00,
  0x00,
  0x00,
  0x0D,
  0x49,
  0x48,
  0x44,
  0x52,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x08,
  0x06,
  0x00,
  0x00,
  0x00,
  0x1F,
  0x15,
  0xC4,
  0x89,
  0x00,
  0x00,
  0x00,
  0x0A,
  0x49,
  0x44,
  0x41,
  0x54,
  0x78,
  0x9C,
  0x63,
  0x00,
  0x01,
  0x00,
  0x00,
  0x05,
  0x00,
  0x01,
  0x0D,
  0x0A,
  0x2D,
  0xB4,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4E,
  0x44,
  0xAE,
  0x42,
  0x60,
  0x82,
])
