import type { Link } from '../shared/schemas/link'
import { env, SELF } from 'cloudflare:test'
import { importJWK, SignJWT } from 'jose'
import { expect } from 'vitest'
import { LINK_PASSWORD_HASH_PREFIX, LINK_PASSWORD_MASK_PREFIX } from '../shared/utils/link-password'

export const TEST_USER_ID = 'test-user'
export const TEST_AUTH_AUDIENCE = 'https://sink.test/api'
export const TEST_AUTH_ISSUER = 'http://flareauth.test'

const TEST_AUTH_PRIVATE_JWK = {
  kty: 'RSA',
  n: 'nFp0teLq6HaSXRlh_fyX8cDqlx_QYtbEpWvjKghtz3uBAdCzKJCvYewsKhjjLUcP-xhQXLbiAr28QtLSzis28GIi0dYWyrFvMy0kmoPou3liK4MQA0QGdBfNgIs7DSYv3-Zp9vPLtymIBwq8PRW6EqZCG-pZEtUd0Xji8E8T4hiwXOWRsTiditkZ2btnqAK8k5oCb7zzg__LpERybZdHef3lTzsoro5O-YuM-plBnC-d3AE-UHyl6kqLWAl-GuTr-bn8dUVh_rTjMy3D3dOsv-1RVaQgMZNU8fJGAD-uHftmxRIFiRGc-inU3NlHYSRnarl8SBl3dYxO0Xfvj0pvWw',
  e: 'AQAB',
  d: 'Gn5VYnCl_2gAGxhu-1uu338iASOZ6vWbcrBaWMf-23aBAK69fPUvUrdzMFrxO73b3l9bVqqCl5ZQ7T3ODLNT5t2qKsZNLGFuh0xx9GC_sey6jsbxkqwXL9rMrqhpBCxhVl4zvG3JKis2aoMOLIee9QQJFbPbDg7gs5r5UWEE7H2gqkJt4qgxAtohNZxQV6B1rUYyN8mho0ePZZkOqgyVysw1WRFTzT_TPef4udvWhc7ztNh4R8jBLRBi4tZW-NR8va6oldfIv-5NAF3gLZgxInnWmLsHApndsAp6MEz5A_FtbRKLsyHURuPX4o5As8OjJ6mPGuBYL-NzPwaGkqA-sQ',
  p: 'zQs6VJq-Hs-UbQOiyeLUiWAAaQYJornv9QDFxIesXbrpMY78CSnWcJ9MQRS1uCMhX9U72fpAqWf2cvWnUPkXYoS01cvg71PsQH3v4CODGx4XILz0uj-AljmYPCwyJMesSlA5U4NE_euwGg_7xvY78SYRgW8yEl382hVViv9MtRM',
  q: 'wzWQxVPAMOGxnuU6zfOi3NRNmzYcrfhkqB1dJ5c7q5ZqelIEImMAMlELWB6teDzUwpWCWhKS6z8vpm4FGA7XziZyh6H74-53GY1dC1JK4ZA_hA6bt5tUL1WozdmycrOMAgDkY2uiQ5zwM90dPIEH4nh2ToS6autC8Oihm1UGzZk',
  dp: 'bqBzLTh8ASWgAB0pFGGkqCW6su9F_ZzyQS7UhQ9qSPvSWyG5C7yd7Q-VVbu1u46AsDLc4uNpRb1Is4ekaUSrgET3SC6Cwr11xunrpPOkBdp7QfeQ1nfyiZqzbyutNjjg1QtpkoxNie5Cih07i4JInvgaE8qJqm05QfSmvaK2oS8',
  dq: 'scBo3wXwD5Kzxlg9P6QGPMclE5wmaVOxdFOoq5BOSWRh-JgOI7G6UBb0GX11v_LEWZsCYzpehc-3d_jespVxdMoVp-OcFmTiFmZevxxkCxjqfTlAGeRat-9sEmWU1FUhvAFL9ivgSWjyYIeLQ7jKkTHXqI-7n_gxsGRkI6k81KE',
  qi: 'HyVGsu5e--qAyz7zeUPgEV3jDxKdcttooDefeIsJ85MZBNBWnudV7xB0Km32q3HS674Yz1fxxCu-HoqEmPNHPMwrQfcF1avc_ajwexd22SJdS50lh4T18aFm9Sf6WrW-QluXQ47XZpI4g859QHwnS9RKVyJeSdGimaAZ-NCeAjs',
  kid: 'test-key',
  alg: 'RS256',
  use: 'sig',
}

interface TestAuthUser {
  id?: string
  email?: string
  name?: string
  scopes?: string[]
  permissions?: string[]
  roles?: string[]
  audience?: string
}

export async function getAuthToken(user: TestAuthUser = {}): Promise<string> {
  const userId = user.id ?? TEST_USER_ID
  const key = await importJWK(TEST_AUTH_PRIVATE_JWK, 'RS256')
  const scopes = user.scopes ?? ['sink:manage', 'links:read', 'links:write', 'analytics:read', 'sink:read']
  const permissions = user.permissions ?? ['links.read', 'links.write', 'analytics.read', 'sink.read']

  return await new SignJWT({
    email: user.email ?? `${userId}@example.com`,
    name: user.name ?? 'Test User',
    scope: scopes.join(' '),
    authorization: {
      scopes,
      roles: user.roles ?? ['admin'],
      permissions,
    },
    roles: user.roles ?? ['admin'],
    permissions,
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setIssuer(TEST_AUTH_ISSUER)
    .setAudience(user.audience ?? TEST_AUTH_AUDIENCE)
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key)
}

export async function getAuthHeader(user: TestAuthUser = {}): Promise<string> {
  return `Bearer ${await getAuthToken(user)}`
}

export async function fetchWithAuth(path: string, options?: RequestInit, user?: TestAuthUser): Promise<Response> {
  return SELF.fetch(`http://localhost${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: await getAuthHeader(user),
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
