import type { H3Event } from 'h3'

type CounterType = 'quota' | 'rate'

const baselineReservedSlugs = [
  'api',
  'auth',
  '_assets',
  'assets',
  '_docs',
  'dashboard',
  'docs',
  'image',
  'login',
  'logout',
  'openapi',
  'scalar',
  'swagger',
  '_nuxt',
  '_ipx',
  'favicon',
  'manifest',
  'robots',
  'sitemap',
] as const

interface CounterConfig {
  limit: number
  windowSeconds: number
}

function getDb(event: H3Event): D1Database {
  return event.context.cloudflare.env.DB
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function parsePositiveInteger(value: unknown, name: string): number {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1)
    throw new Error(`${name} must be a positive integer`)

  return number
}

function getQuotaConfig(event: H3Event): CounterConfig {
  const config = useRuntimeConfig(event)
  return {
    limit: parsePositiveInteger(config.linkCreateQuotaLimit, 'linkCreateQuotaLimit'),
    windowSeconds: parsePositiveInteger(config.linkCreateQuotaWindowSeconds, 'linkCreateQuotaWindowSeconds'),
  }
}

function getRateConfig(event: H3Event): CounterConfig {
  const config = useRuntimeConfig(event)
  return {
    limit: parsePositiveInteger(config.linkCreateRateLimit, 'linkCreateRateLimit'),
    windowSeconds: parsePositiveInteger(config.linkCreateRateLimitWindowSeconds, 'linkCreateRateLimitWindowSeconds'),
  }
}

function getWindowStart(now: number, windowSeconds: number): number {
  return Math.floor(now / windowSeconds) * windowSeconds
}

function getReservedSlugs(event: H3Event): Set<string> {
  const { reserveSlug } = useAppConfig()
  const configuredSlugs = String(useRuntimeConfig(event).reservedSlugs || '')
    .split(',')
    .map(slug => slug.trim())
    .filter(Boolean)

  return new Set([...baselineReservedSlugs, ...reserveSlug, ...configuredSlugs].map(slug => slug.toLowerCase()))
}

export function isReservedSlug(event: H3Event, slug: string): boolean {
  return getReservedSlugs(event).has(slug.toLowerCase())
}

export function assertSlugIsNotReserved(event: H3Event, slug: string): void {
  if (!isReservedSlug(event, slug))
    return

  throw createError({
    status: 409,
    statusText: 'Slug is reserved',
  })
}

async function getCounter(event: H3Event, ownerId: string, counterType: CounterType, windowStart: number): Promise<number> {
  const row = await getDb(event)
    .prepare(`
      SELECT count
      FROM link_create_counters
      WHERE owner_id = ? AND counter_type = ? AND window_start = ?
    `)
    .bind(ownerId, counterType, windowStart)
    .first<{ count: number }>()

  return row?.count ?? 0
}

async function addCounter(event: H3Event, ownerId: string, counterType: CounterType, config: CounterConfig, count: number): Promise<{ count: number, windowStart: number }> {
  const now = nowInSeconds()
  const windowStart = getWindowStart(now, config.windowSeconds)

  await getDb(event)
    .prepare(`
      INSERT INTO link_create_counters (owner_id, counter_type, window_start, window_seconds, count, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(owner_id, counter_type, window_start)
      DO UPDATE SET count = count + excluded.count, window_seconds = excluded.window_seconds, updated_at = excluded.updated_at
    `)
    .bind(ownerId, counterType, windowStart, config.windowSeconds, count, now)
    .run()

  return {
    count: await getCounter(event, ownerId, counterType, windowStart),
    windowStart,
  }
}

async function addCounterWithinLimit(event: H3Event, ownerId: string, counterType: CounterType, config: CounterConfig, count: number): Promise<boolean> {
  if (count > config.limit)
    return false

  const now = nowInSeconds()
  const windowStart = getWindowStart(now, config.windowSeconds)
  const result = await getDb(event)
    .prepare(`
      INSERT INTO link_create_counters (owner_id, counter_type, window_start, window_seconds, count, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(owner_id, counter_type, window_start)
      DO UPDATE SET count = count + excluded.count, window_seconds = excluded.window_seconds, updated_at = excluded.updated_at
      WHERE count + excluded.count <= ?
      RETURNING count
    `)
    .bind(ownerId, counterType, windowStart, config.windowSeconds, count, now, config.limit)
    .first<{ count: number }>()

  return result !== null
}

async function subtractCounter(event: H3Event, ownerId: string, counterType: CounterType, config: CounterConfig, count: number): Promise<void> {
  const now = nowInSeconds()
  const windowStart = getWindowStart(now, config.windowSeconds)
  await getDb(event)
    .prepare(`
      UPDATE link_create_counters
      SET count = max(0, count - ?), updated_at = ?
      WHERE owner_id = ? AND counter_type = ? AND window_start = ?
    `)
    .bind(count, now, ownerId, counterType, windowStart)
    .run()
}

export async function reserveLinkCreateQuota(event: H3Event, ownerId: string, count: number): Promise<void> {
  if (count < 1)
    return

  const config = getQuotaConfig(event)
  if (await addCounterWithinLimit(event, ownerId, 'quota', config, count))
    return

  throw createError({
    status: 403,
    statusText: 'Link creation quota exceeded',
  })
}

export async function releaseLinkCreateQuota(event: H3Event, ownerId: string, count: number): Promise<void> {
  if (count < 1)
    return

  await subtractCounter(event, ownerId, 'quota', getQuotaConfig(event), count)
}

export async function consumeLinkCreateRateLimit(event: H3Event, ownerId: string, weight = 1): Promise<void> {
  if (weight < 1)
    return

  const config = getRateConfig(event)
  const result = await addCounter(event, ownerId, 'rate', config, weight)

  if (result.count <= config.limit)
    return

  const retryAfter = result.windowStart + config.windowSeconds - nowInSeconds()
  setResponseHeader(event, 'Retry-After', Math.max(1, retryAfter))

  throw createError({
    status: 429,
    statusText: 'Too many link creation requests',
  })
}
