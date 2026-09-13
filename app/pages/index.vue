<script setup lang="ts">
import { marketingGuides } from '#shared/marketing/guides'
import { englishGuides } from '#shared/marketing/guides-en'

definePageMeta({ layout: 'marketing', alias: ['/zh'] })
const { isChinese, prefix, copy } = useMarketingContent()
const guides = computed(() => isChinese.value ? marketingGuides : englishGuides)
useMarketingSeo({ title: copy.value.seoTitle, description: copy.value.seoDescription, path: isChinese.value ? '/zh' : '/' })
const examples = computed(() => ({
  article: { label: copy.value.article, url: 'https://example.com/articles/a-guide-to-better-sharing?utm_source=newsletter', short: 'tftt.cc/read' },
  event: { label: copy.value.event, url: 'https://example.com/events/summer-meetup-2026?utm_source=poster', short: 'tftt.cc/summer' },
  portfolio: { label: copy.value.portfolio, url: 'https://example.com/portfolio/selected-work-and-projects?ref=profile', short: 'tftt.cc/my-work' },
}))
const selected = ref<'article' | 'event' | 'portfolio'>('article')
</script>

<template>
  <main id="main">
    <div class="container">
      <section class="hero">
        <div>
          <div
            class="label"
          >
            <span
              class="dot"
            /> {{ copy.badge }}
          </div><h1>{{ copy.heroTitle }}<br><span>{{ copy.heroSubtitle }}</span></h1><p
            class="lead"
          >
            {{ copy.heroLine1 }}<br>{{ copy.heroLine2 }}<br>{{ copy.heroLine3 }}
          </p><div
            class="hero-cta"
          >
            <a
              class="button" href="/dashboard/login"
            >{{ copy.create }} <span aria-hidden="true">↗</span></a><a
              class="text-link" href="#demo"
            >{{ copy.demoCta }} <span aria-hidden="true">↓</span></a>
          </div><div
            class="hint"
          >
            {{ copy.signupNote }}
          </div>
        </div><div
          class="hero-art" :aria-label="copy.heroAria"
        >
          <div
            class="art-wrap"
          >
            <div
              class="long-link"
            >
              <div
                class="small-label"
              >
                {{ copy.before }}
              </div><div
                class="url"
              >
                https://example.com/stories/a-little-inspiration<br>?utm_source=social&amp;utm_campaign=hello-world
              </div>
            </div><div
              class="arrow-down" aria-hidden="true"
            >
              ↓
            </div><div
              class="short-link"
            >
              <div
                class="small-label"
              >
                {{ copy.after }}
              </div><div
                class="short-line"
              >
                tftt.cc/hello <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19L19 5M5 5h14v14" /></svg>
              </div>
            </div><div
              class="art-note"
            >
              {{ copy.artNote }}
            </div>
          </div>
        </div>
      </section>
      <div class="use-strip">
        <span>{{ copy.useLabel }}</span><span>{{ copy.social }}</span><span>{{ copy.newsletter }}</span><span>{{ copy.campaign }}</span><span>{{ copy.everyday }}</span>
      </div>
      <section id="demo" class="demo">
        <div class="section-heading">
          <div>
            <div
              class="eyebrow"
            >
              LESS URL. MORE POSSIBILITY.
            </div><h2>{{ copy.demoTitle }}</h2>
          </div><p>{{ copy.demoDescription }}</p>
        </div><div
          class="demo-box"
        >
          <div
            class="demo-top"
          >
            <div
              class="tabs" :aria-label="copy.demoAria"
            >
              <button
                v-for="(example, key) in examples" :key="key" class="tab" :aria-pressed="selected === key" @click="selected = key"
              >
                {{ example.label }}
              </button>
            </div><span
              class="hint"
            >{{ copy.demoNote }}</span>
          </div><div
            class="demo-data" aria-live="polite"
          >
            <div
              class="demo-source"
            >
              <span
                class="small-label"
              >{{ copy.original }}</span><p>{{ examples[selected].url }}</p>
            </div><span
              class="transform" aria-hidden="true"
            >→</span><div
              class="demo-result"
            >
              <span
                class="small-label"
              >{{ copy.short }}</span><strong>{{ examples[selected].short }}</strong>
            </div>
          </div><div
            class="demo-bottom"
          >
            <span>{{ copy.customNote }}</span><a href="/dashboard/login">{{ copy.createMine }}</a>
          </div>
        </div>
      </section>
    </div>
    <section id="features" class="features">
      <div class="container">
        <div
          class="eyebrow"
        >
          SMALL LINK. USEFUL DETAILS.
        </div><h2>{{ copy.featuresTitle }}</h2><div
          class="feature-grid"
        >
          <article
            class="feature"
          >
            <h3>{{ copy.analyticsTitle }}</h3><p>{{ copy.analyticsLine1 }}<br>{{ copy.analyticsLine2 }}</p><div
              class="mini-chart" :aria-label="copy.analyticsAria"
            >
              <div
                class="chart-header"
              >
                <strong>1,284 <span>{{ copy.clicks }}</span></strong><span>{{ copy.sampleData }}</span>
              </div><div
                class="bars" aria-hidden="true"
              >
                <i style="height:23%" /><i style="height:38%" /><i style="height:31%" /><i style="height:54%" /><i style="height:42%" /><i style="height:67%" /><i style="height:55%" /><i style="height:78%" /><i style="height:64%" /><i style="height:92%" /><i style="height:80%" /><i style="height:100%" />
              </div><div
                class="chart-caption"
              >
                <span>{{ copy.monday }}</span><span>{{ copy.sunday }}</span>
              </div>
            </div>
          </article><article
            class="feature"
          >
            <h3>{{ copy.customTitle }}</h3><p>{{ copy.customLine1 }}<br>{{ copy.customLine2 }}</p><div
              class="slug-graphic"
            >
              <span>tftt.cc/</span><b>my-work</b>
            </div><div
              class="tag-row"
            >
              <span>/hello</span><span>/summer</span><span>/read</span>
            </div>
          </article><article
            class="feature"
          >
            <h3>{{ copy.qrTitle }}</h3><p>{{ copy.qrLine1 }}<br>{{ copy.qrLine2 }}</p><div
              class="qr-graphic"
            >
              <svg viewBox="0 0 90 90" role="img" :aria-label="copy.qrAria"><g fill="currentColor"><path d="M0 0h30v30H0zm5 5v20h20V5zM60 0h30v30H60zm5 5v20h20V5zM0 60h30v30H0zm5 5v20h20V65z" fill-rule="evenodd" /><path d="M10 10h10v10H10zM70 10h10v10H70zM10 70h10v10H10zM40 0h10v10H40zM35 20h10v20H35zM45 35h15v10H45zM0 40h20v10H0zM25 40h10v15H25zM40 50h10v20H40zM55 50h10v10H55zM70 40h20v10H70zM80 55h10v20H80zM55 65h15v10H55zM35 80h15v10H35zM60 80h10v10H60zM75 80h15v10H75z" /></g></svg><div>{{ copy.qrNote1 }}<br>{{ copy.qrNote2 }}<br><small>{{ copy.illustration }}</small></div>
            </div>
          </article>
        </div>
      </div>
    </section>
    <div class="container">
      <section id="how" class="how">
        <div class="eyebrow">
          THREE SIMPLE STEPS
        </div><h2>{{ copy.stepsTitle }}</h2><div
          class="steps"
        >
          <article>
            <div
              class="step-number"
            >
              01 / PASTE
            </div><h3>{{ copy.pasteTitle }}</h3><p>{{ copy.pasteText }}</p>
          </article><article>
            <div
              class="step-number"
            >
              02 / SHORTEN
            </div><h3>{{ copy.shortenTitle }}</h3><p>{{ copy.shortenText }}</p>
          </article><article>
            <div
              class="step-number"
            >
              03 / SHARE
            </div><h3>{{ copy.shareTitle }}</h3><p>{{ copy.shareText }}</p>
          </article>
        </div>
      </section>
      <section id="faq" class="faq">
        <div class="faq-intro">
          <div class="eyebrow">
            GOOD QUESTIONS
          </div><h2>{{ copy.faqTitle }}<br>{{ copy.faqSubtitle }}</h2><p>{{ copy.faqIntro }}</p>
        </div><div>
          <details open>
            <summary>{{ copy.faq1q }}</summary><p>{{ copy.faq1a }}</p>
          </details><details><summary>{{ copy.faq2q }}</summary><p>{{ copy.faq2a }}</p></details><details><summary>{{ copy.faq3q }}</summary><p>{{ copy.faq3a }}</p></details><details><summary>{{ copy.faq4q }}</summary><p>{{ copy.faq4a }}</p></details><details><summary>{{ copy.faq5q }}</summary><p>{{ copy.faq5a }}</p></details><details><summary>{{ copy.faq6q }}</summary><p>{{ copy.faq6a }}</p></details>
        </div>
      </section>
      <section class="guide-links" aria-labelledby="guides-heading">
        <div
          class="eyebrow"
        >
          PRACTICAL GUIDES
        </div><h2 id="guides-heading">
          {{ copy.guidesTitle }}
        </h2><div
          class="guide-grid"
        >
          <a v-for="guide in guides" :key="guide.slug" :href="`${prefix}/guides/${guide.slug}`"><h3>{{ guide.title }} ↗</h3><p>{{ guide.description }}</p></a>
        </div>
      </section><section
        class="closing"
      >
        <div><h2>{{ copy.closingTitle }}</h2><p>{{ copy.closingText }}</p></div><a
          class="button" href="/dashboard/login"
        >{{ copy.create }} <span aria-hidden="true">↗</span></a>
      </section>
    </div>
  </main>
</template>

<style scoped src="../assets/css/marketing.css"></style>
