import { env } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { deleteStoredLink, fetch, getStoredD1Link, getStoredLink, postJson } from '../utils'

describe.sequential('d1 link repository projection', () => {
  it('creates links in D1 and projects them to KV', async () => {
    const slug = `d1-create-${crypto.randomUUID()}`
    const url = 'https://example.com/d1-create'

    const response = await postJson('/api/link/create', { slug, url })
    expect(response.status).toBe(201)

    const storedD1Link = await getStoredD1Link(slug)
    expect(storedD1Link?.owner_id).toBe('site-token')
    expect(storedD1Link?.status).toBe('active')
    expect(storedD1Link?.url).toBe(url)

    const storedKvLink = await getStoredLink(slug)
    expect(storedKvLink?.url).toBe(url)

    await deleteStoredLink(slug)
  })

  it('hydrates KV from D1 on public redirect cache miss', async () => {
    const slug = `d1-hydrate-${crypto.randomUUID()}`
    const url = 'https://example.com/d1-hydrate'

    const createResponse = await postJson('/api/link/create', { slug, url })
    expect(createResponse.status).toBe(201)
    await deleteStoredLink(slug)

    const recreateResponse = await postJson('/api/link/create', { slug, url })
    expect(recreateResponse.status).toBe(201)
    await env.KV.delete(`link:${slug}`)
    expect(await getStoredLink(slug)).toBeNull()

    const redirectResponse = await fetch(`/${slug}`, { redirect: 'manual' })
    expect(redirectResponse.status).toBe(301)
    expect(redirectResponse.headers.get('Location')).toBe(url)
    expect(await getStoredLink(slug)).toMatchObject({ slug, url })

    await deleteStoredLink(slug)
  })

  it('does not hydrate expired D1 links after KV expiration', async () => {
    const slug = `d1-expired-${crypto.randomUUID()}`
    const url = 'https://example.com/d1-expired'
    const futureExpiration = Math.floor(Date.now() / 1000) + 3600

    const createResponse = await postJson('/api/link/create', { slug, url, expiration: futureExpiration })
    expect(createResponse.status).toBe(201)

    await env.DB.prepare('UPDATE links SET expiration = ? WHERE slug = ?').bind(Math.floor(Date.now() / 1000) - 1, slug).run()
    await env.KV.delete(`link:${slug}`)

    const redirectResponse = await fetch(`/${slug}`, { redirect: 'manual' })
    expect(redirectResponse.status).toBe(404)
    expect(await getStoredLink(slug)).toBeNull()

    await deleteStoredLink(slug)
  })

  it('allows recreating a slug after D1 expiration', async () => {
    const slug = `d1-recreate-expired-${crypto.randomUUID()}`
    const firstUrl = 'https://example.com/d1-recreate-expired-first'
    const secondUrl = 'https://example.com/d1-recreate-expired-second'
    const futureExpiration = Math.floor(Date.now() / 1000) + 3600

    const createResponse = await postJson('/api/link/create', { slug, url: firstUrl, expiration: futureExpiration })
    expect(createResponse.status).toBe(201)

    await env.DB.prepare('UPDATE links SET expiration = ? WHERE slug = ?').bind(Math.floor(Date.now() / 1000) - 1, slug).run()
    await env.KV.delete(`link:${slug}`)

    const recreateResponse = await postJson('/api/link/create', { slug, url: secondUrl })
    expect(recreateResponse.status).toBe(201)
    expect(await getStoredLink(slug)).toMatchObject({ slug, url: secondUrl })

    const storedD1Links = await env.DB.prepare('SELECT status, url FROM links WHERE slug = ?').bind(slug).all<{ status: string, url: string }>()
    expect(storedD1Links.results).toHaveLength(2)
    expect(storedD1Links.results).toEqual(expect.arrayContaining([
      { status: 'deleted', url: firstUrl },
      { status: 'active', url: secondUrl },
    ]))

    await deleteStoredLink(slug)
  })

  it('imports legacy KV projections before allowing duplicate creates', async () => {
    const slug = `legacy-kv-${crypto.randomUUID()}`
    const legacyUrl = 'https://example.com/legacy-kv'
    const now = Math.floor(Date.now() / 1000)

    await env.KV.put(`link:${slug}`, JSON.stringify({
      id: `legacy-${slug.slice(0, 18)}`,
      slug,
      url: legacyUrl,
      createdAt: now,
      updatedAt: now,
    }))

    const response = await postJson('/api/link/create', { slug, url: 'https://example.com/new-link' })
    expect(response.status).toBe(409)

    const storedD1Link = await getStoredD1Link(slug)
    expect(storedD1Link?.url).toBe(legacyUrl)
    expect(await getStoredLink(slug)).toMatchObject({ slug, url: legacyUrl })

    await deleteStoredLink(slug)
  })

  it('includes legacy KV projections in owner-scoped management lists', async () => {
    const slug = `legacy-list-${crypto.randomUUID()}`
    const legacyUrl = 'https://example.com/legacy-list'
    const now = Math.floor(Date.now() / 1000)

    await env.KV.put(`link:${slug}`, JSON.stringify({
      id: `legacy-${slug.slice(0, 18)}`,
      slug,
      url: legacyUrl,
      createdAt: now,
      updatedAt: now,
    }))

    const response = await fetch('/api/link/list?limit=999', {
      headers: {
        Authorization: 'Bearer test-token',
      },
    })
    expect(response.status).toBe(200)

    const data = await response.json() as { links: Array<{ slug: string, url: string }> }
    expect(data.links).toContainEqual(expect.objectContaining({ slug, url: legacyUrl }))
    expect(await getStoredD1Link(slug)).toMatchObject({ slug, url: legacyUrl })

    await deleteStoredLink(slug)
  })

  it('soft-deletes D1 links and removes the KV projection', async () => {
    const slug = `d1-delete-${crypto.randomUUID()}`
    const url = 'https://example.com/d1-delete'

    const createResponse = await postJson('/api/link/create', { slug, url })
    expect(createResponse.status).toBe(201)

    const deleteResponse = await postJson('/api/link/delete', { slug })
    expect(deleteResponse.status).toBe(204)

    const storedD1Link = await getStoredD1Link(slug)
    expect(storedD1Link?.status).toBe('deleted')
    expect(storedD1Link?.deleted_at).toEqual(expect.any(Number))
    expect(await getStoredLink(slug)).toBeNull()

    await deleteStoredLink(slug)
  })

  it('allows recreating a slug after soft delete', async () => {
    const slug = `d1-recreate-${crypto.randomUUID()}`
    const firstUrl = 'https://example.com/d1-recreate-first'
    const secondUrl = 'https://example.com/d1-recreate-second'

    const createResponse = await postJson('/api/link/create', { slug, url: firstUrl })
    expect(createResponse.status).toBe(201)

    const deleteResponse = await postJson('/api/link/delete', { slug })
    expect(deleteResponse.status).toBe(204)

    const recreateResponse = await postJson('/api/link/create', { slug, url: secondUrl })
    expect(recreateResponse.status).toBe(201)
    expect(await getStoredLink(slug)).toMatchObject({ slug, url: secondUrl })

    const storedD1Links = await env.DB.prepare('SELECT status, url FROM links WHERE slug = ?').bind(slug).all<{ status: string, url: string }>()
    expect(storedD1Links.results).toHaveLength(2)
    expect(storedD1Links.results).toEqual(expect.arrayContaining([
      { status: 'deleted', url: firstUrl },
      { status: 'active', url: secondUrl },
    ]))

    await deleteStoredLink(slug)
  })
})
