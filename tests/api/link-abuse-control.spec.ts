import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { getStoredD1Link, postJson } from '../utils'

const defaultQuotaLimit = 1000
const defaultQuotaWindowSeconds = 60 * 60 * 24
const defaultRateLimit = 120
const defaultRateWindowSeconds = 60

function windowStart(windowSeconds: number): number {
  return Math.floor(Math.floor(Date.now() / 1000) / windowSeconds) * windowSeconds
}

async function seedCreateCounter(ownerId: string, counterType: 'quota' | 'rate', count: number, windowSeconds: number): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  await env.DB.prepare(`
    INSERT INTO link_create_counters (owner_id, counter_type, window_start, window_seconds, count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(owner_id, counter_type, window_start)
    DO UPDATE SET count = excluded.count, window_seconds = excluded.window_seconds, updated_at = excluded.updated_at
  `)
    .bind(ownerId, counterType, windowStart(windowSeconds), windowSeconds, count, now)
    .run()
}

describe.sequential('link creation abuse controls', () => {
  it('rejects reserved slugs through create and upsert APIs', async () => {
    const createResponse = await postJson('/api/link/create', {
      url: 'https://example.com/reserved-create',
      slug: 'api',
    }, true, { id: `reserved-create-${crypto.randomUUID()}` })
    expect(createResponse.status).toBe(409)

    const upsertResponse = await postJson('/api/link/upsert', {
      url: 'https://example.com/reserved-upsert',
      slug: 'swagger',
    }, true, { id: `reserved-upsert-${crypto.randomUUID()}` })
    expect(upsertResponse.status).toBe(409)

    expect(await getStoredD1Link('api')).toBeNull()
    expect(await getStoredD1Link('swagger')).toBeNull()
  })

  it('does not import reserved slugs', async () => {
    const ownerId = `reserved-import-${crypto.randomUUID()}`
    const response = await postJson('/api/link/import', {
      version: '1.0',
      links: [
        {
          url: 'https://example.com/reserved-import',
          slug: 'dashboard',
        },
      ],
    }, true, { id: ownerId })
    expect(response.status).toBe(200)

    const data = await response.json() as { failed: number, failedItems: Array<{ slug: string, reason: string }> }
    expect(data.failed).toBe(1)
    expect(data.failedItems[0]).toMatchObject({ slug: 'dashboard', reason: 'Slug is reserved' })
    expect(await getStoredD1Link('dashboard')).toBeNull()
  })

  it('rejects users who exceed the create quota', async () => {
    const ownerId = `quota-${crypto.randomUUID()}`
    await seedCreateCounter(ownerId, 'quota', defaultQuotaLimit, defaultQuotaWindowSeconds)

    const response = await postJson('/api/link/create', {
      url: 'https://example.com/quota',
      slug: `quota-${crypto.randomUUID()}`,
    }, true, { id: ownerId })
    expect(response.status).toBe(403)
  })

  it('rejects new upserts when the create quota is exhausted', async () => {
    const ownerId = `upsert-quota-${crypto.randomUUID()}`
    await seedCreateCounter(ownerId, 'quota', defaultQuotaLimit, defaultQuotaWindowSeconds)

    const response = await postJson('/api/link/upsert', {
      url: 'https://example.com/upsert-quota',
      slug: `upsert-quota-${crypto.randomUUID()}`,
    }, true, { id: ownerId })
    expect(response.status).toBe(403)
  })

  it('rejects abusive repeated creation over the short-window rate limit', async () => {
    const ownerId = `rate-${crypto.randomUUID()}`
    await seedCreateCounter(ownerId, 'rate', defaultRateLimit, defaultRateWindowSeconds)

    const response = await postJson('/api/link/create', {
      url: 'https://example.com/rate',
      slug: `rate-${crypto.randomUUID()}`,
    }, true, { id: ownerId })
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeTruthy()
  })

  it('allows existing-link upserts even when quota and rate limits are exhausted', async () => {
    const ownerId = `upsert-existing-${crypto.randomUUID()}`
    const slug = `upsert-existing-${crypto.randomUUID()}`

    const createResponse = await postJson('/api/link/create', {
      url: 'https://example.com/upsert-existing-initial',
      slug,
    }, true, { id: ownerId })
    expect(createResponse.status).toBe(201)

    await seedCreateCounter(ownerId, 'quota', defaultQuotaLimit, defaultQuotaWindowSeconds)
    await seedCreateCounter(ownerId, 'rate', defaultRateLimit, defaultRateWindowSeconds)

    const upsertResponse = await postJson('/api/link/upsert', {
      url: 'https://example.com/upsert-existing-updated',
      slug,
    }, true, { id: ownerId })
    expect(upsertResponse.status).toBe(200)

    const storedLink = await getStoredD1Link(slug)
    expect(storedLink?.slug).toBe(slug)
  })

  it('rejects imports when the create quota is exhausted', async () => {
    const ownerId = `import-quota-${crypto.randomUUID()}`
    await seedCreateCounter(ownerId, 'quota', defaultQuotaLimit, defaultQuotaWindowSeconds)

    const response = await postJson('/api/link/import', {
      version: '1.0',
      links: [
        {
          url: 'https://example.com/import-quota',
          slug: `import-quota-${crypto.randomUUID()}`,
        },
      ],
    }, true, { id: ownerId })
    expect(response.status).toBe(403)
  })

  it('does not double charge quota for duplicate slugs in one import', async () => {
    const ownerId = `import-duplicate-${crypto.randomUUID()}`
    await seedCreateCounter(ownerId, 'quota', defaultQuotaLimit - 2, defaultQuotaWindowSeconds)

    const duplicateSlug = `import-duplicate-${crypto.randomUUID()}`
    const response = await postJson('/api/link/import', {
      version: '1.0',
      links: [
        {
          url: 'https://example.com/import-duplicate-a',
          slug: duplicateSlug,
        },
        {
          url: 'https://example.com/import-duplicate-b',
          slug: duplicateSlug,
        },
      ],
    }, true, { id: ownerId })
    expect(response.status).toBe(200)

    const data = await response.json() as { success: number, failed: number }
    expect(data.success).toBe(1)
    expect(data.failed).toBe(1)

    const remainingQuotaResponse = await postJson('/api/link/create', {
      url: 'https://example.com/import-duplicate-next',
      slug: `import-duplicate-next-${crypto.randomUUID()}`,
    }, true, { id: ownerId })
    expect(remainingQuotaResponse.status).toBe(201)

    const exceededQuotaResponse = await postJson('/api/link/create', {
      url: 'https://example.com/import-duplicate-exceeded',
      slug: `import-duplicate-exceeded-${crypto.randomUUID()}`,
    }, true, { id: ownerId })
    expect(exceededQuotaResponse.status).toBe(403)
  })

  it('weights import requests by submitted link count for rate limiting', async () => {
    const ownerId = `import-rate-${crypto.randomUUID()}`
    await seedCreateCounter(ownerId, 'rate', defaultRateLimit - 1, defaultRateWindowSeconds)

    const firstSlug = `import-rate-a-${crypto.randomUUID()}`
    const secondSlug = `import-rate-b-${crypto.randomUUID()}`
    const response = await postJson('/api/link/import', {
      version: '1.0',
      links: [
        {
          url: 'https://example.com/import-rate-a',
          slug: firstSlug,
        },
        {
          url: 'https://example.com/import-rate-b',
          slug: secondSlug,
        },
      ],
    }, true, { id: ownerId })
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeTruthy()
    expect(await getStoredD1Link(firstSlug)).toBeNull()
    expect(await getStoredD1Link(secondSlug)).toBeNull()
  })

  it('still creates a normal valid link', async () => {
    const slug = `normal-${crypto.randomUUID()}`
    const response = await postJson('/api/link/create', {
      url: 'https://example.com/normal',
      slug,
    }, true, { id: `normal-${crypto.randomUUID()}` })
    expect(response.status).toBe(201)

    const storedLink = await getStoredD1Link(slug)
    expect(storedLink?.slug).toBe(slug)
  })
})
