// Utility functions for cookie management

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  try {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      // Get everything after the = sign, but stop at the next semicolon
      const cookieValue = parts.pop()?.split(';')[0]?.trim()
      return cookieValue || null
    }
  } catch (err) {
    console.error('Error reading cookie:', err)
  }
  return null
}

export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return
  
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`
}

export function getAuthToken(): string | null {
  return getCookie('auth_token')
}

