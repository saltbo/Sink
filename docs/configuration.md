# Sink Configuration

Sink provides some configuration options, which can be referred to in [.env.example](../.env.example).

> When using Worker deployment, please note that variables with the `NUXT_PUBLIC_` prefix need to be configured in Workers' **Settings** -> **Build** -> **Variables and Secrets** and **Settings** -> **Variables and Secrets**.

## `NUXT_PUBLIC_PREVIEW_MODE`

> If you are using Worker deployment, this variable needs to be configured in **Settings** -> **Build** -> **Variables and Secrets** and **Settings** -> **Variables and Secrets**.

Sets the site to demo mode, the generated links will expire after 5 minutes, and the links cannot be edited or deleted.

## `NUXT_PUBLIC_SLUG_DEFAULT_LENGTH`

> If you are using Worker deployment, this variable needs to be configured in **Settings** -> **Build** -> **Variables and Secrets** and **Settings** -> **Variables and Secrets**.

Sets the default length of the generated SLUG.

## `NUXT_PUBLIC_KV_BATCH_LIMIT`

> If you are using Worker deployment, this variable needs to be configured in **Settings** -> **Build** -> **Variables and Secrets** and **Settings** -> **Variables and Secrets**.

Sets the maximum number of KV operations per request for import/export. Default is 50 (Cloudflare Workers limit per request). Import operations use half of this value since each link requires 2 KV operations (check existence + write).

## FlareAuth OIDC Authentication

Sink uses FlareAuth through standard OpenID Connect Authorization Code + PKCE. Create a FlareAuth OIDC application and register this callback URL:

```txt
https://your-sink-domain.example/api/auth/callback
```

Use scopes `openid profile email`. If your FlareAuth application is confidential, configure the client secret in Cloudflare as `NUXT_AUTH_CLIENT_SECRET`; public clients can leave it empty. Configure the application logout destination to your Sink origin or `/dashboard/login`; Sink clears the local `sink_session` cookie on `/api/auth/logout`, but identity-provider logout is handled by FlareAuth.

### `NUXT_AUTH_ISSUER`

The FlareAuth issuer URL. Sink uses OIDC discovery from this URL.

### `NUXT_AUTH_CLIENT_ID`

The OIDC client ID for the Sink application.

### `NUXT_AUTH_CLIENT_SECRET`

The OIDC client secret for the Sink application. Configure this as a secret in Cloudflare.

### `NUXT_AUTH_REDIRECT_URI`

The absolute callback URL registered in FlareAuth, ending with `/api/auth/callback`.

### `NUXT_AUTH_SESSION_SECRET`

A long random secret used to sign Sink's HttpOnly session cookies. Rotate this value to invalidate all active Sink sessions.

Sink sets two HttpOnly cookies: `sink_oidc` for the temporary login transaction and `sink_session` for the app session. Both use `SameSite=Lax`, path `/`, and secure cookies by default.

### `NUXT_AUTH_SESSION_TTL_SECONDS`

The app session lifetime in seconds. Default is 604800 seconds (7 days).

### `NUXT_AUTH_ALLOW_INSECURE`

Set to literal `true` only for local HTTP testing. Production deployments should leave this unset so auth cookies require HTTPS. Any other value, including the string `false`, is treated as disabled.

## Cloudflare Bindings

Sink requires these Cloudflare bindings:

| Binding     | Type                     | Required                | Purpose                                                                  |
| ----------- | ------------------------ | ----------------------- | ------------------------------------------------------------------------ |
| `DB`        | D1 database              | Yes                     | Authoritative link ownership, soft deletes, and per-user create counters |
| `KV`        | Workers KV namespace     | Yes                     | Public redirect projection and legacy KV-only import source              |
| `ANALYTICS` | Analytics Engine dataset | Yes for analytics pages | Click analytics and real-time event queries                              |
| `R2`        | R2 bucket                | Optional                | OpenGraph image upload and KV backup storage                             |
| `AI`        | Workers AI               | Optional                | AI slug and OpenGraph metadata generation                                |

Run D1 migrations before serving traffic:

```bash
pnpm wrangler d1 migrations apply sink --remote
```

For a new deployment, create and bind the D1 database before applying migrations. The configured D1 database name in `wrangler.jsonc` is `sink`; update the `database_id` for your Cloudflare account.

## `NUXT_REDIRECT_STATUS_CODE`

Redirects default to use HTTP 301 status code, you can set it to `302`/`307`/`308`.

## `NUXT_LINK_CACHE_TTL`

Cache links can speed up access, but setting them too long may result in slow changes taking effect. The default value is 60 seconds.

## `NUXT_REDIRECT_WITH_QUERY`

URL parameters are not carried during link redirection by default and it is not recommended to enable this feature. This is the global default; individual links can override this via the **Redirect with Query Parameters** toggle in **Link Settings**.

## `NUXT_HOME_URL`

> If you are using Worker deployment, this variable needs to be configured in **Settings** -> **Build** -> **Variables and Secrets** and **Settings** -> **Variables and Secrets**.

The default Sink homepage is the introduction page, you can replace it with your own website.

## `NUXT_DATASET`

The Analytics Engine DATASET, it is not recommended to modify unless you need to switch databases and clear historical data.

## `NUXT_AI_MODEL`

