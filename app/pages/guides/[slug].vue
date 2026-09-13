<script setup lang="ts">
import { marketingGuides } from '#shared/marketing/guides'
import { englishGuides } from '#shared/marketing/guides-en'

definePageMeta({ layout: 'marketing', alias: ['/zh/guides/:slug'] })
const { isChinese, prefix, copy, home } = useMarketingContent()
const guides = isChinese.value ? marketingGuides : englishGuides
const route = useRoute()
const guide = guides.find(item => item.slug === route.params.slug)
if (!guide)
  throw createError({ statusCode: 404, statusMessage: 'Guide not found' })
useMarketingSeo({ title: guide.title, description: guide.description, path: `${prefix.value}/guides/${guide.slug}` })
</script>

<template>
  <main
    v-if="guide" id="main" class="
      mx-auto max-w-4xl px-6 py-12
      sm:py-20
    "
  >
    <nav
      :aria-label="isChinese ? '面包屑' : 'Breadcrumb'" class="
        mb-10 text-sm text-muted-foreground
      "
    >
      <a :href="home">{{ isChinese ? '首页' : 'Home' }}</a> / <span>{{ guide.title }}</span>
    </nav>
    <article>
      <header class="mb-10">
        <p class="mb-4 text-xs tracking-widest text-muted-foreground">
          {{ isChinese ? 'TFTT.CC / 分享指南' : 'TFTT.CC / SHARING GUIDES' }}
        </p>
        <h1
          class="
            text-4xl/tight font-bold tracking-tight
            sm:text-5xl
          "
        >
          {{ guide.title }}
        </h1>
        <p class="mt-6 text-lg/relaxed text-muted-foreground">
          {{ guide.intro }}
        </p>
      </header>
      <Card class="mb-12">
        <CardContent class="space-y-4">
          <p class="text-sm wrap-break-word text-muted-foreground">
            {{ guide.example.before }}
          </p>
          <p class="text-2xl font-semibold wrap-break-word">
            ↓ {{ guide.example.after }}
          </p>
          <p class="text-sm text-muted-foreground">
            {{ guide.example.caption }}
          </p>
        </CardContent>
      </Card>
      <nav
        :aria-label="isChinese ? '文章目录' : 'On this page'" class="
          mb-12 space-y-3 border-y py-6
        "
      >
        <p class="font-semibold">
          {{ isChinese ? '这篇指南会讲什么' : 'In this guide' }}
        </p>
        <a
          v-for="(section, index) in guide.sections" :key="section.title" :href="`#section-${index}`" class="
            block text-sm text-muted-foreground
            hover:text-foreground
          "
        >{{ index + 1 }}. {{ section.title }}</a>
      </nav>
      <section
        v-for="(section, index) in guide.sections" :id="`section-${index}`" :key="section.title" class="
          mb-12 scroll-mt-8
        "
      >
        <h2 class="mb-5 text-2xl font-semibold tracking-tight">
          {{ section.title }}
        </h2>
        <p
          v-for="paragraph in section.paragraphs" :key="paragraph" class="
            mb-4 leading-loose text-muted-foreground
          "
        >
          {{ paragraph }}
        </p>
      </section>
      <section class="mb-12">
        <h2 class="mb-5 text-2xl font-semibold">
          常见问题
        </h2>
        <div
          v-for="question in guide.questions" :key="question.question" class="
            border-b py-5
          "
        >
          <h3 class="mb-3 font-semibold">
            {{ question.question }}
          </h3>
          <p class="leading-loose text-muted-foreground">
            {{ question.answer }}
          </p>
        </div>
      </section>
      <Button as-child size="lg">
        <a href="/dashboard/login">{{ copy.create }} ↗</a>
      </Button>
    </article>
    <aside class="mt-16 border-t pt-8" :aria-label="isChinese ? '相关阅读' : 'Related guides'">
      <h2 class="mb-5 text-xl font-semibold">
        继续了解
      </h2>
      <a
        v-for="related in guides.filter(item => item.slug !== guide.slug)" :key="related.slug" :href="`${prefix}/guides/${related.slug}`" class="
          block py-3 text-muted-foreground
          hover:text-foreground
        "
      >{{ related.title }} ↗</a>
    </aside>
  </main>
</template>
