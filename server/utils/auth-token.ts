import type { H3Event } from 'h3'
import type { JWK, JWTPayload } from 'jose'
import { createError, getHeader } from 'h3'
import { createLocalJWKSet, createRemoteJWKSet, jwtVerify } from 'jose'

interface JwksDocument {
  keys: JWK[]
}

interface OidcDiscoveryDocument {
  issuer: string
  jwks_uri: string
}

export interface CurrentUser {
  id: string
  email?: string
  name?: string
  roles: string[]
  permissions: string[]
  scopes: string[]
}

export interface TokenAuthContext {
  token: string
  issuer: string
  audience: string
  claims: JWTPayload
  user: CurrentUser
}

type JwksResolver = ReturnType<typeof createRemoteJWKSet> | ReturnType<typeof createLocalJWKSet>

const remoteJwksCache = new Map<string, JwksResolver>()
const localJwksCache = new Map<string, JwksResolver>()
const discoveryCache = new Map<string, Promise<OidcDiscoveryDocument>>()

export async function authenticateBearerToken(event: H3Event): Promise<TokenAuthContext> {
  const token = getBearerToken(event)
  const config = getAuthResourceConfig(event)
  const { payload } = await verifyToken(event, token, config)
  const user = userFromClaims(payload)

  if (!user) {
    throw createError({
      status: 401,
      statusText: 'Bearer token must include a subject',
    })
  }

  return {
    token,
    issuer: config.issuer,
    audience: config.audience,
    claims: payload,
    user,
  }
}

function getBearerToken(event: H3Event): string {
  const authorization = getHeader(event, 'Authorization')
  const [scheme, token] = (authorization?.trim() ?? '').split(' ')
  const match = scheme?.toLowerCase() === 'bearer' && token ? token : ''
  if (!match) {
    throw createError({
      status: 401,
      statusText: 'Bearer token is required',
    })
  }
  return match
}

function getAuthResourceConfig(event: H3Event) {
  const config = useRuntimeConfig(event)
  const issuer = stringConfig(config.authIssuer) || cloudflareString(event, 'NUXT_AUTH_ISSUER')
  const audience = stringConfig(config.authAudience) || cloudflareString(event, 'NUXT_AUTH_AUDIENCE')

  if (!issuer || !audience) {
    throw createError({
      status: 500,
      statusText: 'FlareAuth issuer and audience must be configured',
    })
  }

  return {
    issuer: issuer.replace(/\/$/, ''),
    audience,
    algorithms: stringList(config.authJwtAlgorithms) || stringList(cloudflareString(event, 'NUXT_AUTH_JWT_ALGORITHMS')),
  }
}

async function verifyToken(
  event: H3Event,
  token: string,
  config: ReturnType<typeof getAuthResourceConfig>,
) {
  try {
    return await jwtVerify(token, await getJwksResolver(event, config.issuer), {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: config.algorithms.length ? config.algorithms : undefined,
    })
  }
  catch {
    throw createError({
      status: 401,
      statusText: 'Invalid bearer token',
    })
  }
}

async function getJwksResolver(event: H3Event, issuer: string): Promise<JwksResolver> {
  const localJwksJson = stringConfig(useRuntimeConfig(event).authJwksJson) || cloudflareString(event, 'NUXT_AUTH_JWKS_JSON')
  if (localJwksJson) {
    const cached = localJwksCache.get(localJwksJson)
    if (cached)
      return cached

    const jwks = JSON.parse(localJwksJson) as JwksDocument
    const resolver = createLocalJWKSet(jwks)
    localJwksCache.set(localJwksJson, resolver)
    return resolver
  }

  const discovery = await getDiscovery(issuer)
  const cached = remoteJwksCache.get(discovery.jwks_uri)
  if (cached)
    return cached

  const resolver = createRemoteJWKSet(new URL(discovery.jwks_uri))
  remoteJwksCache.set(discovery.jwks_uri, resolver)
  return resolver
}

async function getDiscovery(issuer: string): Promise<OidcDiscoveryDocument> {
  const cached = discoveryCache.get(issuer)
  if (cached)
    return cached

  const pending = fetch(`${issuer}/.well-known/openid-configuration`)
    .then(async (response) => {
      if (!response.ok)
        throw new Error(`OIDC discovery failed with ${response.status}`)

      const discovery = await response.json() as OidcDiscoveryDocument
      if (discovery.issuer !== issuer || !discovery.jwks_uri)
        throw new Error('OIDC discovery document is invalid')

      return discovery
    })
    .catch((error) => {
      discoveryCache.delete(issuer)
      throw error
    })

  discoveryCache.set(issuer, pending)
  return pending
}

function userFromClaims(claims: JWTPayload): CurrentUser | null {
  if (typeof claims.sub !== 'string' || !claims.sub)
    return null

  const authorization = objectClaim(claims.authorization)

  return {
    id: claims.sub,
    email: stringClaim(claims.email),
    name: stringClaim(claims.name) ?? stringClaim(claims.preferred_username),
    scopes: dedupe([...scopeClaim(claims.scope), ...arrayClaim(authorization?.scopes)]),
    roles: dedupe([...arrayClaim(claims.roles), ...arrayClaim(authorization?.roles)]),
    permissions: dedupe([...arrayClaim(claims.permissions), ...arrayClaim(authorization?.permissions)]),
  }
}

function stringConfig(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cloudflareString(event: H3Event, key: string): string {
  const env = event.context.cloudflare?.env as unknown as Record<string, unknown> | undefined
  const value = env?.[key]
  return typeof value === 'string' ? value.trim() : ''
}

function stringClaim(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

function objectClaim(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function arrayClaim(value: unknown): string[] {
  if (Array.isArray(value))
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0)

  if (typeof value === 'string' && value)
    return [value]

  return []
}

function scopeClaim(value: unknown): string[] {
  return typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : arrayClaim(value)
}

function stringList(value: unknown): string[] {
  return typeof value === 'string'
    ? value.split(',').map(item => item.trim()).filter(Boolean)
    : []
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)]
}
