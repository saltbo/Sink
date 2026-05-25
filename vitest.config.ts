import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'
import { loadEnv } from 'vite'

const testJwks = JSON.stringify({
  keys: [{
    kty: 'RSA',
    n: 'nFp0teLq6HaSXRlh_fyX8cDqlx_QYtbEpWvjKghtz3uBAdCzKJCvYewsKhjjLUcP-xhQXLbiAr28QtLSzis28GIi0dYWyrFvMy0kmoPou3liK4MQA0QGdBfNgIs7DSYv3-Zp9vPLtymIBwq8PRW6EqZCG-pZEtUd0Xji8E8T4hiwXOWRsTiditkZ2btnqAK8k5oCb7zzg__LpERybZdHef3lTzsoro5O-YuM-plBnC-d3AE-UHyl6kqLWAl-GuTr-bn8dUVh_rTjMy3D3dOsv-1RVaQgMZNU8fJGAD-uHftmxRIFiRGc-inU3NlHYSRnarl8SBl3dYxO0Xfvj0pvWw',
    e: 'AQAB',
    kid: 'test-key',
    alg: 'RS256',
    use: 'sig',
  }],
})

export default defineWorkersConfig(({ mode }) => ({
  test: {
    env: {
      NUXT_AUTH_ISSUER: 'http://flareauth.test',
      NUXT_AUTH_AUDIENCE: 'https://sink.test/api',
      NUXT_AUTH_JWKS_JSON: testJwks,
      NUXT_PUBLIC_AUTH_ISSUER: 'http://flareauth.test',
      NUXT_PUBLIC_AUTH_CLIENT_ID: 'sink-test-client',
      NUXT_PUBLIC_AUTH_REDIRECT_URI: 'http://localhost/dashboard/callback',
      NUXT_PUBLIC_AUTH_RESOURCE: 'https://sink.test/api',
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
            NUXT_AUTH_AUDIENCE: 'https://sink.test/api',
            NUXT_AUTH_JWKS_JSON: testJwks,
            NUXT_PUBLIC_AUTH_ISSUER: 'http://flareauth.test',
            NUXT_PUBLIC_AUTH_CLIENT_ID: 'sink-test-client',
            NUXT_PUBLIC_AUTH_REDIRECT_URI: 'http://localhost/dashboard/callback',
            NUXT_PUBLIC_AUTH_RESOURCE: 'https://sink.test/api',
          },
          cf: true,
        },
      },
    },
  },
}))
