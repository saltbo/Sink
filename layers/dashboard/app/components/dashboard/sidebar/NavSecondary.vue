<script setup lang="ts">
import { Languages, Laptop, Moon, Sun } from 'lucide-vue-next'
import { useSidebar } from '@/components/ui/sidebar'

const colorMode = useColorMode()
const { setLocale, locales } = useI18n()
const { state } = useSidebar()
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <div
            class="flex w-full p-1.5 pr-0" :class="[
              state === 'collapsed'
                ? 'flex-col items-center gap-2'
                : 'items-center justify-between',
            ]"
          >
            <div />

            <div
              class="flex gap-1" :class="[
                state === 'collapsed' ? 'flex-col items-center' : 'items-center',
              ]"
            >
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button
                    class="
                      flex size-8 items-center justify-center rounded-md
                      hover:bg-sidebar-accent
                      hover:text-sidebar-accent-foreground
                    "
                  >
                    <Languages class="size-4" />
                    <span class="sr-only">{{ $t('layouts.header.select_language') }}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  :align="state === 'collapsed' ? 'start' : 'end'"
                  :side="state === 'collapsed' ? 'right' : 'top'"
                  class="min-w-min"
                >
                  <DropdownMenuItem
                    v-for="locale in locales"
                    :key="locale.code"
                    class="cursor-pointer"
                    @click="setLocale(locale.code)"
                  >
                    <span class="mr-1">{{ locale.emoji }}</span>
                    {{ locale.name }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button
                    class="
                      flex size-8 items-center justify-center rounded-md
                      hover:bg-sidebar-accent
                      hover:text-sidebar-accent-foreground
                    "
                  >
                    <Sun
                      class="
                        size-4
                        dark:hidden
                      "
                    />
                    <Moon
                      class="
                        hidden size-4
                        dark:block
                      "
                    />
                    <span class="sr-only">{{ $t('theme.toggle') }}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  :align="state === 'collapsed' ? 'start' : 'end'"
                  :side="state === 'collapsed' ? 'right' : 'top'"
                  class="min-w-min"
                >
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="colorMode.preference = 'light'"
                  >
                    <Sun class="mr-1 h-4 w-4" />
                    {{ $t('theme.light') }}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="colorMode.preference = 'dark'"
                  >
                    <Moon class="mr-1 h-4 w-4" />
                    {{ $t('theme.dark') }}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="cursor-pointer"
                    @click="colorMode.preference = 'system'"
                  >
                    <Laptop class="mr-1 h-4 w-4" />
                    {{ $t('theme.system') }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
