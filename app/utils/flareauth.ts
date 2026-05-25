import type { User } from 'oidc-client-ts'
import { navigateTo, useRuntimeConfig } from '#imports'
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

let userManager: UserManager | null = null

export function useFlareAuthUserManager(): UserManager {
  if (!import.meta.client)
    throw new Error('FlareAuth user manager is only available in the browser')

  if (userManager)
    return userManager

  const config = useRuntimeConfig()
  const issuer = requiredPublicConfig(config.public.authIssuer, 'NUXT_PUBLIC_AUTH_ISSUER')
  const clientId = requiredPublicConfig(config.public.authClientId, 'NUXT_PUBLIC_AUTH_CLIENT_ID')
  const resource = stringConfig(config.public.authResource)

  userManager = new UserManager({
    authority: issuer,
    client_id: clientId,
    redirect_uri: stringConfig(config.public.authRedirectUri) || `${location.origin}/dashboard/callback`,
    post_logout_redirect_uri: stringConfig(config.public.authPostLogoutRedirectUri) || `${location.origin}/dashboard/login`,
    response_type: 'code',
    scope: stringConfig(config.public.authScope) || 'openid profile email offline_access',
    resource: resource || undefined,
    extraTokenParams: resource ? { resource } : undefined,
    loadUserInfo: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  })

  return userManager
}

export async function getFlareAuthUser(): Promise<User | null> {
  if (!import.meta.client)
    return null

  const user = await useFlareAuthUserManager().getUser()
  return user && !user.expired ? user : null
}

export async function getFlareAuthAccessToken(): Promise<string | null> {
  return (await getFlareAuthUser())?.access_token ?? null
}

export async function clearFlareAuthUser(): Promise<void> {
  if (!import.meta.client)
    return

  await useFlareAuthUserManager().removeUser()
}

export async function signInWithFlareAuth(returnTo = '/dashboard'): Promise<void> {
  await useFlareAuthUserManager().signinRedirect({
    state: { returnTo: normalizeReturnTo(returnTo) },
  })
}

export async function completeFlareAuthSignIn(): Promise<string> {
  const user = await useFlareAuthUserManager().signinRedirectCallback()
  const state = user.state as { returnTo?: unknown } | undefined
  return normalizeReturnTo(typeof state?.returnTo === 'string' ? state.returnTo : '/dashboard')
}

export async function signOutFromFlareAuth(): Promise<void> {
  const manager = useFlareAuthUserManager()
  const user = await manager.getUser()
  if (!user) {
    await navigateTo('/dashboard/login')
    return
  }

  try {
    await manager.signoutRedirect({ id_token_hint: user.id_token })
  }
  catch {
    await manager.removeUser()
    await navigateTo('/dashboard/login')
  }
}

function requiredPublicConfig(value: unknown, key: string): string {
  const resolved = stringConfig(value)
  if (!resolved)
    throw new Error(`${key} is not configured`)
  return resolved
}

function stringConfig(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeReturnTo(value: string): string {
  return value.startsWith('/dashboard') && !value.startsWith('//') ? value : '/dashboard'
}
