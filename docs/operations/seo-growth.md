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

- 2026-09-13 02:08 America/Toronto: direct Google live inspection of
  `https://tftt.cc/sitemap.xml` completed. Crawl allowed: Yes; Page fetch:
  Successful; crawler: Google Inspection Tool smartphone. This establishes
  current inspection-tool reachability of the actual XML endpoint, not sitemap
  ingestion or indexing. Submitted-sitemaps table still says Couldn't fetch.
  XML response is HTTP 200, application/xml, ten marketing URLs; robots.txt
  allows the endpoint and advertises its correct absolute URL. Keep firewall
  protections unchanged. Next scheduled check should compare the sitemap's
  last-read/status and discovered pages; avoid repeated same-session submission
  or requesting indexing of the XML file itself. Reference: Google Sitemaps
  report help, https://support.google.com/webmasters/answer/7451001?hl=en.
  This check used the same Jasper Chrome Search Console fallback identity.

## Scheduled check: 2026-09-13 09:01 UTC

- All ten sitemap URLs returned 200 with one H1, correct en/zh-CN language,
  self-canonical and three alternate-language links; no robots noindex or
  rendered object strings in the fetched HTML. robots.txt and login returned
  200; unauthenticated API verification returned 401. This is HTTP/HTML
  verification, not a fresh browser hydration or authenticated-session test.
- Agent read of current Worker settings confirms no AI binding and three
  secret bindings retained. No cloud configuration or product changes made.
- Search Console apex filter `https://tftt.cc/`, Web, three months: range
  June 11–September 10; 0 clicks and 0 impressions; last update 4.5 hours ago.
  CTR/position N/A with no impressions. Latest displayed complete date remains
  September 10, before launch; post-launch daily/7-day clicks unavailable.
  No query rows or language-specific performance can yet guide edits.
- Sitemap table unchanged: Couldn't fetch, type Unknown, discovered pages 0,
  last-read field blank. Earlier direct Google live fetch success remains
  historical evidence; ingestion is not confirmed. Fresh apex indexed-page
  count unavailable in this check. Do not substitute domain-wide exclusions.
- Google generative-AI report, same apex filter and three-month selection:
  0 impressions, no page rows, last update 4.5 hours ago. Actual AI citations
  and referral sessions unavailable. No claimed GEO growth.
- Search Console reads used existing Jasper Chrome account because the known
  Realmroot discovery has no matching service. Cloudflare read and GitHub
  operations use Realmroot Agent. No repeated index requests or resubmission.
- Next action: next daily run checks for ingestion and post-launch data;
  investigate a persistent sitemap failure with fresh Google fetch evidence.
  No new actionable change or user input required today.

## Scheduled check: 2026-09-14 09:02 UTC

- Ten public marketing URLs pass HTTP 200, language, one-H1, self-canonical,
  three hreflang links and indexability checks; no rendered object strings in
  HTML. robots.txt and login return 200; unauthenticated verification returns
  401. No fresh authenticated-session or browser-hydration regression claimed.
- Agent read of Cloudflare confirms AI remains absent and three secret bindings
  retained. No product or cloud configuration changes.
- Search Console Web, apex page-contains filter, June 12–September 11: 0 clicks,
  0 impressions, no queries; last update 9 hours ago. CTR and position are N/A
  without impressions. Data advanced one day but still excludes launch.
  Post-launch daily clicks and seven-day average remain unavailable.
- Google generative-AI report with same filter/range: 0 impressions, no page
  rows, last update 9 hours ago. Actual citations and referral traffic unavailable.
- Sitemap submission table remains Unknown / Couldn't fetch, discovered pages
  0, last-read blank. This count is sitemap discovery, not indexed-page count.
  Fresh apex indexed-page total unavailable.
- Private reads: Jasper Chrome Search Console fallback (no matching Realmroot
  resource); Cloudflare and GitHub use Realmroot Agent.
- Fresh sitemap live test at 05:03:57 America/Toronto: Google Inspection Tool
  smartphone, crawl allowed Yes, Page fetch Successful. Current Google test
  access remains healthy; sitemap ingestion is still unconfirmed. Keep existing
  security controls. No duplicate index request for the XML. Continue checking
  processing status and post-launch data on the next scheduled run.
