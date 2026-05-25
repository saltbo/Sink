<script setup lang="ts">
import { LogIn } from 'lucide-vue-next'

const route = useRoute()

const returnTo = computed(() => {
  const value = route.query.returnTo
  return typeof value === 'string' && value.startsWith('/dashboard') ? value : '/dashboard'
})

function logIn() {
  signInWithFlareAuth(returnTo.value)
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">
        {{ $t('login.title') }}
      </CardTitle>
      <CardDescription>
        {{ $t('login.description') }}
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <Button class="w-full" type="button" @click="logIn">
        <LogIn class="h-4 w-4" />
        {{ $t('login.submit') }}
      </Button>
    </CardContent>
  </Card>
</template>
