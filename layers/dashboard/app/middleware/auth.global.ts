export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server)
    return

  if (to.path.startsWith('/dashboard') && to.path !== '/dashboard/login') {
    const session = await $fetch<{ authenticated: boolean }>('/api/auth/me', { credentials: 'same-origin' })
    if (!session.authenticated)
      return navigateTo({ path: '/dashboard/login', query: { returnTo: to.fullPath } })
  }

  if (to.path === '/dashboard/login') {
    const session = await $fetch<{ authenticated: boolean }>('/api/auth/me', { credentials: 'same-origin' })
    if (session.authenticated)
      return navigateTo('/dashboard')
  }
})
