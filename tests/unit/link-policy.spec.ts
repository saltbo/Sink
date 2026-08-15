import type { H3Event } from 'h3'
import { env } from 'cloudflare:test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assertSlugIsNotReserved,
  consumeLinkCreateRateLimit,
  releaseLinkCreateQuota,
  reserveLinkCreateQuota,
} from '../../server/utils/link-policy'

function createEvent(ownerId: string): H3Event {
  return {
    context: {
      ownerId,
      cloudflare: { env },
      responseHeaders: new Map<string, string>(),
    },
  } as H3Event
}

describe('link creation policy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-15T12:00:00Z'))
    vi.stubGlobal('useAppConfig', () => ({ reserveSlug: ['custom-app'] }))
    vi.stubGlobal('useRuntimeConfig', () => ({
      reservedSlugs: 'custom-runtime',
      linkCreateQuotaLimit: 2,
      linkCreateQuotaWindowSeconds: 3600,
      linkCreateRateLimit: 2,
      linkCreateRateLimitWindowSeconds: 60,
    }))
    vi.stubGlobal('getCurrentLinkOwnerId', (event: H3Event) => event.context.ownerId)
    vi.stubGlobal('setResponseHeader', (event: H3Event, name: string, value: number) => {
      event.context.responseHeaders.set(name, String(value))
    })
    vi.stubGlobal('createError', ({ status, statusText }: { status: number, statusText: string }) => {
      return Object.assign(new Error(statusText), { statusCode: status })
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('rejects built-in and configured reserved slugs', () => {
    const event = createEvent('owner-a')

    expect(() => assertSlugIsNotReserved(event, 'api')).toThrow('Slug is reserved')
    expect(() => assertSlugIsNotReserved(event, 'custom-app')).toThrow('Slug is reserved')
    expect(() => assertSlugIsNotReserved(event, 'custom-runtime')).toThrow('Slug is reserved')
    expect(() => assertSlugIsNotReserved(event, 'available')).not.toThrow()
  })

  it('tracks quota per owner and restores released capacity', async () => {
    const firstOwner = createEvent(`owner-a-${crypto.randomUUID()}`)
    const secondOwner = createEvent(`owner-b-${crypto.randomUUID()}`)

    await reserveLinkCreateQuota(firstOwner, 2)
    await expect(reserveLinkCreateQuota(firstOwner, 1)).rejects.toMatchObject({ statusCode: 403 })
    await reserveLinkCreateQuota(secondOwner, 2)
    await releaseLinkCreateQuota(firstOwner, 1)
    await expect(reserveLinkCreateQuota(firstOwner, 1)).resolves.toBeUndefined()
  })

  it('limits creation rate per owner and sets Retry-After', async () => {
    const event = createEvent(`owner-a-${crypto.randomUUID()}`)

    await consumeLinkCreateRateLimit(event)
    await consumeLinkCreateRateLimit(event)
    await expect(consumeLinkCreateRateLimit(event)).rejects.toMatchObject({ statusCode: 429 })
    expect(event.context.responseHeaders.get('Retry-After')).toBe('60')

    vi.advanceTimersByTime(60_000)
    await expect(consumeLinkCreateRateLimit(event)).resolves.toBeUndefined()
  })
})
