import { apiClient } from '@/lib/apiClient'
import type {
  ArticleDto,
  BaseResponse,
  CollectionResponse,
  CreateArticleCommand,
  GetArticlePaginatedQuery,
} from '@/types/api'

/**
 * POST /api/article returns BaseResponse<T> where T is the new article's id.
 * MediatR "Create" handlers commonly return either a raw string/guid or an
 * object. This handles both.
 */
function extractCreatedId(envelope: BaseResponse<unknown>): string | null {
  const payload = envelope.data
  if (typeof payload === 'string' && payload.length > 0) return payload
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    for (const key of ['id', 'articleId', 'value']) {
      if (typeof obj[key] === 'string') return obj[key] as string
    }
  }
  return null
}

export const articleApi = {
  async search(query: GetArticlePaginatedQuery): Promise<CollectionResponse<ArticleDto>> {
    const { data } = await apiClient.post<CollectionResponse<ArticleDto>>('/api/article/search', query)
    return data
  },

  async getById(id: string): Promise<ArticleDto> {
    const { data } = await apiClient.get<BaseResponse<ArticleDto>>(`/api/article/${id}`)
    if (!data.data) throw new Error(data.message ?? 'مقاله یافت نشد.')
    return data.data
  },

  async create(command: CreateArticleCommand): Promise<string | null> {
    const { data } = await apiClient.post<BaseResponse<unknown>>('/api/article', command)
    return extractCreatedId(data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/article/${id}`)
  },

  async publish(id: string): Promise<void> {
    await apiClient.put(`/api/article/${id}/publish`)
  },
}