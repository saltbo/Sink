import type { H3Event } from 'h3'

const publicApiPaths = new Set([
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/me',
])

const publicUnsafeApiPaths = new Set([
  '/api/auth/logout',
])

function isUnsafeMethod(method: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method)
}

function assertSameOrigin(event: H3Event): void {
  const origin = getHeader(event, 'Origin')
  if (!origin)
    return

  if (origin !== getRequestURL(event).origin) {
    throw createError({
      status: 403,
      statusText: 'Invalid request origin',
    })
  }
}

export default eventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  if (!pathname.startsWith('/api/'))
    return

  if (isUnsafeMethod(event.method))
    assertSameOrigin(event)

  if (publicApiPaths.has(pathname) || publicUnsafeApiPaths.has(pathname))
    return

  await requireAuthSession(event)
})
