import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import { loadEnv } from 'vite'

export default defineWorkersConfig(({ mode }) => ({
  test: {
    env: {
      NUXT_SITE_TOKEN: 'test-token',
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
            NUXT_SITE_TOKEN: 'test-token',
          },
          cf: true,
        },
      },
    },
  },
}))
