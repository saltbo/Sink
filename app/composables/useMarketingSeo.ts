interface MarketingSeo {
  title: string
  description: string
  path: string
}

export function useMarketingSeo(page: MarketingSeo) {
  const url = `https://tftt.cc${page.path}`
  const chinese = page.path === '/zh' || page.path.startsWith('/zh/')
  const englishPath = chinese ? (page.path.slice(3) || '/') : page.path
  const chinesePath = englishPath === '/' ? '/zh' : `/zh${englishPath}`
  const lang = chinese ? 'zh-CN' : 'en'
  const title = `${page.title} | tftt.cc`
  useSeoMeta({ title, description: page.description, ogTitle: title, ogDescription: page.description, ogUrl: url, ogSiteName: 'tftt.cc', ogLocale: chinese ? 'zh_CN' : 'en_US', ogImage: `https://tftt.cc/${chinese ? 'social-zh' : 'social'}.png`, twitterImage: `https://tftt.cc/${chinese ? 'social-zh' : 'social'}.png`, twitterTitle: title, twitterDescription: page.description, robots: 'index, follow' })
  useHead({
    htmlAttrs: { lang },
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: 'en', href: `https://tftt.cc${englishPath}` },
      { rel: 'alternate', hreflang: 'zh-CN', href: `https://tftt.cc${chinesePath}` },
      { rel: 'alternate', hreflang: 'x-default', href: `https://tftt.cc${englishPath}` },
    ],
    script: [{ type: 'application/ld+json', textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': page.title,
      'description': page.description,
      url,
      'inLanguage': lang,
      'isPartOf': { '@type': 'WebSite', 'name': 'tftt.cc', 'url': 'https://tftt.cc/' },
      ...(englishPath === '/'
        ? {}
        : { breadcrumb: { '@type': 'BreadcrumbList', 'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': chinese ? '首页' : 'Home', 'item': `https://tftt.cc${chinese ? '/zh' : '/'}` },
            { '@type': 'ListItem', 'position': 2, 'name': page.title, 'item': url },
          ] } }),
    }) }],
  })
}
