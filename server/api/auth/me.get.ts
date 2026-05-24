export default eventHandler(async (event) => {
  const session = await getAuthSession(event)

  return {
    authenticated: Boolean(session),
    user: session?.user ?? null,
  }
})
