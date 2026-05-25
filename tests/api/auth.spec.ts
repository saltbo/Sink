import { describe, expect, it } from 'vitest'
import { fetch, fetchWithAuth, getAuthHeader, getAuthToken } from '../utils'

describe('bearer token authentication', () => {
  it('accepts a FlareAuth JWT access token', async () => {
    const response = await fetchWithAuth('/api/verify')
    expect(response.status).toBe(200)

    await expect(response.json()).resolves.toMatchObject({
      authenticated: true,
      user: {
        id: 'test-user',
        scopes: expect.arrayContaining(['sink:manage']),
        permissions: expect.arrayContaining(['links.read']),
      },
    })
  })

  it('rejects requests without a bearer token', async () => {
    const response = await fetch('/api/link/list')
    expect(response.status).toBe(401)
  })

  it('rejects malformed bearer tokens', async () => {
    const response = await fetch('/api/link/list', {
      headers: { Authorization: 'Bearer not-a-jwt' },
    })
    expect(response.status).toBe(401)
  })

  it('rejects valid tokens without the route permission', async () => {
    const response = await fetch('/api/link/create', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/forbidden' }),
      headers: {
        'Authorization': await getAuthHeader({
          scopes: ['links:read'],
          permissions: ['links.read'],
        }),
        'Content-Type': 'application/json',
      },
    })

    expect(response.status).toBe(403)
  })

  it('rejects tokens with the wrong audience', async () => {
    const token = await getAuthToken({
      scopes: ['sink:manage'],
      audience: 'https://other.example/api',
    })

    const response = await fetch('/api/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(response.status).toBe(401)
  })
})
