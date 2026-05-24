export default eventHandler((event) => {
  clearAuthSession(event)
  clearOidcTransaction(event)
  return {
    authenticated: false,
    user: null,
  }
})
