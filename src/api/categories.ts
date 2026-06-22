import { apiClient } from '@/lib/apiClient'
import type { BaseResponse, CategoryDto, CollectionResponse, CreateCategoryCommand, GetCategoryPaginatedQuery } from '@/types/api'

export const categoryApi = {
  async search(query: GetCategoryPaginatedQuery): Promise<CollectionResponse<CategoryDto>> {
    const { data } = await apiClient.post<CollectionResponse<CategoryDto>>('/api/category/search', query)
    return data
  },

  async create(command: CreateCategoryCommand): Promise<BaseResponse<unknown>> {
    const { data } = await apiClient.post<BaseResponse<unknown>>('/api/category', command)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/category/${id}`)
  },
}
