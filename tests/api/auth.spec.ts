import { fetchMock, SELF } from 'cloudflare:test'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fetch, getAuthCookie, TEST_AUTH_SESSION_COOKIE, TEST_USER_ID } from '../utils'

const issuer = 'http://flareauth.test'
const authTransactionCookie = 'sink_oidc'

function jsonHeaders() {
  return { 'content-type': 'application/json' }
}

function encodeJson(value: unknown): string {
  const json = JSON.stringify(value)
  let bytes = ''
  for (const byte of new TextEncoder().encode(json))
    bytes += String.fromCharCode(byte)

  return btoa(bytes).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function unsignedIdToken(nonce: string): string {
  const now = Math.floor(Date.now() / 1000)
  return [
    encodeJson({ alg: 'none' }),
    encodeJson({
      iss: issuer,
      sub: TEST_USER_ID,
      aud: 'sink-test-client',
      exp: now + 300,
      iat: now,
      nonce,
      email: 'claims@example.com',
      name: 'Claims User',
    }),
    '',
  ].join('.')
}

function mockDiscovery(times = 1) {
  fetchMock
    .get(issuer)
    .intercept({ path: '/.well-known/openid-configuration' })
    .reply(200, {
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      userinfo_endpoint: `${issuer}/oauth/userinfo`,
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['none'],
      code_challenge_methods_supported: ['S256'],
    }, { headers: jsonHeaders() })
    .times(times)
}

function transactionCookie(response: Response): string {
  const setCookie = response.headers.get('set-cookie')
  expect(setCookie).toContain(authTransactionCookie)
  return setCookie!.split(', ').find(cookie => cookie.startsWith(authTransactionCookie))!.split(';')[0]
}

function sessionCookie(response: Response): string {
  const setCookie = response.headers.get('set-cookie')
  expect(setCookie).toContain(TEST_AUTH_SESSION_COOKIE)
  return setCookie!.split(', ').find(cookie => cookie.startsWith(TEST_AUTH_SESSION_COOKIE))!.split(';')[0]
}

describe('/api/auth', () => {
  beforeEach(() => {
    fetchMock.activate()
    fetchMock.disableNetConnect()
  })

  afterEach(() => {
    fetchMock.assertNoPendingInterceptors()
  })

  it('redirects to FlareAuth authorization endpoint with PKCE, state, and nonce', async () => {
    mockDiscovery()

    const response = await SELF.fetch('http://localhost/api/auth/login?returnTo=/dashboard/links', {
      redirect: 'manual',
    })
    expect(response.status).toBe(302)
    expect(response.headers.get('set-cookie')).toContain(authTransactionCookie)

    const location = new URL(response.headers.get('location')!)
    expect(location.origin).toBe(issuer)
    expect(location.pathname).toBe('/oauth/authorize')
    expect(location.searchParams.get('client_id')).toBe('sink-test-client')
    expect(location.searchParams.get('redirect_uri')).toBe('http://localhost/api/auth/callback')
    expect(location.searchParams.get('response_type')).toBe('code')
    expect(location.searchParams.get('scope')).toBe('openid email profile')
    expect(location.searchParams.get('code_challenge_method')).toBe('S256')
    expect(location.searchParams.get('code_challenge')).toBeTruthy()
    expect(location.searchParams.get('state')).toBeTruthy()
    expect(location.searchParams.get('nonce')).toBeTruthy()
  })

  it('does not preserve off-site return targets', async () => {
    mockDiscovery(2)

    const login = await SELF.fetch('http://localhost/api/auth/login?returnTo=https://evil.example', {
      redirect: 'manual',
    })
    const cookie = transactionCookie(login)
    const loginLocation = new URL(login.headers.get('location')!)
    const state = loginLocation.searchParams.get('state')!
    const nonce = loginLocation.searchParams.get('nonce')!

    fetchMock
      .get(issuer)
      .intercept({ method: 'POST', path: '/oauth/token' })
      .reply(200, {
        access_token: 'access-token',
        token_type: 'Bearer',
        expires_in: 300,
        id_token: unsignedIdToken(nonce),
      }, { headers: jsonHeaders() })

    fetchMock
      .get(issuer)
      .intercept({ path: '/oauth/userinfo' })
      .reply(200, {
        sub: TEST_USER_ID,
      }, { headers: jsonHeaders() })

    const callback = await SELF.fetch(`http://localhost/api/auth/callback?code=test-code&state=${state}`, {
      redirect: 'manual',
      headers: { Cookie: cookie },
    })

    expect(callback.status).toBe(302)
    expect(callback.headers.get('location')).toBe('/dashboard')
  })

  it('rejects invalid callback state', async () => {
    mockDiscovery(2)
    const login = await SELF.fetch('http://localhost/api/auth/login', { redirect: 'manual' })
    const cookie = transactionCookie(login)

    const response = await SELF.fetch('http://localhost/api/auth/callback?code=test-code&state=wrong-state', {
      redirect: 'manual',
      headers: { Cookie: cookie },
    })
    expect(response.status).toBe(401)
  })

  it('creates a session and returns safe user context after a valid callback', async () => {
    mockDiscovery(2)
    const login = await SELF.fetch('http://localhost/api/auth/login', { redirect: 'manual' })
    const cookie = transactionCookie(login)
    const loginLocation = new URL(login.headers.get('location')!)
    const state = loginLocation.searchParams.get('state')!
    const nonce = loginLocation.searchParams.get('nonce')!

    fetchMock
      .get(issuer)
      .intercept({
        method: 'POST',
        path: '/oauth/token',
        body: body => body.includes('code=test-code') && body.includes('code_verifier='),
      })
      .reply(200, {
        access_token: 'access-token',
        token_type: 'Bearer',
        expires_in: 300,
        id_token: unsignedIdToken(nonce),
      }, { headers: jsonHeaders() })

    fetchMock
      .get(issuer)
      .intercept({ path: '/oauth/userinfo' })
      .reply(200, {
        sub: TEST_USER_ID,
        email: 'test@example.com',
        name: 'Test User',
        roles: ['admin'],
      }, { headers: jsonHeaders() })

    const callback = await SELF.fetch(`http://localhost/api/auth/callback?code=test-code&state=${state}`, {
      redirect: 'manual',
      headers: { Cookie: cookie },
    })
    expect(callback.status).toBe(302)
    expect(callback.headers.get('location')).toBe('/dashboard')
    expect(callback.headers.get('set-cookie')).toContain(TEST_AUTH_SESSION_COOKIE)

    const me = await fetch('/api/auth/me', { headers: { Cookie: sessionCookie(callback) } })
    expect(me.status).toBe(200)
    await expect(me.json()).resolves.toEqual({
      authenticated: true,
      user: {
        id: TEST_USER_ID,
        email: 'test@example.com',
        name: 'Test User',
        roles: ['admin'],
      },
    })
  })

  it('returns logged-out auth state without a session', async () => {
    const response = await fetch('/api/auth/me')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      authenticated: false,
      user: null,
    })
  })

  it('rejects protected APIs without a valid session', async () => {
    const missing = await fetch('/api/link/list')
    expect(missing.status).toBe(401)

    const malformed = await fetch('/api/link/list', {
      headers: { Cookie: `${TEST_AUTH_SESSION_COOKIE}=x.%` },
    })
    expect(malformed.status).toBe(401)

    const valid = await fetch('/api/link/list', {
      headers: { Cookie: await getAuthCookie() },
    })
    expect(valid.status).toBe(200)
  })

  it('rejects cross-origin unsafe API requests before auth handling', async () => {
    const protectedResponse = await fetch('/api/link/create', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' }),
      headers: {
        'Content-Type': 'application/json',
        'Cookie': await getAuthCookie(),
        'Origin': 'https://evil.example',
      },
    })
    expect(protectedResponse.status).toBe(403)

    const logoutResponse = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Origin: 'https://evil.example' },
    })
    expect(logoutResponse.status).toBe(403)
  })
})
