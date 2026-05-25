import type { H3Event } from 'h3'
import { createError, getRequestURL } from 'h3'

interface AuthPolicy {
  scope?: string[]
  permission?: string[]
}

const fullAccess = ['sink:manage']

const apiPolicies: Array<{ pattern: RegExp, policy: AuthPolicy }> = [
  { pattern: /^\/api\/link\/(?:list|query|search|export)$/, policy: { scope: ['links:read'], permission: ['links.read'] } },
  { pattern: /^\/api\/link\/(?:create|edit|delete|import|upsert|check|ai|og-ai)$/, policy: { scope: ['links:write'], permission: ['links.write'] } },
  { pattern: /^\/api\/logs\/.+$/, policy: { scope: ['analytics:read'], permission: ['analytics.read'] } },
  { pattern: /^\/api\/stats\/.+$/, policy: { scope: ['analytics:read'], permission: ['analytics.read'] } },
  { pattern: /^\/api\/upload\/image$/, policy: { scope: ['links:write'], permission: ['links.write'] } },
  { pattern: /^\/api\/backup$/, policy: { scope: ['links:write'], permission: ['links.write'] } },
  { pattern: /^\/api\/location$/, policy: { scope: ['sink:read'], permission: ['sink.read'] } },
  { pattern: /^\/api\/verify$/, policy: { scope: ['sink:read'], permission: ['sink.read'] } },
]

export function authorizeApiRequest(event: H3Event): void {
  const auth = event.context.auth
  if (!auth)
    throw createError({ status: 401, statusText: 'Unauthorized' })

  const policy = apiPolicies.find(item => item.pattern.test(getRequestURL(event).pathname))?.policy
  if (!policy)
    return

  if (hasAny(auth.user.scopes, [...fullAccess, ...(policy.scope ?? [])]))
    return

  if (hasAny(auth.user.permissions, [...fullAccess, ...(policy.permission ?? [])]))
    return

  throw createError({
    status: 403,
    statusText: 'Forbidden',
  })
}

function hasAny(actual: string[], expected: string[]): boolean {
  return expected.some(item => actual.includes(item))
}
