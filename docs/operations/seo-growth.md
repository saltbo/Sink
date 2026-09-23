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

## Scheduled check: 2026-09-17 09:00 UTC

- All ten marketing URLs pass HTTP/HTML checks (200, one H1, correct language,
  self-canonical, three hreflang links, no robots noindex or object strings).
  robots.txt and login 200, API verify 401. This is not a fresh hydration or
  authenticated-session test. Agent Cloudflare read: AI absent, three secrets.
- /guides/shorten-url is now on Google / indexed. Last crawl Sep 16 05:04:58
  America/Toronto, Googlebot smartphone, fetch successful, crawl/index allowed.
  Declared canonical matches inspected URL and Google selected that URL.
  Referring page is https://tftt.cc/; no referring sitemap detected. Breadcrumbs
  report shows one valid item. This verifies this guide only, not all guides.
- Sitemap remains Unknown / Couldn't fetch, submitted Sep 15, discovered pages
  0, last-read blank. No further sitemap submission or firewall changes today.
- Web report, apex contains filter, June 15–September 14: 0 clicks/impressions,
  no query rows, last update 7.5 hours ago. Latest displayed date September 14
  therefore has zero reported clicks/impressions; CTR/position N/A. No full
  seven-day post-launch average yet. English/Chinese rows unavailable.
- Google generative-AI report with same filter/range: 0 impressions, no pages,
  update 7.5 hours ago. Actual AI citations/referral visits unavailable.
- /guides/custom-short-links inspection says URL unknown to Google, not indexed.
  Initiated its first indexing request; no repeat request for the indexed guide.
- Search Console reads/request use existing Jasper Chrome account because no
  matching Realmroot integration exists. Cloudflare/GitHub use Agent identity.
  No product edits or deployment needed; no evidence yet for query-led rewrites.
- Google confirmed Indexing requested for /guides/custom-short-links, queued
  for crawling; not confirmed indexed. No manual CAPTCHA challenge interaction.
  Next daily run checks this guide, sitemap processing and emerging impressions.

## Scheduled check: 2026-09-19 09:01 UTC

- No Sep 18 check is recorded; do not infer an unobserved run or backfill data.
- All ten marketing URLs pass public HTML/HTTP checks: 200, one H1, correct
  language, self-canonical, three hreflang links, no robots noindex or object
  strings. robots.txt/login 200; API verify 401. No fresh hydration or logged-in
  session test. Cloudflare Agent read confirms AI absent and three secrets.
- /guides/custom-short-links is indexed, with one valid Breadcrumbs item.
  Last crawl Sep 17 05:04:51 America/Toronto, Googlebot smartphone, successful
  fetch, crawl/index allowed. Declared and selected canonicals both point to
  the inspected URL. Referrer: homepage. Sitemap discovery: Temporary processing
  error. Homepage and first guide indexing are historical observations, not
  a fresh full-site indexed-page count.
- Sitemap remains Unknown / Couldn't fetch, submitted Sep 15, discovered pages
  0, no last-read shown. No further resubmission or protection changes.
- Web: apex page-contains filter, June 17–September 16, 0 clicks/impressions,
  no query rows, last update 7 hours ago. Latest complete displayed day Sep 16
  thus has 0 reported clicks/impressions. CTR/position N/A; seven full days of
  post-launch reporting are not available yet. No language-specific page rows.
- Google generative-AI: same filter/range, 0 impressions, no pages, update
  7 hours ago. Actual AI citations and referral visits unavailable.
- /guides/qr-code-links is unknown to Google, not indexed. Initiated its first
  indexing request. No repeat request for already indexed pages.
- Search Console reads/request use Jasper Chrome fallback because no matching
  Realmroot integration is available; Cloudflare/GitHub operations use Agent.
  No product deployment. No measured queries justify speculative title rewrites.
- Google confirmed Indexing requested for /guides/qr-code-links; now queued,
  not confirmed indexed. No manual CAPTCHA interaction. Next check verifies
  this guide and the remaining analytics guide, then prepares the first weekly
  review using available complete dates without treating a partial week as full.


