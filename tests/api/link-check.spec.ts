import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { deleteStoredLink, postJson } from '../utils'

describe.sequential('/api/link/check', () => {
  it('reads the authoritative link from D1 when the KV projection is missing', async () => {
    const slug = `check-d1-${crypto.randomUUID()}`
    const url = 'https://localhost/not-allowed-for-check'

    const createResponse = await postJson('/api/link/create', { slug, url })
    expect(createResponse.status).toBe(201)

    await env.KV.delete(`link:${slug}`)

    const response = await postJson('/api/link/check', {
      links: [{ slug, url: 'https://irrelevant.example/request-payload-url' }],
      timeout: 1,
    })
    expect(response.status).toBe(200)

    const data = await response.json() as {
      results: Array<{ slug: string, url: string, ok: boolean, status: number, error?: string }>
    }
    expect(data.results).toHaveLength(1)
    expect(data.results[0]).toMatchObject({
      slug,
      url,
      ok: false,
      status: 0,
      error: 'URL is not allowed for server-side checking',
    })

    await deleteStoredLink(slug)
  })
})
