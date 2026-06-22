/**
 * Decodes the payload of a JWT without verifying the signature — fine for
 * reading claims client-side (the server is the source of truth for auth).
 */
export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * JWTs issued by ASP.NET commonly use long claim-type URIs for standard
 * claims. This pulls a user id and username out regardless of which
 * convention the backend uses.
 */
export function getClaimsFromToken(token: string) {
  const payload = decodeJwt<Record<string, unknown>>(token)

  if (!payload) {
    return {
      userId: null,
      username: null,
      role: null,
    }
  }

  return {
    userId: payload['user_id'] as string | null,
    username: payload['username'] as string | null,
    role: payload['role'] as string | null,
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt<{ exp?: number }>(token)
  if (!payload?.exp) return false
  return Date.now() >= payload.exp * 1000
}
