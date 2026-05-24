import { describe, expect, it } from 'vitest'
import { fetch, fetchWithAuth, postJson, TEST_PNG_BYTES } from '../utils'

describe('/api/upload/image', () => {
  it('uploads image with valid file and slug', async () => {
    const slug = `test-upload-${crypto.randomUUID()}`
    const createResponse = await postJson('/api/link/create', {
      slug,
      url: 'https://example.com/test-upload',
    })
    expect(createResponse.status).toBe(201)

    const formData = new FormData()
    const file = new File([TEST_PNG_BYTES], 'test.png', { type: 'image/png' })
    formData.append('file', file)
    formData.append('slug', slug)

    const response = await fetchWithAuth('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(200)

    const data = await response.json() as { url: string, key: string }
    expect(data).toHaveProperty('url')
    expect(data).toHaveProperty('key')
    expect(data.url).toContain('/_assets/')
  })

  it('returns 404 when uploading for another user link', async () => {
    const slug = `test-upload-other-${crypto.randomUUID()}`
    const createResponse = await postJson('/api/link/create', {
      slug,
      url: 'https://example.com/test-upload-other',
    }, true, { id: 'other-upload-owner' })
    expect(createResponse.status).toBe(201)

    const formData = new FormData()
    const file = new File([TEST_PNG_BYTES], 'test.png', { type: 'image/png' })
    formData.append('file', file)
    formData.append('slug', slug)

    const response = await fetchWithAuth('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(404)
  })

  it('returns 400 when file is missing', async () => {
    const formData = new FormData()
    formData.append('slug', 'test-slug')

    const response = await fetchWithAuth('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(400)
  })

  it('returns 400 when slug is missing', async () => {
    const formData = new FormData()
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    formData.append('file', file)

    const response = await fetchWithAuth('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid file type', async () => {
    const formData = new FormData()
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)
    formData.append('slug', 'test-slug')

    const response = await fetchWithAuth('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(400)
  })

  it('returns 400 for file exceeding 5MB limit', async () => {
    const formData = new FormData()
    const largeContent = new Uint8Array(5 * 1024 * 1024 + 1)
    const file = new File([largeContent], 'large.png', { type: 'image/png' })
    formData.append('file', file)
    formData.append('slug', 'test-slug')

    const response = await fetchWithAuth('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid slug format', async () => {
    const formData = new FormData()
    const file = new File([TEST_PNG_BYTES], 'test.png', { type: 'image/png' })
    formData.append('file', file)
    formData.append('slug', 'invalid<>slug/path')

    const response = await fetchWithAuth('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(400)
  })

  it('returns 401 when accessing without auth', async () => {
    const formData = new FormData()
    formData.append('slug', 'test-slug')

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    expect(response.status).toBe(401)
  })
})
