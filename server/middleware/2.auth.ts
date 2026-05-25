export default eventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  if (!pathname.startsWith('/api/'))
    return

  if (event.method === 'OPTIONS')
    return

  event.context.auth = await authenticateBearerToken(event)
  authorizeApiRequest(event)
})
