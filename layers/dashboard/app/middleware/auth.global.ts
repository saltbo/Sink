export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  if (to.path.startsWith('/dashboard') && to.path !== '/dashboard/login') {
    const session = await $fetch<{ authenticated: boolean }>('/api/auth/me', { credentials: 'same-origin' })
    if (!session.authenticated)
      return navigateTo(`/api/auth/login?returnTo=${encodeURIComponent(to.fullPath)}`, { external: true })
  }

  if (to.path === '/dashboard/login') {
    try {
      const session = await $fetch<{ authenticated: boolean }>('/api/auth/me', { credentials: 'same-origin' })
      if (session.authenticated)
        return navigateTo('/dashboard')
    }
    catch (e) {
      console.warn(e)
    }
  }
})
