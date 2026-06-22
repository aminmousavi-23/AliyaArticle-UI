import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { authStorage } from './authStorage'
import type { AuthTokensDto, BaseResponse, RefreshTokenCommand } from '@/types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiClient = axios.create({ baseURL })

// --- Attach bearer token to every request ---

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// --- 401 handling: try a single refresh, queue concurrent requests behind it ---

let isRefreshing = false
let refreshWaiters: Array<(token: string | null) => void> = []

function onRefreshed(token: string | null) {
  refreshWaiters.forEach((cb) => cb(token))
  refreshWaiters = []
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !original || original._retried || original.url?.includes('/api/auth/')) {
      return Promise.reject(error)
    }

    const refreshToken = authStorage.getRefreshToken()
    if (!refreshToken) {
      authStorage.clear()
      return Promise.reject(error)
    }

    original._retried = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshWaiters.push((token) => {
          if (!token) return reject(error)
          original.headers.set('Authorization', `Bearer ${token}`)
          resolve(apiClient(original))
        })
      })
    }

    isRefreshing = true
    try {
      const body: RefreshTokenCommand = { refreshToken }
      const { data } = await axios.post<BaseResponse<AuthTokensDto>>(`${baseURL}/api/auth/refresh-token`, body)
      const tokens = data.data
      if (!tokens) throw new Error('Empty token response')
      authStorage.setTokens(tokens.accessToken, tokens.refreshToken)
      onRefreshed(tokens.accessToken)
      original.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
      return apiClient(original)
    } catch (refreshError) {
      authStorage.clear()
      onRefreshed(null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

/**
 * Extracts a readable message from the BaseResponse envelope or any
 * Axios/network error.
 *
 * Priority:
 *   1. BaseResponse.validationErrors[0].errorMessage  (field-level failure)
 *   2. BaseResponse.message                           (global / server message)
 *   3. error.message                                  (network / timeout)
 *   4. fallback string
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const envelope = error.response?.data as Partial<BaseResponse> | undefined

    if (envelope) {
      // Validation errors first
      const firstValidation = envelope.validationErrors?.[0]
      if (firstValidation?.errorMessage) return firstValidation.errorMessage

      // Global server message
      if (typeof envelope.message === 'string' && envelope.message.trim()) {
        return envelope.message
      }
    }

    if (error.message) return error.message
  }
  return fallback
}
