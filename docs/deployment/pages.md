# Deployment on Cloudflare Pages

Cloudflare Workers is the recommended deployment target for this fork. Pages deployment is still documented for projects that already use Pages Functions and can configure the same bindings, but new FlareAuth-backed deployments should prefer [Workers](./workers.md).

1. [Fork](https://github.com/miantiao-me/Sink/fork) the repository to your GitHub account.
2. Create the required Cloudflare resources:
   - D1 database named `sink`
   - KV namespace for binding `KV`
   - Analytics Engine dataset named `sink`
   - Optional R2 bucket for binding `R2`
   - Optional Workers AI binding `AI`
3. Create a FlareAuth OIDC application:
   - Redirect URI: `https://your-pages-domain.example/api/auth/callback`
   - Scopes: `openid profile email`
   - Configure a client secret only when using a confidential client.
   - Configure logout to return to your Pages origin or `/dashboard/login`.
4. Create a project in [Cloudflare Pages](https://developers.cloudflare.com/pages/).
5. Select the `Sink` repository and choose the `Nuxt.js` preset.
6. Configure environment variables and secrets:
   - `NUXT_AUTH_ISSUER`
   - `NUXT_AUTH_CLIENT_ID`
   - `NUXT_AUTH_CLIENT_SECRET` when using a confidential FlareAuth client
   - `NUXT_AUTH_REDIRECT_URI`
   - `NUXT_AUTH_SESSION_SECRET`
   - `NUXT_AUTH_SESSION_TTL_SECONDS`
   - `NUXT_CF_ACCOUNT_ID`
   - `NUXT_CF_API_TOKEN`
   - Optional quota and rate-limit variables from [Configuration](../configuration.md)
7. Save and deploy once, then go to **Settings** -> **Bindings** -> **Add**:
   - **D1 database**: bind variable name `DB` to the `sink` database.
   - **KV Namespace**: bind variable name `KV` to the KV namespace.
   - **Analytics Engine**: bind variable name `ANALYTICS` to the `sink` dataset.
   - **Workers AI**: bind variable name `AI` if AI features are enabled.
   - **R2 Bucket**: bind variable name `R2` if image upload or backup is enabled.
8. Add the `nodejs_compat` compatibility flag under **Settings** -> **Runtime** -> **Compatibility flags**.
9. Apply D1 migrations before serving traffic:

```bash
pnpm wrangler d1 migrations apply sink --remote
```

10. Redeploy the Pages project.
11. Open `/dashboard/login`, sign in through FlareAuth, and verify `/api/auth/me` returns an authenticated session.
12. For legacy KV-only deployments, follow the KV-to-D1 migration plan in [Configuration](../configuration.md#legacy-kv-to-d1-migration).
