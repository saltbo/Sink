import { env, fetchMock } from 'cloudflare:test'
import { beforeAll, describe, expect, it } from 'vitest'
import { fetch, fetchWithAuth, getStoredD1Link, postJson, TEST_USER_ID } from '../utils'

const analyticsSlugs = {
  primary: `stats-primary-${crypto.randomUUID()}`,
  secondary: `stats-secondary-${crypto.randomUUID()}`,
}

let primaryLinkId: string
let secondaryLinkId: string
let otherOwnerLinkId: string
let otherOwnerSlug: string
let analyticsQueries: string[]

beforeAll(async () => {
  analyticsQueries = []
  fetchMock.activate()
  fetchMock
    .get('https://api.cloudflare.com')
    .intercept({ method: 'POST', path: '/client/v4/accounts//analytics_engine/sql' })
    .reply(200, (request: { body?: unknown }) => {
      analyticsQueries.push(String(request.body))
      return { data: [] }
    })
    .times(100)

  const primaryResponse = await postJson('/api/link/create', {
    slug: analyticsSlugs.primary,
    url: 'https://example.com/stats-primary',
  })
  expect(primaryResponse.status).toBe(201)
  const primaryData = await primaryResponse.json() as { link: { id: string } }
  primaryLinkId = primaryData.link.id

  const secondaryResponse = await postJson('/api/link/create', {
    slug: analyticsSlugs.secondary,
    url: 'https://example.com/stats-secondary',
  })
  expect(secondaryResponse.status).toBe(201)
  const secondaryData = await secondaryResponse.json() as { link: { id: string } }
  secondaryLinkId = secondaryData.link.id

  otherOwnerSlug = `stats-other-${crypto.randomUUID()}`
  const otherOwnerResponse = await postJson('/api/link/create', {
    slug: otherOwnerSlug,
    url: 'https://example.com/stats-other',
  }, true, { id: 'other-stats-owner' })
  expect(otherOwnerResponse.status).toBe(201)
  const otherOwnerData = await otherOwnerResponse.json() as { link: { id: string } }
  otherOwnerLinkId = otherOwnerData.link.id
})