You can modify the large model used for AI slug and OpenGraph metadata generation. The supported names can be viewed at [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/#text-generation).

## `NUXT_AI_PROMPT`

Supports custom prompts for AI slug generation. It is recommended to keep the placeholder `{slugRegex}`. Sink sends the URL and, when available, extracted page content to the model.

Default prompt:

```txt
You are a URL shortening assistant, please shorten the URL provided by the user into a SLUG. The SLUG information should be derived from the URL and page content (if provided). Do not make any assumptions beyond the given information. A SLUG is human-readable and should not exceed three words and can be validated using regular expressions {slugRegex} . Only the best one is returned, the format must be JSON reference {"slug": "example-slug"}
```

## `NUXT_AI_OG_PROMPT`

Supports custom prompts for AI OpenGraph title and description generation. Sink appends the preferred locale to the prompt so the generated metadata matches the visitor or dashboard language.

Default prompt:

```txt
You are an OpenGraph metadata assistant. Please summarize the page content provided by the user into a perfect title and description for an OpenGraph preview. Do not make any assumptions beyond the given information. Only the best one is returned, the format must be JSON reference {"title": "Example Title", "description": "Example description that summarizes the page accurately."}
```

## `NUXT_CASE_SENSITIVE`

Set URL case sensitivity.

## `NUXT_LIST_QUERY_LIMIT`

Set the maximum query data volume for the Metric list.

## `NUXT_DISABLE_BOT_ACCESS_LOG`

Access statistics do not count bot traffic.

## `NUXT_API_CORS`

Set the environment variable `NUXT_API_CORS=true` during build to enable CORS support for the API.

## `NUXT_DISABLE_AUTO_BACKUP`

Set to `true` to disable the automatic daily KV backup to R2 storage. Default is `false`.

This feature requires:

1. R2 bucket binding configured in `wrangler.jsonc`
2. Create R2 bucket: `wrangler r2 bucket create sink`

Backups are stored in R2 with the path `backups/links-{timestamp}.json` and run daily at 00:00 UTC. This backs up KV redirect projections only; it does not back up D1-only data such as users, ownership, soft-deleted rows, or quota counters. Use Cloudflare D1 export or backup tooling for authoritative database backups.

## Legacy KV-to-D1 Migration

Sink now treats D1 as the authoritative store for dashboard-owned links. KV remains the redirect projection and migration source for legacy Sink deployments.

Automatic lazy migration runs when an authenticated user opens, edits, or checks a legacy slug: Sink reads `link:<slug>` from KV, inserts an active D1 row for the current FlareAuth user, and keeps the KV projection. Legacy links become owned by the signed-in FlareAuth user that triggers migration. Because active slugs are globally unique, a slug that already exists as an active D1 row for another owner will not migrate for the current user.

Owner-scoped list, search, and export endpoints intentionally do not scan KV. Legacy links continue to redirect from KV, but they will not appear in the dashboard or export until they are migrated into D1.

For a complete migration, use a worker-safe manual pass:

1. Deploy the D1-backed version with `DB` and `KV` bound.
2. Apply all D1 migrations.
3. Sign in as the FlareAuth user who should own the legacy links.
4. Enumerate legacy KV keys with the `link:` prefix in batches using Wrangler or the Cloudflare dashboard.
5. For each slug, call an authenticated management endpoint that loads the slug, such as `GET /api/link/query?slug=<slug>`, with the dashboard session cookie.
6. Compare the `KV.list({ prefix: 'link:' })` count with active D1 rows for the intended owner.
7. Spot-check dashboard list, search, and export for migrated links.
8. Delete one migrated slug's KV projection in a staging environment and visit the public short URL to verify D1 can hydrate KV on redirect cache miss.
9. Keep a D1 export and a KV backup before deleting any legacy backup data.

If you need unattended bulk migration, add a one-off authenticated Worker job that paginates `KV.list({ prefix: 'link:' })`, validates each value with `LinkSchema`, inserts D1 rows for a configured owner id, and records failures. Keep it outside the request path because KV namespace scans can exceed normal request time limits.

## `NUXT_SAFE_BROWSING_DOH`

Set to a DNS over HTTPS (DoH) endpoint URL to enable automatic unsafe link detection when creating or editing links. When enabled, Sink queries the DoH service to check if the destination domain is flagged as malicious. If the domain resolves to `0.0.0.0`, the link is automatically marked as unsafe and visitors will see a warning page before being redirected.

Recommended values:

- `https://family.cloudflare-dns.com/dns-query` — Cloudflare Family DNS (blocks malware and adult content)
- Custom [Cloudflare Zero Trust Gateway](https://developers.cloudflare.com/cloudflare-one/policies/gateway/) DoH URL — supports custom block lists, domain risk categories, and more granular control

Default is empty (disabled). Users can still manually mark links as unsafe in the dashboard regardless of this setting.

## `NUXT_RESERVED_SLUGS`

Adds comma-separated slugs that cannot be created as short links. Sink always reserves system routes and static asset paths such as `api`, `auth`, `_docs`, `dashboard`, `login`, `logout`, `assets`, `image`, `docs`, `openapi`, `swagger`, `scalar`, `_assets`, `_nuxt`, and `_ipx`.

Default is empty.

## `NUXT_LINK_CREATE_QUOTA_LIMIT`

Sets the maximum number of new links a user can create during the quota window. Existing-link upserts do not consume quota.

Default is `1000`.

## `NUXT_LINK_CREATE_QUOTA_WINDOW_SECONDS`

Sets the quota window size in seconds.

Default is `86400` (24 hours).

## `NUXT_LINK_CREATE_RATE_LIMIT`

Sets the maximum number of link creation attempts allowed in the short rate-limit window. Imports are weighted by the number of submitted links.

Default is `120`.

## `NUXT_LINK_CREATE_RATE_LIMIT_WINDOW_SECONDS`

Sets the short rate-limit window size in seconds.

Default is `60`.

## `NUXT_NOT_FOUND_REDIRECT`

Optional custom redirect target when a slug is not found.
If this is not set, Sink will fall back to its default 404 page.
