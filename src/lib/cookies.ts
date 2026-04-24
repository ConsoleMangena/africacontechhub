/**
 * Cookie utility functions for managing browser cookies
 */

/**
 * Get a cookie value by name
 * @param name - The name of the cookie
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}

/**
 * Set a cookie with optional max age
 * @param name - The name of the cookie
 * @param value - The value to store
 * @param maxAge - Maximum age in seconds (default: 1 year)
 * @param path - Cookie path (default: '/')
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = 60 * 60 * 24 * 365, // 1 year default
  path: string = '/'
): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=${value}; max-age=${maxAge}; path=${path}; SameSite=Lax`
}

/**
 * Remove a cookie by setting its max age to 0
 * @param name - The name of the cookie to remove
 * @param path - Cookie path (default: '/')
 */
export function removeCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=; max-age=0; path=${path}; SameSite=Lax`
}
