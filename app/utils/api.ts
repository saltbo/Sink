import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import { navigateTo } from '#imports'
import { defu } from 'defu'

type APIOptions = Omit<NitroFetchOptions<NitroFetchRequest>, 'headers'> & {
  headers?: Record<string, string>
}

export function useAPI<T = unknown>(api: string, options?: APIOptions): Promise<T> {
  const mergedOptions = defu(options || {}, {
    credentials: 'same-origin',
  }) as NitroFetchOptions<NitroFetchRequest>

  return $fetch<T>(api, mergedOptions).catch((error) => {
    if (error?.status === 401) {
      const returnTo = import.meta.client ? location.pathname + location.search : '/dashboard'
      navigateTo({ path: '/dashboard/login', query: { returnTo } })
    }
    return Promise.reject(error)
  }) as Promise<T>
}