## Scheduled check and first weekly review: 2026-09-20 09:02 UTC

- All ten marketing URLs pass public HTTP/HTML checks: 200, one H1, correct
  en/zh-CN language, self-canonical, three hreflang links, no robots noindex or
  rendered object strings. Valid sitemap XML lists ten URLs. robots.txt/login
  return 200; unauthenticated API verification returns 401. These checks do
  not establish fresh browser hydration or authenticated-session acceptance.
  Cloudflare Agent read confirms AI absent and three secret bindings retained.
- First apex search traffic: Web report with page-contains filter
  `https://tftt.cc/`, June 18–September 17, reports 1 click, 1 impression,
  100% CTR and average position 1. Last update: 5 hours ago. DAYS confirms
  September 17 has 1 click/1 impression; September 13–16 each have zero.
  PAGES attributes the single click/impression to https://tftt.cc/; QUERIES
  has no rows. Other subdomains are excluded. This is platform-reported
  search traffic, not a Worker request or agent search self-test. One sample
  cannot establish ranking strength, audience geography or a growth trend.
- Latest complete displayed day is September 17, three calendar days behind
  this run. Only five post-launch dates are available: 1 total click and
  1 impression, 0.2 clicks/day across September 13–17. The latest seven
  displayed days September 11–17 total 1 click (1/7 = 0.143 clicks/day),
  but include two pre-launch dates. A full seven-day post-launch average
  remains unavailable; do not label either partial-period metric a full
  launch-week result. The daily target of 100 clicks is not met.
- Google generative-AI report, same apex filter/range, now reports 1 impression.
  PAGES identifies the homepage; DAYS identifies September 17. Last update
  5 hours ago. This is a platform-reported AI-feature impression only;
  actual citation content, AI referral sessions and attributable conversions
  remain unavailable. Do not add this impression to Web clicks or infer a
  separate visitor from overlapping reports.
- /guides/qr-code-links is now indexed, with one valid Breadcrumbs item.
  Last crawl September 19 05:04:12 America/Toronto, Googlebot smartphone;
  crawl/index allowed, fetch successful, declared canonical is this guide,
  Google-selected canonical is Inspected URL. Referrers: homepage and custom
  short links guide. Sitemap discovery still says Temporary processing error.
- /guides/link-analytics is unknown to Google, not indexed. Its first indexing
  request was accepted and Google confirmed addition to the priority crawl
  queue. This is not indexing confirmation. No manual CAPTCHA interaction.
- Sitemap table remains Unknown / Couldn't fetch, submitted September 15,
  0 discovered pages and blank last-read. No repeated sitemap submission,
  XML indexing request or speculative firewall change. Public XML remains
  valid; historical Google live fetches succeeded, but ingestion is unresolved.
- Weekly outcome: English homepage and three English guides have individually
  confirmed indexing observations (homepage/first two guides from earlier
  runs, QR guide fresh today). This is not a fresh whole-site index count.
  The final English guide is queued; Chinese page indexing is unavailable.
  Ten public marketing pages remain healthy and English-first. There is no
  recorded September 18 run. First Web click and AI-feature impression are
  early evidence only; the 30-day goal remains at risk and unachieved.
- Next priorities: verify analytics guide indexing, continue sitemap diagnosis
  with fresh crawl evidence if it persists, and examine emerging query/page
  data before rewriting titles or creating demand-specific pages. No query
  evidence currently supports speculative content expansion. Continue daily
  checks; next weekly review September 27, final evaluation October 13.
- Search Console reads and indexing request used existing Jasper Chrome
  account (obyz2018@gmail.com), because known Realmroot discovery has no
  matching integration. Cloudflare read and GitHub commit/push use Agent.
  Only this operations document changed; no product deployment, configuration
  mutation or rollback required. Last known product release and rollback
  references remain unchanged; no new version is claimed by this check.


## Scheduled check: 2026-09-21 (heartbeat 09:13 UTC)

