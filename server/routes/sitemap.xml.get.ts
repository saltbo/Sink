import { marketingGuides } from '#shared/marketing/guides'

export default eventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  const englishPaths = ['/', ...marketingGuides.map(guide => `/guides/${guide.slug}`)]
  const paths = [...englishPaths, ...englishPaths.map(path => path === '/' ? '/zh' : `/zh${path}`)]
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>https://tftt.cc${path}</loc></url>`).join('')}</urlset>`
})
