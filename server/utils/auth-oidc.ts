import type { H3Event } from 'h3'
import type { IDToken, UserInfoResponse } from 'openid-client'
import type { CurrentUser } from './auth-session'
import { createError, getRequestURL } from 'h3'
import * as client from 'openid-client'
import { isAuthAllowInsecure } from './auth-config'

function getRequiredConfig(event: H3Event, key: 'authIssuer' | 'authClientId' | 'authRedirectUri'): string {
  const value = useRuntimeConfig(event)[key]
  if (!value) {
    throw createError({
      status: 500,
      statusText: `${key} is not configured`,
    })
  }
  return value
}

export function getAuthRedirectUri(event: H3Event): string {
  return getRequiredConfig(event, 'authRedirectUri')
}

export async function getOidcClient(event: H3Event): Promise<client.Configuration> {
  const config = useRuntimeConfig(event)
  return await client.discovery(
    new URL(getRequiredConfig(event, 'authIssuer')),
    getRequiredConfig(event, 'authClientId'),
    {
      client_secret: config.authClientSecret || undefined,
      redirect_uris: [getAuthRedirectUri(event)],
      response_types: ['code'],
    },
    config.authClientSecret ? client.ClientSecretPost(config.authClientSecret) : client.None(),
    {
      execute: isAuthAllowInsecure(config.authAllowInsecure) ? [client.allowInsecureRequests] : undefined,
    },
  )
}

export function getCurrentUrl(event: H3Event): URL {
  return getRequestURL(event)
}

export function normalizeAuthReturnTo(returnTo?: string): string {
  if (!returnTo)
    return '/dashboard'

  if (!returnTo.startsWith('/') || returnTo.startsWith('//'))
    return '/dashboard'

  return returnTo.startsWith('/dashboard') ? returnTo : '/dashboard'
}

function stringClaim(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

function rolesClaim(value: unknown): string[] | undefined {
  if (Array.isArray(value) && value.every(item => typeof item === 'string'))
    return value

  if (typeof value === 'string' && value)
    return [value]

  return undefined
}

export function safeUserFromClaims(claims: IDToken, userInfo?: UserInfoResponse): CurrentUser {
  const roles = rolesClaim(userInfo?.roles)
    ?? rolesClaim(claims.roles)
    ?? rolesClaim(userInfo?.groups)
    ?? rolesClaim(claims.groups)
    ?? rolesClaim(userInfo?.role)
    ?? rolesClaim(claims.role)

  return {
    id: claims.sub,
    email: stringClaim(userInfo?.email) ?? stringClaim(claims.email),
    name: stringClaim(userInfo?.name) ?? stringClaim(claims.name) ?? stringClaim(userInfo?.preferred_username) ?? stringClaim(claims.preferred_username),
    roles,
  }
}

export { client as oidc }
