export function isAuthAllowInsecure(value: unknown): boolean {
  return value === true || value === 'true'
}
