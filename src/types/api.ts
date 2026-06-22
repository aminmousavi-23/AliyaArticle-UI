/**
 * Types for the WebAPI v1 (see v1.json).
 *
 * ALL responses from this backend — success, validation failure, server error,
 * or 404 — are wrapped in BaseResponse / BaseResponse<T> / CollectionResponse<T>.
 * The HTTP status code on the response matches BaseResponse.statusCode.
 *
 * Request command/query shapes below are taken directly from v1.json and are
 * exact. Response shapes for "Data" fields are ASSUMPTIONS documented inline.
 */
import type {BlockType_Enum} from "@/enums/BlockType_Enum.ts";
import {FilterOperation_Enum} from "@/enums/FilterOperation_Enum.ts";

// ---------------------------------------------------------------------------
// Envelope types (server-defined)
// ---------------------------------------------------------------------------

export interface ValidationErrorResponse {
  /** Field / property name that failed validation (PascalCase from server). */
  propertyName: string
  /** Human-readable error message for this field. */
  errorMessage: string
}

export interface BaseResponse<T = unknown> {
  statusCode: number
  message: string | null
  validationErrors: ValidationErrorResponse[]
  data: T | null
}

/**
 * Extends BaseResponse<T[]> — the server sends items in `data`
 * and the total count of ALL matching records in `totalCount` so the client
 * can compute pagination without a second request.
 */
export interface CollectionResponse<T> extends Omit<BaseResponse<T[]>, 'data'> {
  data: T[] | null
  totalCount: number
}

// ---------------------------------------------------------------------------
// Shared / pagination
// ---------------------------------------------------------------------------

export interface FilterItemDto {
  field: string
  value: unknown
  operation: FilterOperation_Enum
}

export interface FilterDto {
  groups?: FilterDto[]
  items?: FilterItemDto[]
  isAnd?: boolean
  orderBy?: string | null
  isAscending?: boolean
}

export interface PaginatedQuery {
  pageNumber: number
  pageSize: number
  filter?: FilterDto
}

/**
 * Client-side pagination state derived from CollectionResponse.totalCount +
 * the query's pageNumber/pageSize. Never sent to the server.
 */
export interface PageMeta {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export function buildPageMeta(totalCount: number, pageNumber: number, pageSize: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  return {
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  }
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

export interface CreateArticleCommand {
  title: string
  summary: string
  categoryId: string
  tagIds: string[]
  blocks: CreateArticleBlockDto[]
}

export interface CreateArticleBlockDto {
  type: BlockType_Enum
  text?: string | null
  base64File?: string | null
  order: number
}

export type GetArticlePaginatedQuery = PaginatedQuery

// ASSUMPTION: shapes returned inside BaseResponse<T>.data / CollectionResponse.data

export interface ArticleDto {
  id: string
  title: string
  summary: string
  isPublished: boolean
  category: ArticleCategoryDto
  tags: ArticleTagDto[]
  blocks: ArticleBlockDto[]
  createdAt: string
  createdBy: string
}

export interface ArticleBlockDto {
  id: string
  type: BlockType_Enum
  text?: string | null
  attachmentId?: string | null
  order: number
}

export interface ArticleCategoryDto {
  id: string
  name: string
}

export interface ArticleTagDto {
  id: string
  name: string
}
// ---------------------------------------------------------------------------
// Auth / User
// ---------------------------------------------------------------------------

export type GetUserPaginatedQuery = PaginatedQuery

export interface RegisterUserCommand {
  username: string
  fullName: string
  phoneNumber: string
  email?: string | null
  password: string
  confirmPassword: string
}

export interface LoginUserCommand {
  username: string
  password: string
}

export interface RefreshTokenCommand {
  refreshToken: string
}

// ASSUMPTION: login/refresh return an access + refresh token pair in .data
export interface AuthTokensDto {
  accessToken: string
  refreshToken: string
  expiresAt?: string
}

// ASSUMPTION: shape returned by GET /api/auth/{id}
export interface UserDto {
  id: string
  username: string
  fullName: string
  email?: string | null
  phoneNumber?: string | null
  isAdmin: boolean
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export type GetCategoryPaginatedQuery = PaginatedQuery

export interface CreateCategoryCommand {
  name: string
}

// ASSUMPTION
export interface CategoryDto {
  id: string
  name: string
}

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export type GetTagPaginatedQuery = PaginatedQuery

export interface CreateTagCommand {
  name: string
}

// ASSUMPTION
export interface TagDto {
  id: string
  name: string
}

// ---------------------------------------------------------------------------
// Comment
// ---------------------------------------------------------------------------

export interface GetCommentPaginatedQuery {
  articleId: string
  pageNumber: number
  pageSize: number
  filter?: FilterDto
}

export interface CreateCommentCommand {
  authorName: string
  authorEmail: string
  content: string
  articleId: string
}

// ASSUMPTION
export interface CommentDto {
  id: string
  authorName: string
  authorEmail: string
  content: string
  articleId: string
  createdAt: string
}
