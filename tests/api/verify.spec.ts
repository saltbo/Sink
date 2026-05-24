import { describe, expect, it } from 'vitest'
import { fetch, fetchWithAuth, TEST_USER_ID } from '../utils'

interface VerifyResponse {
  authenticated: boolean
  user: {
    id: string
    email?: string
    name?: string
    roles?: string[]
  }
}

describe('/api/verify', () => {
  it('returns user data with valid auth', async () => {
    const response = await fetchWithAuth('/api/verify')
    expect(response.status).toBe(200)

    const data = await response.json() as VerifyResponse
    expect(data.authenticated).toBe(true)
    expect(data.user.id).toBe(TEST_USER_ID)
    expect(data.user.email).toBe('test@example.com')
  })

  it('returns correct response structure', async () => {
    const response = await fetchWithAuth('/api/verify')
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toContain('application/json')

    const data = await response.json() as VerifyResponse
    expect(data.user.name).toBe('Test User')
    expect(data.user.roles).toEqual(['admin'])
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch('/api/verify')
    expect(response.status).toBe(401)
  })

  it('returns 401 with invalid session cookie', async () => {
    const response = await fetch('/api/verify', {
      headers: { Cookie: 'sink_session=invalid-token-12345' },
    })
    expect(response.status).toBe(401)
  })
})
