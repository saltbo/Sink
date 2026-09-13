# tftt.cc production deployment

The `internal/main` branch runs the `sink` Worker at <https://tftt.cc>.
The Worker custom domain is managed in Cloudflare. The home route serves the public landing page; short links and OIDC callbacks
use the same origin. English guides live under `/guides/`; Chinese pages live under `/zh`.

## Runtime configuration

Use ordinary Worker variables for configuration:

| Variable             | Value                                     |
| -------------------- | ----------------------------------------- |
| `NUXT_CF_ACCOUNT_ID` | The account hosting the analytics dataset |

| `NUXT_OIDC_ISSUER` | `https://id.realmroot.dev/api/auth` |
| `NUXT_OIDC_CLIENT_ID` | The existing Sink confidential Web client ID |
| `NUXT_OIDC_REDIRECT_URI` | `https://tftt.cc/api/auth/callback` |
| `NUXT_SITE_ADMIN_EMAILS` | The existing administrator email allowlist |

Only these runtime values require encrypted secrets:

- `NUXT_CF_API_TOKEN`: analytics read access.
- `NUXT_OIDC_CLIENT_SECRET`: the existing Realmroot client credential.
- `NUXT_OIDC_SESSION_SECRET`: the existing session encryption/signing key.

Keep the client and session secrets stable during ordinary deployments. OIDC mode
does not use `NUXT_SITE_TOKEN`. The old `NUXT_AUTH_*`, `NUXT_PUBLIC_AUTH_*`, and
`NUXT_OIDC_POST_LOGOUT_REDIRECT_URI` settings have no consumers and must not be
reintroduced. Logout clears the local Sink session; it does not use a provider
logout redirect setting.

Session lifetime defaults to 28,800 seconds. Set
`NUXT_OIDC_SESSION_TTL_SECONDS` as an ordinary variable only to override it.
Other optional settings and their defaults are in the
[configuration reference](../configuration/index.md).

The existing Realmroot application must register the exact callback above and
use `https://tftt.cc` as its homepage. Update the registration and Worker callback
together when changing the domain.

## Build configuration

Both production and preview build triggers only need these ordinary variables:

- `DEPLOY_D1_DATABASE_ID`
- `DEPLOY_KV_NAMESPACE_ID`
- `DEPLOY_R2_BUCKET_NAME`

The database name and analytics dataset default to `sink`. Preview binding IDs
default to their primary binding values; do not repeat equal values. Separate
preview resources require explicit overrides. The preview trigger uploads a
Worker version; it does not deploy it to the production domain.

Wrangler authentication belongs to the deployment process, not the Worker
runtime. Keep the Workers Builds deployment token separate from the analytics
read token. `wrangler.jsonc` preserves dashboard variables with `keep_vars`.

## Release and verification

1. Run the relevant lint and authentication/redirect tests against a fresh build.
2. Commit the accepted source on `internal/main`.
3. Run `pnpm deploy:worker` with the three build variables and the approved
   Cloudflare identity. This applies pending D1 migrations before deployment.
4. Confirm the deployed Worker version and `tftt.cc` custom-domain binding.
5. Verify the home redirect, OIDC login callback origin, protected API rejection
   without a session, and the authenticated dashboard when a test identity is
   available. Do not run the local database test setup against production.

Retain the previous Worker version ID before releasing for rollback. Do not
restore obsolete environment variables as part of a normal code rollback.

## Public landing page and search indexing

Before releasing the marketing pages, remove `NUXT_HOME_URL` from the Worker
runtime and build variables. A nonempty runtime value redirects visitors away from the
landing page when the request is handled by the Worker. Prerendering deliberately
ignores this runtime redirect so build artifacts always contain real homepage HTML.
For local builds with older `.env` files, use `NUXT_HOME_URL= pnpm build`.

The homepage and four guides in both English and Chinese are prerendered. Dashboard routes
remain client-rendered and have noindex headers. The sitemap only lists the ten
public marketing pages; it never enumerates user links. English is the default; Chinese uses `/zh` paths. Marketing language follows
the URL and does not follow the dashboard locale cookie.

After deployment verify HTTP 200 with real headline/body HTML at `/` and every
sitemap URL, unique self-canonical links, the correct language and reciprocal hreflang, and the sharing image.
Verify unknown guide paths return 404 and existing short links still redirect.
Submit `https://tftt.cc/sitemap.xml` in the verified Search Console property.
Search Console verification and submission are separate account operations;
creating these files does not automatically submit the site or guarantee ranking.
