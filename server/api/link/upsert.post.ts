import { LinkSchema } from '#shared/schemas/link'

const UpsertLinkSchema = LinkSchema.omit({
  id: true,
  ownerId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
})

defineRouteMeta({
  openAPI: {
    description: 'Create or update a short link (upsert)',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['url'],
            properties: {
              url: { type: 'string', description: 'The target URL' },
              slug: { type: 'string', description: 'Custom slug (auto-generated if not provided)' },
              comment: { type: 'string', description: 'Optional comment' },
              expiration: { type: 'integer', description: 'Expiration timestamp (unix seconds)' },
              title: { type: 'string', description: 'Custom title for link preview' },
              description: { type: 'string', description: 'Custom description for link preview' },
              image: { type: 'string', description: 'Custom image for link preview' },
              apple: { type: 'string', description: 'Apple App Store redirect URL' },
              google: { type: 'string', description: 'Google Play Store redirect URL' },
              unsafe: { type: 'boolean', description: 'Mark link as unsafe, showing a warning page before redirect' },
              geo: { type: 'object', additionalProperties: { type: 'string' }, description: 'Geo-routing rules (country code to URL)' },
            },
          },
        },
      },
    },
  },
})

export default eventHandler(async (event) => {
  const linkInput = await readValidatedBody(event, UpsertLinkSchema.parse)
  const link = LinkSchema.parse(linkInput)
  const ownerId = getCurrentLinkOwnerId(event)

  await prepareIncomingLink(event, link)

  const existingLink = await getOwnerLink(event, ownerId, link.slug)
  if (existingLink) {
    return { ...buildLinkResponse(event, existingLink), status: 'existing' }
  }

  if (await activeSlugExists(event, link.slug)) {
    throw createError({
      status: 409,
      statusText: 'Link already exists',
    })
  }

  await hashLinkPasswordForCreate(link)

  const createdLink = await createOwnerLink(event, ownerId, link)
  setResponseStatus(event, 201)
  return { ...buildLinkResponse(event, createdLink), status: 'created' }
})