describe('/api/stats/counters', () => {
  it('returns counters data with valid auth', async () => {
    const response = await fetchWithAuth(`/api/stats/counters?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(analyticsQueries.at(-1)).toContain(`index1 IN ('${primaryLinkId}')`)
    expect(analyticsQueries.at(-1)).toContain(`blob1 IN ('${analyticsSlugs.primary}')`)
  })

  it('returns counters with time filter', async () => {
    const now = Math.floor(Date.now() / 1000)
    const response = await fetchWithAuth(`/api/stats/counters?slug=${analyticsSlugs.secondary}&startAt=${now - 86400}&endAt=${now}`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(analyticsQueries.at(-1)).toContain(`index1 IN ('${secondaryLinkId}')`)
    expect(analyticsQueries.at(-1)).not.toContain(otherOwnerLinkId)
  })

  it('returns data without slug filter', async () => {
    const response = await fetchWithAuth('/api/stats/counters')

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(analyticsQueries.at(-1)).toContain(primaryLinkId)
    expect(analyticsQueries.at(-1)).not.toContain(otherOwnerLinkId)
  })

  it('rejects another user link id before querying stats', async () => {
    const response = await fetchWithAuth(`/api/stats/counters?id=${otherOwnerLinkId}`)

    expect(response.status).toBe(404)
  })

  it('rejects another user link slug before querying stats', async () => {
    const response = await fetchWithAuth(`/api/stats/counters?slug=${otherOwnerSlug}`)

    expect(response.status).toBe(404)
  })

  it('rejects mixed owner id lists before querying stats', async () => {
    const response = await fetchWithAuth(`/api/stats/counters?id=${primaryLinkId},${otherOwnerLinkId}`)

    expect(response.status).toBe(404)
  })

  it('rejects mixed owner slug lists before querying stats', async () => {
    const response = await fetchWithAuth(`/api/stats/counters?slug=${analyticsSlugs.primary},${otherOwnerSlug}`)

    expect(response.status).toBe(404)
  })

  it('accepts duplicate owner id filters with whitespace', async () => {
    const response = await fetchWithAuth(`/api/stats/counters?id=${primaryLinkId}, ${primaryLinkId}`)

    expect(response.status).toBe(200)
  })

  it('accepts duplicate normalized owner slug filters with whitespace', async () => {
    const response = await fetchWithAuth(`/api/stats/counters?slug=${analyticsSlugs.primary.toUpperCase()}, ${analyticsSlugs.primary}`)

    expect(response.status).toBe(200)
  })

  it('migrates legacy KV-only links before slug-scoped analytics queries', async () => {
    const slug = `stats-legacy-${crypto.randomUUID()}`
    const legacyLinkId = `legacy-${slug.slice(0, 18)}`
    const now = Math.floor(Date.now() / 1000)
    await env.KV.put(`link:${slug}`, JSON.stringify({
      id: legacyLinkId,
      slug,
      url: 'https://example.com/stats-legacy',
      createdAt: now,
      updatedAt: now,
    }))

    const response = await fetchWithAuth(`/api/stats/counters?slug=${slug}`)

    expect(response.status).toBe(200)
    expect(analyticsQueries.at(-1)).toContain(`index1 IN ('${legacyLinkId}')`)

    const storedLink = await getStoredD1Link(slug)
    expect(storedLink?.owner_id).toBe(TEST_USER_ID)
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch(`/api/stats/counters?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(401)
  })
})

describe('/api/stats/metrics', () => {
  it('returns metrics data with valid auth and type', async () => {
    const response = await fetchWithAuth(`/api/stats/metrics?slug=${analyticsSlugs.primary}&type=browser`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
  })

  it('returns metrics for different types', async () => {
    const types = ['browser', 'os', 'device', 'country', 'referer']

    for (const type of types) {
      const response = await fetchWithAuth(`/api/stats/metrics?slug=${analyticsSlugs.secondary}&type=${type}`)
      expect(response.status).toBe(200)
    }
  })

  it('returns 400 for invalid metric type', async () => {
    const response = await fetchWithAuth(`/api/stats/metrics?slug=${analyticsSlugs.primary}&type=invalid`)

    expect(response.status).toBe(400)
  })

  it('returns 400 when type parameter is missing', async () => {
    const response = await fetchWithAuth(`/api/stats/metrics?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(400)
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch(`/api/stats/metrics?slug=${analyticsSlugs.primary}&type=browser`)

    expect(response.status).toBe(401)
  })

  it('rejects another user link id before querying metrics', async () => {
    const response = await fetchWithAuth(`/api/stats/metrics?id=${otherOwnerLinkId}&type=browser`)

    expect(response.status).toBe(404)
  })
})

describe('/api/stats/views', () => {
  it('returns views data with valid auth and unit', async () => {
    const response = await fetchWithAuth(`/api/stats/views?slug=${analyticsSlugs.primary}&unit=day`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
  })

  it('returns views for different units', async () => {
    const units = ['minute', 'hour', 'day']

    for (const unit of units) {
      const response = await fetchWithAuth(`/api/stats/views?slug=${analyticsSlugs.secondary}&unit=${unit}`)
      expect(response.status).toBe(200)
    }
  })

  it('supports clientTimezone parameter', async () => {
    const response = await fetchWithAuth(`/api/stats/views?slug=${analyticsSlugs.primary}&unit=day&clientTimezone=Asia/Shanghai`)

    expect(response.status).toBe(200)
  })

  it('supports offset-style clientTimezone values', async () => {
    const response = await fetchWithAuth(`/api/stats/views?slug=${analyticsSlugs.primary}&unit=day&clientTimezone=Etc/GMT-8`)

    expect(response.status).toBe(200)
  })

  it('returns 400 for invalid clientTimezone format', async () => {
    const response = await fetchWithAuth(`/api/stats/views?slug=${analyticsSlugs.primary}&unit=day&clientTimezone=invalid<>timezone`)

    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid unit', async () => {
    const response = await fetchWithAuth(`/api/stats/views?slug=${analyticsSlugs.primary}&unit=invalid`)

    expect(response.status).toBe(400)
  })

  it('returns 400 when unit parameter is missing', async () => {
    const response = await fetchWithAuth(`/api/stats/views?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(400)
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch(`/api/stats/views?slug=${analyticsSlugs.primary}&unit=day`)

    expect(response.status).toBe(401)
  })

  it('rejects another user link slug before querying views', async () => {
    const response = await fetchWithAuth(`/api/stats/views?slug=${otherOwnerSlug}&unit=day`)

    expect(response.status).toBe(404)
  })
})

describe('/api/stats/heatmap', () => {
  it('supports clientTimezone parameter', async () => {
    const response = await fetchWithAuth('/api/stats/heatmap?clientTimezone=Asia/Shanghai')

    expect(response.status).toBe(200)
  })

  it('supports offset-style clientTimezone values', async () => {
    const response = await fetchWithAuth('/api/stats/heatmap?clientTimezone=Etc/GMT-8')

    expect(response.status).toBe(200)
  })

  it('returns 400 for invalid clientTimezone format', async () => {
    const response = await fetchWithAuth('/api/stats/heatmap?clientTimezone=invalid<>timezone')

    expect(response.status).toBe(400)
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch('/api/stats/heatmap?clientTimezone=Asia/Shanghai')

    expect(response.status).toBe(401)
  })

  it('rejects another user link id before querying heatmap', async () => {
    const response = await fetchWithAuth(`/api/stats/heatmap?id=${otherOwnerLinkId}`)

    expect(response.status).toBe(404)
  })
})

describe('/api/stats/export', () => {
  it('returns CSV with valid auth', async () => {
    const response = await fetchWithAuth('/api/stats/export')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')

    const csv = await response.text()
    expect(csv.replace(/^\uFEFF/, '').split('\n')[0]).toBe('slug,url,viewer,views,referer')
  })

  it('supports time filter', async () => {
    const now = Math.floor(Date.now() / 1000)
    const response = await fetchWithAuth(`/api/stats/export?startAt=${now - 86400}&endAt=${now}`)

    expect(response.status).toBe(200)
  })

  it('supports slug filter', async () => {
    const response = await fetchWithAuth(`/api/stats/export?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(200)
  })

  it('supports owned id filter', async () => {
    const response = await fetchWithAuth(`/api/stats/export?id=${primaryLinkId}`)

    expect(response.status).toBe(200)
  })

  it('supports multiple owned id filters', async () => {
    const response = await fetchWithAuth(`/api/stats/export?id=${primaryLinkId},${secondaryLinkId}`)

    expect(response.status).toBe(200)
  })

  it('rejects another user link slug before exporting stats', async () => {
    const response = await fetchWithAuth(`/api/stats/export?slug=${otherOwnerSlug}`)

    expect(response.status).toBe(404)
  })

  it('returns 400 for invalid time range', async () => {
    const now = Math.floor(Date.now() / 1000)
    const response = await fetchWithAuth(`/api/stats/export?startAt=${now}&endAt=${now - 86400}`)

    expect(response.status).toBe(400)
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch('/api/stats/export')

    expect(response.status).toBe(401)
  })
})