- All ten marketing URLs pass public HTTP/HTML checks: 200, one H1, correct
  language, self-canonical, exact reciprocal en/zh-CN/x-default destinations,
  no robots noindex or rendered object strings. robots.txt/login 200; API
  verify 401. XML is 200 application/xml, UTF-8, ten URLs. No fresh browser
  hydration or authenticated-session acceptance claimed. Cloudflare Agent read
  confirms no AI binding and three secret bindings.
- Web report, apex contains filter `https://tftt.cc/`, June 20–September 19:
  1 click, 1 impression, 100% CTR, average position 1; no query rows. Last
  update 4 hours ago. DAYS shows Sep 18 and Sep 19 each 0 clicks/impressions;
  Sep 17 has 1/1 and Sep 13–16 each 0/0. Latest complete displayed date
  September 19 is two calendar days behind this check; its CTR/position are
  N/A without impressions. First complete post-launch seven days Sep 13–19
  total 1 click/1 impression, average 1/7 = 0.143 clicks/day. No sustained
  growth or achievement of the 100-click daily goal. The aggregate position
  and CTR describe one sample, not reliable ranking or conversion strength.
- Google generative-AI report with same filter/range: 1 homepage impression,
  last update 4 hours ago. Actual citation content and referral sessions remain
  unavailable. No additional GEO improvement claimed or double-counting with
  Web traffic. No language-specific guide traffic is evidenced by these data.
- /guides/link-analytics is now indexed, with one valid Breadcrumbs item.
  Last crawl Sep 20 05:10:40 AM as shown by Search Console, Googlebot smartphone;
  fetch successful, crawl/index allowed, declared canonical is inspected URL
  and Google selected that URL. Referrer is homepage; sitemap discovery says
  Temporary processing error. All four English guides now have individual
  indexing observations, alongside the earlier homepage observation. This is
  not a fresh full-site indexed-page total; Chinese indexing remains unavailable.
- Sitemap table still Unknown / Couldn't fetch, submitted Sep 15, 0 discovered
  pages, no last-read in table. New detail-view evidence shows Last read
  9/15/26 and Sitemap could not be read; no more specific cause is displayed.
  Prefer this detail date over interpreting the table's blank as never fetched.
- Fresh Google live test of sitemap.xml succeeds: Sep 21 09:07:53 AM as shown
  in the browser, Google Inspection Tool smartphone, crawl allowed Yes,
  Page fetch Successful, indexing allowed Yes. This verifies current test-tool
  access, not successful sitemap ingestion or all crawler access. The actual
  run occurred later than the heartbeat timestamp. No XML indexing request,
  repetitive resubmission, firewall relaxation or speculative endpoint rename.
- Next check watches for a newer sitemap last-read and query/page evidence.
  The four useful English guides have completed the pending manual indexing
  checks. Continue diagnosis if ingestion stays stale; do not duplicate pages
  or rewrite titles solely on a single homepage impression. No product edit
  or deployment warranted by today's findings; rollback references unchanged.
- Search Console reads/live test used existing Jasper Chrome fallback account
  (obyz2018@gmail.com), because known Realmroot discovery has no matching
  integration. Cloudflare and GitHub operations use Realmroot Agent. This run
  only updates the operational record on internal/main.


## Scheduled check: 2026-09-22 09:00 UTC

- Ten public marketing URLs pass HTTP/HTML checks: 200, one H1, correct
  English/Chinese language, self-canonical, exact reciprocal en/zh-CN/x-default
  links, no robots noindex or rendered object strings. Sitemap parses as valid
  XML with ten URLs; robots.txt advertises it. Login returns 200 and API verify
  returns 401. No fresh hydration or authenticated-session test claimed.
  Cloudflare Agent read confirms AI absent and three secret bindings retained.
- Search Console Web, apex page-contains filter `https://tftt.cc/`, range
  June 20–September 19: 1 click, 1 impression, CTR 100%, average position 1;
  no query rows. Last update 5.5 hours ago. DAYS again confirms Sep 19 and
  Sep 18 each 0/0, Sep 17 1/1, Sep 13–16 each 0/0. Latest complete date
  remains Sep 19, three calendar days behind this check. Latest-day CTR and
  position N/A without impressions. Sep 13–19 seven-day total remains 1
  click/1 impression; average 0.143 clicks/day. No new growth or target success.
