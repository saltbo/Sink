export default eventHandler(async (event) => {
  const config = await getOidcClient(event)
  const codeVerifier = oidc.randomPKCECodeVerifier()
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier)
  const state = oidc.randomState()
  const nonce = oidc.randomNonce()
  const returnTo = normalizeAuthReturnTo(getQuery(event).returnTo?.toString())

  await setOidcTransaction(event, {
    codeVerifier,
    state,
    nonce,
    returnTo,
    expiresAt: Math.floor(Date.now() / 1000) + 10 * 60,
  })

  return sendRedirect(event, oidc.buildAuthorizationUrl(config, {
    redirect_uri: getAuthRedirectUri(event),
    response_type: 'code',
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    nonce,
  }).href)
})
