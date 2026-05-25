defineRouteMeta({
  openAPI: {
    description: 'Verify the current FlareAuth access token',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'The current access token is valid',
      },
      default: {
        description: 'The current access token is invalid',
      },
    },
  },
})

export default eventHandler(async (event) => {
  return {
    authenticated: true,
    user: event.context.auth?.user,
  }
})