- Google generative-AI report, same apex filter/range: 1 homepage impression,
  last update 5.5 hours ago. Actual AI citation content and referral visits
  unavailable. No additional GEO effect or language-specific guide traffic
  can be established from the current report.
- Sitemap table unchanged: Unknown / Couldn't fetch, submitted Sep 15,
  discovered pages 0. Detail view still says Last read 9/15/26 and Sitemap
  could not be read. Yesterday's successful Google live fetch remains relevant
  historical evidence, not proof of ingestion. No repeated live test,
  resubmission, XML indexing request or security configuration changes today.
- Indexing evidence remains the individually confirmed English homepage and
  four guides from prior runs. Fresh whole-site indexed-page count and Chinese
  indexing are unavailable in this check; no claim of new indexing today.
- No actionable new query, crawl or production failure justifies a product
  change. No deployment or rollback needed. Continue checking for a newer
  sitemap read and complete search data; next weekly review remains Sep 27.
- Search Console reads used existing Jasper Chrome account
  (obyz2018@gmail.com), because known Realmroot discovery has no matching
  integration. Cloudflare and GitHub use Realmroot Agent. Only this operations
  record is updated on internal/main; no user action is required today.


## Scheduled check: 2026-09-23 09:01 UTC

- All ten public marketing URLs pass HTTP/HTML checks: 200, one H1, correct
  language, self-canonical, exact reciprocal en/zh-CN/x-default destinations,
  no robots noindex or rendered object strings. Sitemap XML parses with ten
  URLs; robots.txt advertises it. Login 200, unauthenticated API verify 401.
  No fresh browser hydration or authenticated-session test claimed. Cloudflare
  Agent read confirms no AI binding and three secret bindings retained.
- Search Console Web with apex page-contains filter `https://tftt.cc/`,
  June 21–September 20: 1 click, 2 impressions, CTR 50%, average position
  42.5; last update 6.5 hours ago. Latest complete displayed day September 20
  has 0 clicks, 1 impression, CTR 0%, position 84.0, three calendar days
  behind this run. Sep 14–20 seven-day total is 1 click/2 impressions,
  average 0.143 clicks/day. Daily 100-click target remains unachieved.
- First visible non-brand English query: `link click analytics`, 0 clicks,
  1 impression. PAGES identifies /guides/link-analytics at position 84.0;
  selecting that exact page confirms the same query, 0 clicks/1 impression,
  CTR 0%, position 84.0. Homepage remains 1 click/1 impression at position 1.
  This is a single newly observed guide impression, not a stable ranking trend.
- Reviewed shared/marketing/guides-en.ts against this query. The existing guide
  already explains click requests versus people/conversions, consistent time
  windows, referrers/countries, separate campaign links, UTM attribution and
  differences from website analytics. Its title and description match this
  intent. No concrete missing answer or inaccurate promise was identified.
  Preserve the current baseline rather than infer a title problem from one
  impression; prioritize this page if repeated query evidence exposes gaps.
- Google generative-AI report, same apex filter and June 21–September 20 range:
  1 homepage impression, last update 6.5 hours ago. Actual citation content and
  referral visits remain unavailable. No additional GEO improvement claimed.
- Sitemap submission table still Unknown / Couldn't fetch, submitted Sep 15,
  0 discovered pages and blank last-read. Sep 21 detailed last-read and
  successful live fetch are historical evidence, not refreshed today. No
  repeated submission/live test or speculative firewall change. Previously
  confirmed indexing of the homepage and four English guides remains historical;
  fresh full-site indexed-page count and Chinese indexing are unavailable.
- Next checks: follow the analytics query's impressions, rankings and related
  terms; monitor sitemap processing. No product deployment or rollback needed
  today; only the operational record changed. Next weekly review September 27.
- Search Console reads used Jasper Chrome account (obyz2018@gmail.com), because
  known Realmroot discovery has no matching integration. Cloudflare and GitHub
  operations use Realmroot Agent. No third-party message or paid action.
