<script setup lang="ts">
import type { Link } from '@/types'
import { LinkSchema } from '#shared/schemas/link'
import { useClipboard } from '@vueuse/core'
import { Check, Copy, ExternalLink, LayoutDashboard, Link2, LoaderCircle, LogIn } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface AuthState {
  authenticated: boolean
}

interface LinkCreateResponse {
  link: Link
  shortLink: string
}

const { t } = useI18n()

const destinationUrl = ref('')
const customSlug = ref('')
const urlError = ref('')
const slugError = ref('')
const formMessage = ref('')
const createPending = ref(false)
const createdLink = ref<LinkCreateResponse | null>(null)

const { data: authState, pending: authPending } = useFetch<AuthState>('/api/auth/me', {
  credentials: 'same-origin',
  server: false,
})

const isAuthenticated = computed(() => authState.value?.authenticated === true)
const createLabel = computed(() => isAuthenticated.value ? t('home.shortener.create') : t('home.shortener.sign_in_to_create'))
const createDisabled = computed(() => createPending.value || authPending.value)

const shortLink = computed(() => createdLink.value?.shortLink ?? '')
const { copy, copied } = useClipboard({ source: shortLink, copiedDuring: 1400 })

function validateForm(): boolean {
  urlError.value = ''
  slugError.value = ''
  formMessage.value = ''

  const urlResult = LinkSchema.shape.url.safeParse(destinationUrl.value)
  if (!urlResult.success)
    urlError.value = t('home.shortener.url_error')

  const slug = customSlug.value.trim()
  if (slug) {
    const slugResult = LinkSchema.shape.slug.safeParse(slug)
    if (!slugResult.success)
      slugError.value = t('home.shortener.slug_error')
  }

  return !urlError.value && !slugError.value
}

function signInForCreation(): void {
  formMessage.value = t('home.shortener.sign_in_hint')
  navigateTo('/api/auth/login?returnTo=/dashboard', { external: true })
}

async function createShortLink(): Promise<void> {
  if (!validateForm())
    return

  if (!isAuthenticated.value) {
    signInForCreation()
    return
  }

  createPending.value = true
  createdLink.value = null

  try {
    createdLink.value = await useAPI<LinkCreateResponse>('/api/link/create', {
      method: 'POST',
      body: {
        url: destinationUrl.value,
        slug: customSlug.value.trim() || undefined,
      },
    })
    toast(t('links.create_success'))
  }
  catch (error) {
    toast.error(t('links.create_failed'), {
      description: error instanceof Error ? error.message : String(error),
    })
  }
  finally {
    createPending.value = false
  }
}

async function copyShortLink(): Promise<void> {
  await copy()
  toast(t('links.copy_success'))
}
</script>

<template>
  <section class="min-h-[calc(100vh-5rem)] border-b">
    <div
      class="
        mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 px-6
        py-10
        lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] lg:py-14
      "
    >
      <div class="max-w-2xl">
        <Badge variant="secondary" class="mb-5 gap-2">
          <Link2 class="size-3.5" />
          {{ $t('home.shortener.badge') }}
        </Badge>

        <h1
          class="
            max-w-3xl text-4xl font-semibold tracking-normal text-balance
            md:text-5xl
          "
        >
          {{ $t('home.shortener.title') }}
        </h1>
        <p
          class="
            mt-5 max-w-xl text-base leading-7 text-pretty text-muted-foreground
            md:text-lg
          "
        >
          {{ $t('home.shortener.description') }}
        </p>

        <div
          class="
            mt-8 grid gap-3 text-sm text-muted-foreground
            sm:grid-cols-3
          "
        >
          <div class="rounded-md border bg-muted/30 p-3">
            {{ $t('home.shortener.points.custom') }}
          </div>
          <div class="rounded-md border bg-muted/30 p-3">
            {{ $t('home.shortener.points.analytics') }}
          </div>
          <div class="rounded-md border bg-muted/30 p-3">
            {{ $t('home.shortener.points.control') }}
          </div>
        </div>
      </div>

      <div
        class="
          rounded-lg border bg-card p-5 shadow-sm
          sm:p-6
        "
      >
        <form class="space-y-5" @submit.prevent="createShortLink">
          <div>
            <h2 class="text-xl font-semibold">
              {{ $t('home.shortener.form_title') }}
            </h2>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ $t('home.shortener.form_description') }}
            </p>
          </div>

          <FieldGroup>
            <Field :data-invalid="Boolean(urlError)">
              <FieldLabel for="home-url">
                {{ $t('home.shortener.url_label') }}
              </FieldLabel>
              <Input
                id="home-url"
                v-model="destinationUrl"
                type="url"
                name="url"
                placeholder="https://example.com"
                autocomplete="url"
                :aria-invalid="Boolean(urlError)"
                :aria-describedby="urlError ? 'home-url-error' : undefined"
              />
              <FieldError v-if="urlError" id="home-url-error" :errors="[urlError]" />
            </Field>

            <Field :data-invalid="Boolean(slugError)">
              <FieldLabel for="home-slug">
                {{ $t('home.shortener.slug_label') }}
              </FieldLabel>
              <Input
                id="home-slug"
                v-model="customSlug"
                name="slug"
                placeholder="launch-page"
                autocomplete="off"
                :aria-invalid="Boolean(slugError)"
                :aria-describedby="slugError ? 'home-slug-error' : 'home-slug-description'"
              />
              <FieldDescription id="home-slug-description">
                {{ $t('home.shortener.slug_description') }}
              </FieldDescription>
              <FieldError v-if="slugError" id="home-slug-error" :errors="[slugError]" />
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" class="w-full gap-2" :disabled="createDisabled">
            <LoaderCircle
              v-if="createPending || authPending" class="size-4 animate-spin"
            />
            <LogIn v-else-if="!isAuthenticated" class="size-4" />
            <Link2 v-else class="size-4" />
            {{ createLabel }}
          </Button>

          <p v-if="formMessage" class="text-sm text-muted-foreground" role="status">
            {{ formMessage }}
          </p>
        </form>

        <div v-if="createdLink" class="mt-6 rounded-md border bg-muted/30 p-4">
          <p class="text-sm font-medium">
            {{ $t('home.shortener.result_title') }}
          </p>
          <div
            class="
              mt-3 flex flex-col gap-3
              sm:flex-row
            "
          >
            <Input
              :model-value="createdLink.shortLink"
              readonly
              class="min-w-0 flex-1"
              aria-label="Created short link"
            />
            <div class="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                :aria-label="$t('home.shortener.copy')"
                @click="copyShortLink"
              >
                <Check v-if="copied" class="size-4" />
                <Copy v-else class="size-4" />
              </Button>
              <Button as-child variant="outline" size="icon">
                <a
                  :href="createdLink.shortLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="$t('home.shortener.open')"
                >
                  <ExternalLink class="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div class="mt-5 flex justify-center">
          <Button as-child variant="link" class="gap-2 px-0">
            <NuxtLink to="/dashboard">
              <LayoutDashboard class="size-4" />
              {{ $t('home.shortener.dashboard') }}
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
