import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import { loadEnv } from 'vite'

export default defineWorkersConfig(({ mode }) => ({
  test: {
    env: {
      NUXT_AUTH_ISSUER: 'http://flareauth.test',
      NUXT_AUTH_CLIENT_ID: 'sink-test-client',
      NUXT_AUTH_CLIENT_SECRET: 'sink-test-secret',
      NUXT_AUTH_REDIRECT_URI: 'http://localhost/api/auth/callback',
      NUXT_AUTH_SESSION_SECRET: 'test-session-secret',
      NUXT_AUTH_ALLOW_INSECURE: 'true',
      ...loadEnv(mode, process.cwd(), ''),
    },
    setupFiles: ['./tests/setup.ts'],
    poolOptions: {
      workers: {
        singleWorker: true,
        isolatedStorage: false,
        wrangler: {
          configPath: './wrangler.jsonc',
        },
        miniflare: {
          bindings: {
            NUXT_AUTH_ISSUER: 'http://flareauth.test',
            NUXT_AUTH_CLIENT_ID: 'sink-test-client',
            NUXT_AUTH_CLIENT_SECRET: 'sink-test-secret',
            NUXT_AUTH_REDIRECT_URI: 'http://localhost/api/auth/callback',
            NUXT_AUTH_SESSION_SECRET: 'test-session-secret',
            NUXT_AUTH_ALLOW_INSECURE: 'true',
          },
          cf: true,
        },
      },
    },
  },
}))
