import { describe, expect, it } from 'vitest'
import { fetch } from '../utils'

interface OpenApiOperation {
  security?: Record<string, unknown[]>[]
}

interface OpenApiDocument {
  components?: {
    securitySchemes?: Record<string, unknown>
  }
  paths?: Record<string, Record<string, OpenApiOperation>>
}

function operation(document: OpenApiDocument, path: string, method: string): OpenApiOperation {
  const route = document.paths?.[path]
  expect(route).toBeDefined()

  const routeOperation = route?.[method]
  expect(routeOperation).toBeDefined()

  return routeOperation!
}

describe('/_docs/openapi.json', () => {
  it('documents bearer auth for protected management APIs', async () => {
    const response = await fetch('/_docs/openapi.json')

    expect(response.status).toBe(200)

    const document = await response.json() as OpenApiDocument
    expect(document.components?.securitySchemes).toHaveProperty('bearerAuth')
    expect(document.components?.securitySchemes).not.toHaveProperty('sessionCookie')

    expect(operation(document, '/api/link/create', 'post').security).toEqual([{ bearerAuth: [] }])
    expect(operation(document, '/api/link/list', 'get').security).toEqual([{ bearerAuth: [] }])
    expect(operation(document, '/api/stats/counters', 'get').security).toEqual([{ bearerAuth: [] }])
    expect(operation(document, '/api/logs/events', 'get').security).toEqual([{ bearerAuth: [] }])
    expect(operation(document, '/api/verify', 'get').security).toEqual([{ bearerAuth: [] }])
  })
})
