import en from '../../i18n/locales/en-US/marketing.json'
import zh from '../../i18n/locales/zh-CN/marketing.json'

export function useMarketingContent() {
  const route = useRoute()
  const isChinese = computed(() => route.path === '/zh' || route.path.startsWith('/zh/'))
  const prefix = computed(() => isChinese.value ? '/zh' : '')
  const copy = computed(() => isChinese.value ? zh.marketing : en.marketing)
  const home = computed(() => isChinese.value ? '/zh' : '/')
  return { isChinese, prefix, copy, home }
}
