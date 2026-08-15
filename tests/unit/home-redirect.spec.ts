import { describe, expect, it } from 'vitest'
import { shouldRedirectHome } from '../../server/utils/home-redirect'

describe('homepage redirect', () => {
  const requestUrl = new URL('https://to.example/')

  it('does not redirect the homepage to itself', () => {
    expect(shouldRedirectHome(requestUrl, 'https://to.example')).toBe(false)
    expect(shouldRedirectHome(requestUrl, 'https://to.example/#dashboard')).toBe(false)
  })

  it('redirects to a different destination', () => {
    expect(shouldRedirectHome(requestUrl, 'https://example.com')).toBe(true)
    expect(shouldRedirectHome(requestUrl, '/dashboard')).toBe(true)
  })

  it('shows the homepage when no redirect is configured', () => {
    expect(shouldRedirectHome(requestUrl, '')).toBe(false)
  })
})
