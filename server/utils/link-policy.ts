import type { H3Event } from 'h3'

type CounterType = 'quota' | 'rate'

interface CounterConfig {
  limit: number
  windowSeconds: number
}

const baselineReservedSlugs = [
  'api',
  'assets',
  '_assets',
  '_docs',
  '_nuxt',
  'auth',
  'dashboard',
  'docs',
  'login',
  'logout',
  'openapi',
  'scalar',
  'swagger',
] as const

export function assertSlugIsNotReserved(event: H3Event, slug: string): void {
  const { reserveSlug } = useAppConfig()
  const configured = String(useRuntimeConfig(event).reservedSlugs || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
  const reserved = new Set([...baselineReservedSlugs, ...reserveSlug, ...configured].map(value => value.toLowerCase()))
  if (!reserved.has(slug.toLowerCase()))
    return

  throw createError({
    status: 409,
    statusText: 'Slug is reserved',
  })
}

export async function reserveLinkCreateQuota(event: H3Event, count: number): Promise<void> {
  if (count < 1)
    return
  if (await addWithinLimit(event, 'quota', quotaConfig(event), count))
    return
  throw createError({
    status: 403,
    statusText: 'Link creation quota exceeded',
  })
}

export async function releaseLinkCreateQuota(event: H3Event, count: number): Promise<void> {
  if (count < 1)
    return

  const config = quotaConfig(event)
  const now = nowInSeconds()
  await database(event).prepare(`
    UPDATE link_create_counters
    SET count = max(0, count - ?), updated_at = ?
    WHERE owner_id = ? AND counter_type = 'quota' AND window_start = ?
  `).bind(count, now, getCurrentLinkOwnerId(event), windowStart(now, config.windowSeconds)).run()
}

export async function consumeLinkCreateRateLimit(event: H3Event, count = 1): Promise<void> {
  if (count < 1)
    return

  const config = rateConfig(event)
  const now = nowInSeconds()
  const start = windowStart(now, config.windowSeconds)
  const result = await database(event).prepare(`
    INSERT INTO link_create_counters (owner_id, counter_type, window_start, window_seconds, count, updated_at)
    VALUES (?, 'rate', ?, ?, ?, ?)
    ON CONFLICT(owner_id, counter_type)
    DO UPDATE SET
      window_start = excluded.window_start,
      window_seconds = excluded.window_seconds,
      count = CASE
        WHEN window_start = excluded.window_start THEN count + excluded.count
        ELSE excluded.count
      END,
      updated_at = excluded.updated_at
    RETURNING count
  `).bind(getCurrentLinkOwnerId(event), start, config.windowSeconds, count, now).first<{ count: number }>()

  if ((result?.count ?? count) <= config.limit)
    return

  setResponseHeader(event, 'Retry-After', Math.max(1, start + config.windowSeconds - now))
  throw createError({
    status: 429,
    statusText: 'Too many link creation requests',
  })
}

async function addWithinLimit(event: H3Event, counterType: CounterType, config: CounterConfig, count: number): Promise<boolean> {
  if (count > config.limit)
    return false

  const now = nowInSeconds()
  const result = await database(event).prepare(`
    INSERT INTO link_create_counters (owner_id, counter_type, window_start, window_seconds, count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(owner_id, counter_type)
    DO UPDATE SET
      window_start = excluded.window_start,
      window_seconds = excluded.window_seconds,
      count = CASE
        WHEN window_start = excluded.window_start THEN count + excluded.count
        ELSE excluded.count
      END,
      updated_at = excluded.updated_at
    WHERE window_start != excluded.window_start OR count + excluded.count <= ?
    RETURNING count
  `).bind(
    getCurrentLinkOwnerId(event),
    counterType,
    windowStart(now, config.windowSeconds),
    config.windowSeconds,
    count,
    now,
    config.limit,
  ).first<{ count: number }>()
  return result !== null
}

function quotaConfig(event: H3Event): CounterConfig {
  const config = useRuntimeConfig(event)
  return {
    limit: positiveInteger(config.linkCreateQuotaLimit, 'linkCreateQuotaLimit'),
    windowSeconds: positiveInteger(config.linkCreateQuotaWindowSeconds, 'linkCreateQuotaWindowSeconds'),
  }
}

function rateConfig(event: H3Event): CounterConfig {
  const config = useRuntimeConfig(event)
  return {
    limit: positiveInteger(config.linkCreateRateLimit, 'linkCreateRateLimit'),
    windowSeconds: positiveInteger(config.linkCreateRateLimitWindowSeconds, 'linkCreateRateLimitWindowSeconds'),
  }
}

function positiveInteger(value: unknown, name: string): number {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1)
    throw new Error(`${name} must be a positive integer`)
  return parsed
}

function database(event: H3Event): D1Database {
  return event.context.cloudflare.env.DB
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function windowStart(now: number, seconds: number): number {
  return Math.floor(now / seconds) * seconds
}
