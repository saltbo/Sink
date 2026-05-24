import type { AuthSession } from '../utils/auth-session'

declare module 'h3' {
  interface H3EventContext {
    auth?: AuthSession
  }
}
