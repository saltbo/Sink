# Deployment on Cloudflare Workers

Workers deployment is the recommended target for this fork because it supports the D1, KV, R2, Analytics Engine, Workers AI, scheduled backup, and FlareAuth session requirements in one Worker.

1. [Fork](https://github.com/miantiao-me/Sink/fork) the repository to your GitHub account.
2. Create the Cloudflare storage resources:
   - D1 database: `pnpm wrangler d1 create sink`
   - KV namespace: `pnpm wrangler kv namespace create KV`
   - R2 bucket for image upload and backups: `pnpm wrangler r2 bucket create sink`
3. Update `wrangler.jsonc` with your D1 `database_id`, KV `id` and `preview_id`, and R2 bucket name.
4. Enable Analytics Engine in **Workers & Pages** -> **Account details**, then keep the dataset name `sink` and binding `ANALYTICS`, or update both `NUXT_DATASET` and `wrangler.jsonc`.
5. Keep the Workers AI binding `AI` if you use AI slug or OpenGraph metadata generation. Remove the binding only if those features are not used.
6. Create a FlareAuth OIDC application:
   - Redirect URI: `https://your-sink-domain.example/api/auth/callback`
   - Scopes: `openid profile email`
   - Client type: confidential if you want to use `NUXT_AUTH_CLIENT_SECRET`; public clients can omit the secret.
   - Logout behavior: redirect users back to your Sink origin or `/dashboard/login`. Sink clears its local `sink_session` cookie on logout.
7. Configure Worker variables and secrets:
   - `NUXT_AUTH_ISSUER`: FlareAuth issuer URL.
   - `NUXT_AUTH_CLIENT_ID`: FlareAuth OIDC client ID.
   - `NUXT_AUTH_CLIENT_SECRET`: FlareAuth OIDC client secret when using a confidential client.
   - `NUXT_AUTH_REDIRECT_URI`: `https://your-sink-domain.example/api/auth/callback`.
   - `NUXT_AUTH_SESSION_SECRET`: long random string used to sign `sink_session` cookies.
   - `NUXT_AUTH_SESSION_TTL_SECONDS`: optional session lifetime in seconds, default `604800`.
   - `NUXT_CF_ACCOUNT_ID`: your Cloudflare [account ID](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/).
   - `NUXT_CF_API_TOKEN`: Cloudflare API token with at least `Account.Account Analytics` permission for Analytics Engine SQL.
   - Optional quotas and rate limits: `NUXT_LINK_CREATE_QUOTA_LIMIT`, `NUXT_LINK_CREATE_QUOTA_WINDOW_SECONDS`, `NUXT_LINK_CREATE_RATE_LIMIT`, `NUXT_LINK_CREATE_RATE_LIMIT_WINDOW_SECONDS`.
8. Apply D1 migrations before serving traffic:

```bash
pnpm wrangler d1 migrations apply sink --remote
```

9. Build and deploy:

```bash
pnpm build
pnpm deploy:worker
```

10. Open `/dashboard/login`, sign in through FlareAuth, and verify `/api/auth/me` returns an authenticated session.
11. Create a test short link from the dashboard, confirm it appears in D1, confirm a `link:<slug>` projection exists in KV, and visit the public short URL.
12. For legacy KV-only deployments, follow the KV-to-D1 migration plan in [Configuration](../configuration.md#legacy-kv-to-d1-migration) before relying on owner-scoped list, search, or export endpoints.
13. To update your fork, refer to the official GitHub documentation: [Syncing a fork branch from the web UI](https://docs.github.com/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui 'GitHub: Syncing a fork').
