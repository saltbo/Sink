export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  if (to.path.startsWith('/dashboard') && !['/dashboard/login', '/dashboard/callback'].includes(to.path)) {
    const user = await getFlareAuthUser()
    if (!user)
      return navigateTo({ path: '/dashboard/login', query: { returnTo: to.fullPath } })
  }

  if (to.path === '/dashboard/login') {
    const user = await getFlareAuthUser()
    if (user)
      return navigateTo('/dashboard')
  }
})
