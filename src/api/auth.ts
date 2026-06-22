import { apiClient } from '@/lib/apiClient'
import type {
  AuthTokensDto,
  BaseResponse,
  CollectionResponse,
  GetUserPaginatedQuery,
  LoginUserCommand,
  RegisterUserCommand,
  UserDto,
} from '@/types/api'

export const authApi = {
  async register(command: RegisterUserCommand) {
    const { data } = await apiClient.post<BaseResponse<null>>('/api/auth/register', command)
    return data
  },

  async login(command: LoginUserCommand): Promise<AuthTokensDto> {
    const { data } = await apiClient.post<BaseResponse<AuthTokensDto>>('/api/auth/login', command)
    if (!data.data) throw new Error(data.message ?? 'Login failed — no token returned.')
    return data.data
  },

  async refreshToken(accessToken: string, refreshToken: string): Promise<AuthTokensDto> {
    const { data } = await apiClient.post<BaseResponse<AuthTokensDto>>('/api/auth/refresh-token', { accessToken, refreshToken })
    if (!data.data) throw new Error(data.message ?? 'Token refresh failed.')
    return data.data
  },

  async getById(id: string): Promise<UserDto> {
    const { data } = await apiClient.get<BaseResponse<UserDto>>(`/api/auth/${id}`)
    if (!data.data) throw new Error(data.message ?? 'User not found.')
    return data.data
  },

  async search(query: GetUserPaginatedQuery): Promise<CollectionResponse<UserDto>> {
    const { data } = await apiClient.post<CollectionResponse<UserDto>>('/api/auth/search', query)
    return data
  },
}
