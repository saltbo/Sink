import { LinkSchema } from '#shared/schemas/link'

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        securitySchemes: {
          sessionCookie: {
            type: 'apiKey',
            in: 'cookie',
            name: 'sink_session',
            description: 'Authenticated app session cookie',
          },
        },
      },
    },
    description: 'Create a new short link',
    security: [{ sessionCookie: [] }],
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
})

export default eventHandler(async (event) => {
  const link = await readValidatedBody(event, LinkSchema.parse)
  const ownerId = getCurrentLinkOwnerId(event)

  await prepareIncomingLink(event, link)

  if (await activeSlugExists(event, link.slug) || await getOwnerLink(event, ownerId, link.slug)) {
    throw createError({
      status: 409,
      statusText: 'Link already exists',
    })
  }

  await hashLinkPasswordForCreate(link)

  const createdLink = await createOwnerLink(event, ownerId, link)
  setResponseStatus(event, 201)
  return buildLinkResponse(event, createdLink)
})
