import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import { isAuthAllowInsecure } from './auth-config'

export const AUTH_SESSION_COOKIE = 'sink_session'
export const AUTH_TRANSACTION_COOKIE = 'sink_oidc'

const encoder = new TextEncoder()

export interface CurrentUser {
  id: string
  email?: string
  name?: string
  roles?: string[]
}

export interface AuthSession {
  user: CurrentUser
  issuer: string
  expiresAt: number
}

export interface OidcTransaction {
  codeVerifier: string
  state: string
  nonce: string
  returnTo: string
  expiresAt: number
}

function base64UrlEncode(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input
  let value = ''
  for (const byte of bytes)
    value += String.fromCharCode(byte)

  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function base64UrlDecode(input: string): string {
  return new TextDecoder().decode(base64UrlDecodeBytes(input))
}

function base64UrlDecodeBytes(input: string): Uint8Array {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const value = atob(padded)
  return Uint8Array.from(value, char => char.charCodeAt(0))
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function sealPayload(value: unknown, secret: string): Promise<string> {
  const payload = base64UrlEncode(JSON.stringify(value))
  const signature = await crypto.subtle.sign('HMAC', await getSigningKey(secret), encoder.encode(payload))
  return `${payload}.${base64UrlEncode(new Uint8Array(signature))}`
}

async function unsealPayload<T>(token: string, secret: string): Promise<T | null> {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature)
      return null

    const signatureBytes = base64UrlDecodeBytes(signature)
    const signatureBuffer = signatureBytes.buffer.slice(
      signatureBytes.byteOffset,
      signatureBytes.byteOffset + signatureBytes.byteLength,
    ) as ArrayBuffer
    const valid = await crypto.subtle.verify('HMAC', await getSigningKey(secret), signatureBuffer, encoder.encode(payload))
    if (!valid)
      return null

    return JSON.parse(base64UrlDecode(payload)) as T
  }
  catch {
    return null
  }
}

function getSessionSecret(event: H3Event): string {
  const secret = useRuntimeConfig(event).authSessionSecret
  if (!secret) {
    throw createError({
      status: 500,
      statusText: 'Auth session secret is not configured',
    })
  }
  return secret
}

function secureCookies(event: H3Event): boolean {
  return !isAuthAllowInsecure(useRuntimeConfig(event).authAllowInsecure)
}

export async function setOidcTransaction(event: H3Event, transaction: OidcTransaction): Promise<void> {
  setCookie(event, AUTH_TRANSACTION_COOKIE, await sealPayload(transaction, getSessionSecret(event)), {
    httpOnly: true,
    secure: secureCookies(event),
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  })
}

export async function getOidcTransaction(event: H3Event): Promise<OidcTransaction | null> {
  const token = getCookie(event, AUTH_TRANSACTION_COOKIE)
  if (!token)
    return null

  const transaction = await unsealPayload<OidcTransaction>(token, getSessionSecret(event))
  if (!transaction || transaction.expiresAt <= Math.floor(Date.now() / 1000))
    return null

  return transaction
}

export function clearOidcTransaction(event: H3Event): void {
  deleteCookie(event, AUTH_TRANSACTION_COOKIE, { path: '/' })
}

export async function setAuthSession(event: H3Event, session: AuthSession): Promise<void> {
  const ttl = Math.max(1, session.expiresAt - Math.floor(Date.now() / 1000))
  setCookie(event, AUTH_SESSION_COOKIE, await sealPayload(session, getSessionSecret(event)), {
    httpOnly: true,
    secure: secureCookies(event),
    sameSite: 'lax',
    path: '/',
    maxAge: ttl,
  })
}

export async function getAuthSession(event: H3Event): Promise<AuthSession | null> {
  const token = getCookie(event, AUTH_SESSION_COOKIE)
  if (!token)
    return null

  const session = await unsealPayload<AuthSession>(token, getSessionSecret(event))
  if (!session || session.expiresAt <= Math.floor(Date.now() / 1000))
    return null

  return session
}

export function clearAuthSession(event: H3Event): void {
  deleteCookie(event, AUTH_SESSION_COOKIE, { path: '/' })
}

export async function requireAuthSession(event: H3Event): Promise<AuthSession> {
  const session = await getAuthSession(event)
  if (!session) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
    })
  }

  event.context.auth = session
  return session
}

export async function upsertLocalUser(event: H3Event, userId: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  await event.context.cloudflare.env.DB
    .prepare(`
      INSERT INTO users (id, created_at, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at
    `)
    .bind(userId, now, now)
    .run()
}
