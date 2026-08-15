export function shouldRedirectHome(requestUrl: URL, configuredHomeUrl: string): boolean {
  if (!configuredHomeUrl)
    return false

  const targetUrl = new URL(configuredHomeUrl, requestUrl)
  return targetUrl.origin !== requestUrl.origin
    || targetUrl.pathname !== requestUrl.pathname
    || targetUrl.search !== requestUrl.search
}
