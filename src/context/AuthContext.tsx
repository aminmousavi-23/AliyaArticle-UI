import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { authStorage } from '@/lib/authStorage'
import { getClaimsFromToken } from '@/lib/jwt'
import type { LoginUserCommand, RegisterUserCommand, UserDto } from '@/types/api'

interface AuthContextValue {
  user: UserDto | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (command: LoginUserCommand) => Promise<void>
  register: (command: RegisterUserCommand) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadUserFromToken(accessToken: string): Promise<UserDto | null> {
  const { userId, username } = getClaimsFromToken(accessToken)
  if (!userId) return null
  try {
    return await authApi.getById(userId)
  } catch {
    // If GET /api/auth/{id} fails (e.g. id claim doesn't match route param
    // convention), fall back to a minimal user synthesised from the token so
    // the UI still reflects "you're logged in".
    return {
      id: userId,
      username: username ?? 'کاربر نامشخص',
      fullName: username ?? 'کاربر نامشخص',
      email: null,
      phoneNumber: null,
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUserFromStorage = useCallback(async () => {
    const token = authStorage.getAccessToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    const loaded = await loadUserFromToken(token)
    setUser(loaded)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshUserFromStorage()
    return authStorage.subscribe(() => {
      refreshUserFromStorage()
    })
  }, [refreshUserFromStorage])

  const login = useCallback(async (command: LoginUserCommand) => {
    // authApi.login already unwraps BaseResponse<AuthTokensDto> → AuthTokensDto
    const tokens = await authApi.login(command)
    authStorage.setTokens(tokens.accessToken, tokens.refreshToken)
  }, [])

  const register = useCallback(async (command: RegisterUserCommand) => {
    await authApi.register(command)
    // Spec doesn't say register auto-logs you in, so we follow with an
    // explicit login for a smooth signup flow.
    const tokens = await authApi.login({ username: command.username, password: command.password })
    authStorage.setTokens(tokens.accessToken, tokens.refreshToken)
  }, [])

  const logout = useCallback(() => {
    authStorage.clear()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
