defineRouteMeta({
  openAPI: {
    description: 'Search all links (returns slug, url, comment for each link)',
    security: [{ sessionCookie: [] }],
  },
})

export default eventHandler(async (event) => {
  return await searchOwnerLinks(event, getCurrentLinkOwnerId(event))
})
