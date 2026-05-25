import type { TokenAuthContext } from '../utils/auth-token'

declare module 'h3' {
  interface H3EventContext {
    auth?: TokenAuthContext
  }
}
