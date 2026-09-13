# tftt.cc: 30-day organic growth operations

## Objective and scope

English-first URL shortener for international users; Chinese is a secondary,
separately crawlable edition. Aim for 100 verified organic search clicks per day
within 30 days of the marketing launch. Report the latest complete day and the
7-day average; do not count bots, self-tests or Worker request volume as clicks.
Search platform reporting may lag. Missing data is unavailable, never zero.

Launch date: 2026-09-13.
Deadline: 2026-10-13 (30 days after launch).
Automation: `tftt-cc-seo-geo`, daily 09:00 America/Toronto, 30 runs.

## Release and identity

Repo: `/Users/saltbo/Develop/oss/Sink`, branch `internal/main`, Worker `sink`.
Use Realmroot Agent identity for GitHub and Cloudflare. Google Search Console
has no Realmroot resource; the existing Chrome Google account Jasper exposes the verified `sc-domain:tftt.cc` property.
Use only that property. Do not grant new account access or expose credentials.
Rollback before marketing release: `9b97ee4a-961f-419e-9a76-e61b146c5898`.

## Editorial and measurement plan

- `/` and `/guides/*`: English, international search intent.
- `/zh` and `/zh/guides/*`: Chinese counterparts with self-canonicals and reciprocal
  hreflang. Language is selected by URL, not a crawler-specific response.
- Start with free URL shortening, custom short links, QR code links and analytics.
  These are intent hypotheses, not measured keyword-volume claims.
- Days 1–7: verify indexing eligibility, submit sitemap, capture baseline and
  prioritize actual crawl/indexing errors.
- Days 8–14: use impressions and queries to improve relevant titles, answers and
  internal links. Only add a page for a distinct useful task.
- Days 15–21: improve the pages earning impressions; consider one useful free tool
  if evidence supports demand. No thin keyword variants.
- Days 22–30: improve click-through and sign-in conversion, consolidate overlap,
  evaluate the target honestly.

GEO: track verifiable AI citations and referrals separately. Use clear factual
answers, examples and source attribution. Do not claim that llms.txt, schema or
any tactic guarantees AI inclusion. Platform visibility reports are not clicks.
Do not treat subdomain performance as traffic to this apex-domain service.

## Daily routine

Check public availability, actual HTML, canonical/hreflang, sitemap, robots,
login access boundaries and unexpected changes. Inspect Search Console data for
https://tftt.cc/ (exclude other subdomains in the domain property). Record complete
data dates, clicks, impressions, CTR, position and index status; separate language
pages. Record GEO evidence with source and date. Keep a small, stable query sample
rather than manufacturing searches or clicks. Choose an evidence-backed change,
validate, commit, deploy and regress. Preserve a rollback point before each release.
No paid ads, bought backlinks, paid subscriptions, spam outreach or third-party
messages without explicit authorization. Do not silently re-enable AI bindings.
Report meaningful changes, blockers and weekly summaries; remain quiet on
unchanged non-actionable status. On day 30 report the result and pause autonomous
changes until the next operating period is agreed.

## Log

- Preparation: user corrected audience to English-first overseas market; release
  paused for complete bilingual implementation. Search Console property exists.
- 2026-09-13: English-first bilingual marketing release `256b711`; initial Worker
  version `a494df9d-c0e7-47e7-b181-f1dde4bf4726`. Ten marketing URLs passed public
  HTTP, language, canonical and hreflang checks. Build, type checking, locale
  contract checks and 20 affected tests passed. Browser production verification
  then caught i18n message-AST objects rendered after hydration; follow-up imports
  raw locale JSON to preserve strings in production client bundles.
- Search Console baseline (2026-06-11 through 2026-09-10, page contains
  `https://tftt.cc/`): 0 clicks, 0 impressions; CTR/position not meaningful without
  impressions. Domain-wide historical data includes other subdomains and is
  excluded. Google generative-AI report with the same filter: 0 impressions;
  AI referrals and actual citations are unavailable, not measured as zero.
- Domain-wide indexing overview: 0 indexed and 9 excluded, not a count specific
  to the new ten marketing pages. Homepage's old Aug 30 crawl reported duplicate
  without user-selected canonical. Current live URL test on Sep 13 says
  "URL is available to Google" and "Page can be indexed". This is eligibility,
  not proof of indexing.
- Sitemap submitted Sep 13; submission accepted, but ingestion currently reports
  "Couldn't fetch" / "Sitemap could not be read". Ordinary curl gets valid XML
  with ten URLs. Python's default HTTP client gets Cloudflare 1010; Browser
  Integrity Check is on. Google homepage live fetch succeeds, so this is not
  evidence that Google is globally blocked. No security settings were weakened.
  Recheck sitemap processing in the next daily run; investigate a persistent
  error using Google's fetch details before changing firewall rules.
- Identity audit: Search Console read and sitemap submission used the existing
  Jasper Chrome account because no matching Realmroot resource exists. GitHub
  and Cloudflare release operations used Agent identity. One migration check
  accidentally used the local developer Cloudflare login and reported no
  migrations to apply; no database migration was performed.
- Removed runtime NUXT_HOME_URL redirect; existing short-link redirect and OIDC
  login entry passed smoke checks. AI binding remains absent; all three existing
  secret bindings retained. One-time generated deployment config was restored
  to keep_vars=true after the release to preserve future secret retention.

- Final production release: `2d8b051`, Worker version
  `a5539ca8-d417-4ce0-80bd-acd5f8445144` at 100%. Production-build browser
  acceptance verified English copy, interactive demo and Chinese switching;
  live English page and demo also passed after deployment. Type check and
  targeted lint passed. Google confirmed "Indexing requested" for the homepage;
  it is queued for crawling, not yet confirmed indexed.
