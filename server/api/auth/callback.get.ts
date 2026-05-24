export default eventHandler(async (event) => {
  const transaction = await getOidcTransaction(event)
  clearOidcTransaction(event)

  if (!transaction) {
    throw createError({
      status: 401,
      statusText: 'Invalid auth state',
    })
  }

  const config = await getOidcClient(event)
  const tokens = await oidc.authorizationCodeGrant(config, getCurrentUrl(event), {
    pkceCodeVerifier: transaction.codeVerifier,
    expectedState: transaction.state,
    expectedNonce: transaction.nonce,
  }).catch(() => {
    throw createError({
      status: 401,
      statusText: 'Invalid auth callback',
    })
  })
  const claims = tokens.claims()
  if (!claims) {
    throw createError({
      status: 401,
      statusText: 'Missing ID token',
    })
  }

  const userInfo = config.serverMetadata().userinfo_endpoint
    ? await oidc.fetchUserInfo(config, tokens.access_token, claims.sub)
    : undefined
  const user = safeUserFromClaims(claims, userInfo)

  await upsertLocalUser(event, user.id)
  await setAuthSession(event, {
    user,
    issuer: claims.iss,
    expiresAt: Math.floor(Date.now() / 1000) + Number(useRuntimeConfig(event).authSessionTtlSeconds),
  })

  return sendRedirect(event, transaction.returnTo)
})
