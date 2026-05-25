<script setup lang="ts">
const errorMessage = ref('')

onMounted(async () => {
  try {
    const returnTo = await completeFlareAuthSignIn()
    await navigateTo(returnTo)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
  }
})
</script>

<template>
  <div class="flex min-h-svh items-center justify-center px-6">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{{ errorMessage ? $t('login.failed') : $t('login.completing') }}</CardTitle>
        <CardDescription v-if="errorMessage">
          {{ errorMessage }}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
</template>
