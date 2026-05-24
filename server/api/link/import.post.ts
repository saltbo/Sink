import type { ImportResult } from '#shared/schemas/import'
import type { Link } from '#shared/schemas/link'
import { ImportDataSchema } from '#shared/schemas/import'
import { nanoid } from '#shared/schemas/link'

interface ImportCandidate {
  index: number
  link: Link
}

function getImportErrorReason(error: unknown): string {
  if (!(error instanceof Error))
    return 'Unknown error'

  if ('statusText' in error && typeof error.statusText === 'string' && error.statusText)
    return error.statusText

  return error.message || 'Unknown error'
}

defineRouteMeta({
  openAPI: {
    description: 'Import links from exported data',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['version', 'links'],
            properties: {
              version: { type: 'string', description: 'Export format version' },
              exportedAt: { type: 'string', description: 'Export timestamp (ISO 8601)' },
              count: { type: 'integer', description: 'Number of links in export' },
              links: {
                type: 'array',
                description: 'Array of links to import',
                items: {
                  type: 'object',
                  required: ['url', 'slug'],
                  properties: {
                    url: { type: 'string', description: 'The target URL' },
                    slug: { type: 'string', description: 'The slug for the short link' },
                    comment: { type: 'string', description: 'Optional comment' },
                    createdAt: { type: 'integer', description: 'Creation timestamp (unix seconds)' },
                    updatedAt: { type: 'integer', description: 'Last update timestamp (unix seconds)' },
                    expiration: { type: 'integer', description: 'Expiration timestamp (unix seconds)' },
                    title: { type: 'string', description: 'Custom title for link preview' },
                    description: { type: 'string', description: 'Custom description for link preview' },
                    image: { type: 'string', description: 'Custom image for link preview' },
                    apple: { type: 'string', description: 'Apple App Store redirect URL' },
                    google: { type: 'string', description: 'Google Play Store redirect URL' },
                    cloaking: { type: 'boolean', description: 'Enable link cloaking (mask destination URL)' },
                    redirectWithQuery: { type: 'boolean', description: 'Append query parameters to destination URL' },
                    password: { type: 'string', description: 'Password protection for the link' },
                    unsafe: { type: 'boolean', description: 'Mark link as unsafe, showing a warning page before redirect' },
                    geo: { type: 'object', additionalProperties: { type: 'string' }, description: 'Geo-routing rules (country code to URL)' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
})

export default eventHandler(async (event) => {
  const kvBatchLimit = useRuntimeConfig(event).public.kvBatchLimit as string
  const maxLinks = Math.floor(+kvBatchLimit / 2)

  const importData = await readValidatedBody(event, ImportDataSchema.parse)
  const ownerId = getCurrentLinkOwnerId(event)

  if (importData.links.length > maxLinks) {
    throw createError({
      status: 400,
      statusText: `Too many links. Maximum ${maxLinks} links per request.`,
    })
  }

  await consumeLinkCreateRateLimit(event, ownerId, importData.links.length)

  const result: ImportResult = {
    success: 0,
    skipped: 0,
    failed: 0,
    successItems: [],
    skippedItems: [],
    failedItems: [],
  }

  const candidates: ImportCandidate[] = []
  for (let i = 0; i < importData.links.length; i++) {
    const linkData = importData.links[i]

    if (!linkData) {
      result.failed++
      result.failedItems.push({
        index: i,
        slug: '',
        url: '',
        reason: 'Missing link data',
      })
      continue
    }

    try {
      const slug = normalizeSlug(event, linkData.slug)
      if (isReservedSlug(event, slug)) {
        result.failedItems.push({ index: i, slug, url: linkData.url, reason: 'Slug is reserved' })
        result.failed++
        continue
      }

      if (await getOwnerLink(event, ownerId, slug) || await activeSlugExists(event, slug)) {
        result.skippedItems.push({ index: i, slug, url: linkData.url })
        result.skipped++
        continue
      }

      const now = Math.floor(Date.now() / 1000)
      const link = {
        ...linkData,
        id: nanoid(10)(),
        slug,
        createdAt: linkData.createdAt || now,
        updatedAt: linkData.updatedAt || now,
      }

      if (link.password) {
        link.password = await normalizeLinkPasswordForStorage(link.password)
      }

      candidates.push({ index: i, link })
    }
    catch (error) {
      result.failed++
      result.failedItems.push({
        index: i,
        slug: linkData.slug,
        url: linkData.url,
        reason: getImportErrorReason(error),
      })
    }
  }

  await reserveLinkCreateQuota(event, ownerId, candidates.length)

  let createdCount = 0
  for (const candidate of candidates) {
    try {
      const createdLink = await createOwnerLink(event, ownerId, candidate.link)
      createdCount++
      result.successItems.push({ index: candidate.index, slug: createdLink.slug, url: createdLink.url })
      result.success++
    }
    catch (error) {
      const persistedLink = await getOwnerLink(event, ownerId, candidate.link.slug)
      if (persistedLink?.id === candidate.link.id)
        createdCount++

      result.failed++
      result.failedItems.push({
        index: candidate.index,
        slug: candidate.link.slug,
        url: candidate.link.url,
        reason: getImportErrorReason(error),
      })
    }
  }

  await releaseLinkCreateQuota(event, ownerId, candidates.length - createdCount)

  setResponseHeader(event, 'Cache-Control', 'no-store')

  return result
})
