import { apiClient } from '@/lib/apiClient'
import type { BaseResponse, CollectionResponse, CommentDto, CreateCommentCommand, GetCommentPaginatedQuery } from '@/types/api'

export const commentApi = {
  async search(query: GetCommentPaginatedQuery): Promise<CollectionResponse<CommentDto>> {
    const { data } = await apiClient.post<CollectionResponse<CommentDto>>('/api/comment/search', query)
    return data
  },

  async create(command: CreateCommentCommand): Promise<BaseResponse<unknown>> {
    const { data } = await apiClient.post<BaseResponse<unknown>>('/api/comment', command)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/comment/${id}`)
  },
}