- No actionable new search/query evidence supports editorial changes today.

## Scheduled check: 2026-09-15 09:01 UTC

- Ten sitemap marketing URLs pass HTTP 200, one H1, correct language,
  self-canonical and three hreflang links; no robots noindex or object-string
  rendering in HTML. robots.txt and login 200; API verify 401. These are
  HTTP/HTML checks, not authenticated-session or fresh hydration acceptance.
- Cloudflare Agent read confirms no AI binding and three secret bindings.
- Search Console Web, apex contains filter, June 13–September 12: 0 clicks,
  0 impressions, no queries; last update 5 hours ago. CTR/position N/A.
  The latest data still predates launch; post-launch daily and seven-day
  clicks unavailable. No measured query signal supports editorial changes.
- Google generative-AI report, same filter and range: 0 impressions, no pages,
  last update 5.5 hours ago. Actual AI citations and referral sessions unavailable.
- Sitemap remained Unknown / Couldn't fetch with 0 discovered pages and blank
  last-read, despite earlier successful live fetches on Sep 13 and Sep 14 and
  current valid public XML. Resubmitted the same canonical sitemap once today.
  Google confirmed submission; table now shows Submitted Sep 15 but still
  Couldn't fetch. Do not interpret submission as ingestion or indexing.
  No duplicate XML indexing request, no firewall changes or URL-name workaround.
- Next run checks sitemap processing and first post-launch metrics; if the
  sitemap remains unread, inspect crawl diagnostics before further submission.
  Fresh apex indexed-page total unavailable in this run.
- Search Console read/resubmission used Jasper Chrome fallback because no
  matching Realmroot integration exists; Cloudflare and GitHub use Agent.
  No product deployment was needed; only this operational record changed.

## Scheduled check: 2026-09-16 09:00 UTC

- Ten marketing URLs pass public HTTP/HTML checks: 200, one H1, correct language,
  self-canonical, three hreflang links, no robots noindex or object strings.
  robots.txt/login 200 and unauthenticated API verify 401. No fresh hydration
  or authenticated session check. Agent Cloudflare read: AI absent, three secrets.
- New indexing evidence: URL Inspection for https://tftt.cc/ now says URL is on
  Google / Page is indexed. Last crawl Sep 13 02:08:11 America/Toronto, Googlebot
  smartphone, fetch successful, crawl/index allowed. Declared canonical is
  https://tftt.cc/ and Google-selected canonical is Inspected URL. This resolves
  the old duplicate-canonical diagnosis for the homepage only.
- Sitemap table still Unknown / Couldn't fetch, submitted Sep 15, discovered
  pages 0, last-read blank. Homepage inspection says Sitemaps: Temporary
  processing error. No further resubmission today; sitemap processing remains
  unconfirmed despite successful homepage indexing.
- Web report: apex page-contains filter, June 14–September 13, 0 clicks and
  0 impressions, no query rows, last update 5 hours ago. First displayed
  launch-day data: September 13 has zero reported clicks/impressions. CTR and
  position N/A; a complete seven-day post-launch average is not yet available.
- Google generative-AI report: same filter/range, 0 impressions, no page rows,
  last update 5 hours ago. Actual AI citations and referrals unavailable.
- Inspected /guides/shorten-url: URL unknown to Google, not indexed. Requested
  indexing of this useful English entry page while sitemap processing is pending.
- Private service access: Jasper Chrome Search Console fallback due to missing
  Realmroot integration; Cloudflare and GitHub use Agent identity. Shell PATH
  initially selected an outdated Realmroot binary; login-shell resolution uses
  the working /opt/data/go/bin/realmroot without switching credentials.
- Google confirmed Indexing requested for /guides/shorten-url and added it to
  the priority crawl queue; this is not proof the guide is indexed. No CAPTCHA
  challenge was manually completed. Next check verifies guide indexing and
  watches for the first genuine impressions before choosing content revisions.
