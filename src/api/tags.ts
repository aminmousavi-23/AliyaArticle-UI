import { apiClient } from '@/lib/apiClient'
import type { BaseResponse, CollectionResponse, CreateTagCommand, GetTagPaginatedQuery, TagDto } from '@/types/api'

export const tagApi = {
  async search(query: GetTagPaginatedQuery): Promise<CollectionResponse<TagDto>> {
    const { data } = await apiClient.post<CollectionResponse<TagDto>>('/api/tag/search', query)
    return data
  },

  async create(command: CreateTagCommand): Promise<BaseResponse<unknown>> {
    const { data } = await apiClient.post<BaseResponse<unknown>>('/api/tag', command)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/tag/${id}`)
  },
}
