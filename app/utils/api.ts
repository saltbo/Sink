import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import { navigateTo } from '#imports'
import { defu } from 'defu'
import { clearFlareAuthUser, getFlareAuthAccessToken } from './flareauth'

type APIOptions = Omit<NitroFetchOptions<NitroFetchRequest>, 'headers'> & {
  headers?: Record<string, string>
}

export function useAPI<T = unknown>(api: string, options?: APIOptions): Promise<T> {
  return getFlareAuthAccessToken().then((accessToken) => {
    const headers = {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    }
    const mergedOptions = defu({ ...options, headers }, {}) as NitroFetchOptions<NitroFetchRequest>

    return $fetch<T>(api, mergedOptions).catch(async (error) => {
      if (error?.status === 401) {
        const returnTo = import.meta.client ? location.pathname + location.search : '/dashboard'
        await clearFlareAuthUser()
        await navigateTo({ path: '/dashboard/login', query: { returnTo } })
      }
      throw error
    }) as Promise<T>
  })
}
