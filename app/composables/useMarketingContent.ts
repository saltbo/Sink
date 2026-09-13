import type EnglishMessages from '../../i18n/locales/en-US/marketing.json'
import enSource from '../../i18n/locales/en-US/marketing.json?raw'
import zhSource from '../../i18n/locales/zh-CN/marketing.json?raw'

// Marketing copy follows the URL and must bypass i18n's message-AST transform.
const en = JSON.parse(enSource) as typeof EnglishMessages
const zh = JSON.parse(zhSource) as typeof EnglishMessages

export function useMarketingContent() {
  const route = useRoute()
  const isChinese = computed(() => route.path === '/zh' || route.path.startsWith('/zh/'))
  const prefix = computed(() => isChinese.value ? '/zh' : '')
  const copy = computed(() => isChinese.value ? zh.marketing : en.marketing)
  const home = computed(() => isChinese.value ? '/zh' : '/')
  return { isChinese, prefix, copy, home }
}
