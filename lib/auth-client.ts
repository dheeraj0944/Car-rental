// Client-side auth utilities

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null
  
  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
    
    if (!cookieValue) return null
    
    // Use substring to get everything after 'auth_token=' to handle special characters
    const token = cookieValue.substring('auth_token='.length)
    return token || null
  } catch (err) {
    console.error('Error reading auth token:', err)
    return null
  }
}

export function decodeToken(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    console.error('Error decoding token:', err)
    return null
  }
}

export function isAuthenticated(): boolean {
  const token = getAuthToken()
  if (!token) return false
  
  const decoded = decodeToken(token)
  if (!decoded) return false
  
  // Check if token is expired (if exp field exists)
  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    return false
  }
  
  return true
}

