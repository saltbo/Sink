import { afterEach, describe, expect, it, vi } from 'vitest'

interface Session {
  authenticated: boolean
}

interface RouteLike {
  path: string
  fullPath: string
}

async function loadMiddleware(session: Session, navigateTo = vi.fn()) {
  vi.resetModules()
  vi.stubGlobal('defineNuxtRouteMiddleware', (fn: (to: RouteLike) => Promise<unknown>) => fn)
  vi.stubGlobal('$fetch', vi.fn(async () => session))
  vi.stubGlobal('navigateTo', navigateTo)

  const mod = await import('../../layers/dashboard/app/middleware/auth.global')
  return { middleware: mod.default as (to: RouteLike) => Promise<unknown>, navigateTo }
}

describe('dashboard auth middleware', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated dashboard routes to login with returnTo', async () => {
    const navigateTo = vi.fn()
    const { middleware } = await loadMiddleware({ authenticated: false }, navigateTo)

    await middleware({
      path: '/dashboard/links',
      fullPath: '/dashboard/links?page=2',
    })

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/dashboard/login',
      query: { returnTo: '/dashboard/links?page=2' },
    })
  })

  it('does not redirect authenticated dashboard routes', async () => {
    const navigateTo = vi.fn()
    const { middleware } = await loadMiddleware({ authenticated: true }, navigateTo)

    await middleware({
      path: '/dashboard/links',
      fullPath: '/dashboard/links',
    })

    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('redirects authenticated login visits back to the dashboard', async () => {
    const navigateTo = vi.fn()
    const { middleware } = await loadMiddleware({ authenticated: true }, navigateTo)

    await middleware({
      path: '/dashboard/login',
      fullPath: '/dashboard/login',
    })

    expect(navigateTo).toHaveBeenCalledWith('/dashboard')
  })

  it('allows unauthenticated access to the login page', async () => {
    const navigateTo = vi.fn()
    const { middleware } = await loadMiddleware({ authenticated: false }, navigateTo)

    await middleware({
      path: '/dashboard/login',
      fullPath: '/dashboard/login',
    })

    expect(navigateTo).not.toHaveBeenCalled()
  })
})
