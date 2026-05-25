// Dashboard Layer - Client-side only rendering
export default defineNuxtConfig({
  ssr: false,

  routeRules: {
    '/dashboard': {
      redirect: '/dashboard/links',
    },
  },
})
