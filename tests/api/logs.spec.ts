import { fetchMock } from 'cloudflare:test'
import { beforeAll, describe, expect, it } from 'vitest'
import { fetch, fetchWithAuth, postJson } from '../utils'

const analyticsSlugs = {
  primary: `logs-primary-${crypto.randomUUID()}`,
  secondary: `logs-secondary-${crypto.randomUUID()}`,
}

let primaryLinkId: string
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
    url: 'https://example.com/logs-primary',
  })
  expect(primaryResponse.status).toBe(201)
  const primaryData = await primaryResponse.json() as { link: { id: string } }
  primaryLinkId = primaryData.link.id

  const secondaryResponse = await postJson('/api/link/create', {
    slug: analyticsSlugs.secondary,
    url: 'https://example.com/logs-secondary',
  })
  expect(secondaryResponse.status).toBe(201)

  otherOwnerSlug = `logs-other-${crypto.randomUUID()}`
  const otherOwnerResponse = await postJson('/api/link/create', {
    slug: otherOwnerSlug,
    url: 'https://example.com/logs-other',
  }, true, { id: 'other-logs-owner' })
  expect(otherOwnerResponse.status).toBe(201)
  const otherOwnerData = await otherOwnerResponse.json() as { link: { id: string } }
  otherOwnerLinkId = otherOwnerData.link.id
})

describe('/api/logs/events', () => {
  it('returns events data with valid auth', async () => {
    const response = await fetchWithAuth(`/api/logs/events?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toBeInstanceOf(Array)
    expect(analyticsQueries.at(-1)).toContain(`index1 IN ('${primaryLinkId}')`)
    expect(analyticsQueries.at(-1)).not.toContain(otherOwnerLinkId)
  })

  it('returns events with time filter', async () => {
    const now = Math.floor(Date.now() / 1000)
    const response = await fetchWithAuth(`/api/logs/events?slug=${analyticsSlugs.secondary}&startAt=${now - 86400}&endAt=${now}`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toBeInstanceOf(Array)
  })

  it('supports limit parameter', async () => {
    const response = await fetchWithAuth(`/api/logs/events?slug=${analyticsSlugs.primary}&limit=10`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toBeInstanceOf(Array)
  })

  it('returns data without slug filter', async () => {
    const response = await fetchWithAuth('/api/logs/events')

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toBeInstanceOf(Array)
  })

  it('rejects another user link id before querying logs', async () => {
    const response = await fetchWithAuth(`/api/logs/events?id=${otherOwnerLinkId}`)

    expect(response.status).toBe(404)
  })

  it('rejects another user link slug before querying logs', async () => {
    const response = await fetchWithAuth(`/api/logs/events?slug=${otherOwnerSlug}`)

    expect(response.status).toBe(404)
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch(`/api/logs/events?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(401)
  })
})

describe('/api/logs/locations', () => {
  it('returns locations data with valid auth', async () => {
    const response = await fetchWithAuth(`/api/logs/locations?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
  })

  it('returns locations with time filter', async () => {
    const now = Math.floor(Date.now() / 1000)
    const response = await fetchWithAuth(`/api/logs/locations?slug=${analyticsSlugs.secondary}&startAt=${now - 86400}&endAt=${now}`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
  })

  it('supports limit parameter', async () => {
    const response = await fetchWithAuth(`/api/logs/locations?slug=${analyticsSlugs.primary}&limit=10`)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
  })

  it('returns data without slug filter', async () => {
    const response = await fetchWithAuth('/api/logs/locations')

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('data')
  })

  it('rejects another user link id before querying locations', async () => {
    const response = await fetchWithAuth(`/api/logs/locations?id=${otherOwnerLinkId}`)

    expect(response.status).toBe(404)
  })

  it('rejects another user link slug before querying locations', async () => {
    const response = await fetchWithAuth(`/api/logs/locations?slug=${otherOwnerSlug}`)

    expect(response.status).toBe(404)
  })

  it('returns 401 when accessing without auth', async () => {
    const response = await fetch(`/api/logs/locations?slug=${analyticsSlugs.primary}`)

    expect(response.status).toBe(401)
  })
})
