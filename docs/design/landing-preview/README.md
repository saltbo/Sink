# tftt.cc landing page — design preview V1

Open `index.html` directly or serve this directory with a local HTTP server.
This standalone design preview does not change the Nuxt homepage or production routing.

## Design and interactions

- Chinese-first copy, monochrome surfaces, and the existing Sink semantic palette.
- Responsive layouts at 900px and 650px.
- Three illustrative link-conversion scenarios and native expandable FAQ answers.
- Creation calls to action link to the existing production login page.
- All sample links, charts, and QR graphics are explicitly illustrative.
- The preview is marked `noindex,nofollow`; it must not be submitted for indexing.

## SEO implementation after design acceptance

Primary intent: free URL shortener / 免费短链接生成器. Supporting topics: 网址缩短,
自定义短链接, 短链接访问统计, 短链接二维码.
These are intent hypotheses, not measured search-volume findings.

The preview includes a descriptive title, meta description, Open Graph text,
one H1, semantic sections, and HTML-rendered FAQ content.

Before publishing:

1. Integrate the accepted design into the homepage and the repository localization
   structure. Keep translated modules and interpolation keys aligned.
2. Remove the production `NUXT_HOME_URL=/dashboard` redirect so `/` serves the page.
3. Produce real HTML through static prerendering or route-specific SSR; inspect the
   built and deployed response to ensure it contains the headline and body without JS.
4. Set the production canonical to `https://tftt.cc/`, remove the preview noindex,
   add a real sharing image, and verify robots and sitemap behavior. Keep dashboard,
   auth, preview, and API routes out of the public indexing surface.
5. Add accurate WebSite/WebApplication structured data. Do not invent reviews,
   ratings, usage numbers, or promise FAQ rich results.
6. Confirm the free-service policy, account quotas, abuse-reporting destination,
   privacy policy, and terms before turning these into public commitments.
7. Submit the homepage sitemap to Search Console and evaluate impressions, queries,
   and sign-up conversion before expanding into useful dedicated guide pages.

No ranking or traffic outcome is guaranteed. Keyword-volume research and production
SEO verification are not completed by this visual prototype.

References:
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
