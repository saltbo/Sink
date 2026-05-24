defineRouteMeta({
  openAPI: {
    description: 'Verify the current app session',
    responses: {
      200: {
        description: 'The current app session is valid',
      },
      default: {
        description: 'The current app session is invalid',
      },
    },
  },
})

export default eventHandler(async (event) => {
  const session = await requireAuthSession(event)

  return {
    authenticated: true,
    user: session.user,
  }
})
