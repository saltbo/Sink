<script setup lang="ts">
const { isChinese, copy, home } = useMarketingContent()
const route = useRoute()
const languageLink = computed(() => isChinese.value ? (route.path.slice(3) || '/') : (route.path === '/' ? '/zh' : `/zh${route.path}`))
</script>

<template>
  <div class="marketing">
    <a class="skip" href="#main">{{ copy.skip }}</a>
    <div class="container">
      <header class="nav">
        <a class="brand" :href="home" :aria-label="copy.homeAria"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3.3" aria-hidden="true"><path d="M13 20l-2 2a6 6 0 01-8-8l6-6a6 6 0 018 0M19 12l2-2a6 6 0 018 8l-6 6a6 6 0 01-8 0M11 21l10-10" /></svg>tftt.cc</a><nav
          class="nav-links" :aria-label="copy.navAria"
        >
          <a :href="`${home}#features`">{{ copy.featuresNav }}</a><a :href="`${home}#how`">{{ copy.howNav }}</a><a :href="`${home}#faq`">{{ copy.faqNav }}</a>
        </nav><div
          class="nav-actions"
        >
          <a :href="languageLink" :lang="isChinese ? 'en' : 'zh-CN'">{{ isChinese ? 'English' : '中文' }}</a><a
            class="login-link" href="/dashboard/login"
          >{{ copy.login }}</a><a
            class="button" href="/dashboard/login"
          >{{ copy.start }} <span aria-hidden="true">↗</span></a>
        </div>
      </header>
    </div><slot /><div class="container">
      <footer><a class="brand" :href="home">tftt.cc <span style="font-size:12px;font-weight:400;letter-spacing:0;color:var(--muted-foreground)">{{ copy.tagline }}</span></a><p>{{ copy.footer }}</p><p>© 2026 tftt.cc</p></footer>
    </div>
  </div>
</template>

<style scoped src="../assets/css/marketing.css"></style>
