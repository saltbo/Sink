# tftt.cc: 30-day organic growth operations

## Objective and scope

English-first URL shortener for international users; Chinese is a secondary,
separately crawlable edition. Aim for 100 verified organic search clicks per day
within 30 days of the marketing launch. Report the latest complete day and the
7-day average; do not count bots, self-tests or Worker request volume as clicks.
Search platform reporting may lag. Missing data is unavailable, never zero.

Launch date: pending verified production deployment.
Deadline: 30 days after the verified launch date.
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
- Baseline clicks, impressions, indexed pages and GEO referrals: unavailable until
  the property reports are read and scoped to the apex site.
