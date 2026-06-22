import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { articleApi } from '@/api/articles'
import { categoryApi } from '@/api/categories'
import { tagApi } from '@/api/tags'
import { ArticleCard } from '@/components/ArticleCard'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Spinner } from '@/components/Spinner'
import { useToast } from '@/context/ToastContext'
import { buildFilter } from '@/lib/filter'
import { getApiErrorMessage } from '@/lib/apiClient'
import {
  FilterOperation,
  buildPageMeta,
  type ArticleDto,
  type CategoryDto,
  type PageMeta,
  type TagDto,
} from '@/types/api'

const PAGE_SIZE = 9

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()

  const q = searchParams.get('q') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const tagId = searchParams.get('tag') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const [articles, setArticles] = useState<ArticleDto[]>([])
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [tags, setTags] = useState<TagDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    categoryApi
      .search({ pageNumber: 1, pageSize: 50 })
      .then((r) => setCategories(r.data ?? []))
      .catch(() => setCategories([]))
    tagApi
      .search({ pageNumber: 1, pageSize: 50 })
      .then((r) => setTags(r.data ?? []))
      .catch(() => setTags([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const filter = buildFilter(
      [
        { field: 'isPublished', operation: FilterOperation.Equals, value: true },
        { field: 'title', operation: FilterOperation.Contains, value: q || undefined },
        { field: 'categoryId', operation: FilterOperation.Equals, value: categoryId || undefined },
        { field: 'tagIds', operation: FilterOperation.Contains, value: tagId || undefined },
      ],
      { orderBy: 'publishedAt', isAscending: false },
    )

    articleApi
      .search({ pageNumber: page, pageSize: PAGE_SIZE, filter })
      .then((r) => {
        if (cancelled) return
        setArticles(r.data ?? [])
        setPageMeta(buildPageMeta(r.totalCount, page, PAGE_SIZE))
      })
      .catch((err) => {
        if (!cancelled) showToast(getApiErrorMessage(err, 'Could not load articles.'), 'error')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryId, tagId, page])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>{q ? `Results for "${q}"` : 'Latest articles'}</h1>
            <p>Writing from everyone on Marginalia, newest first.</p>
          </div>
        </div>

        <div className="browse-layout">
          <aside className="filter-rail">
            <div className="filter-rail__group">
              <h4>Category</h4>
              <div className="filter-rail__chips">
                <button
                  className={`chip chip--button${categoryId === '' ? ' chip--selected' : ''}`}
                  onClick={() => updateParam('category', '')}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={`chip chip--button${categoryId === c.id ? ' chip--selected' : ''}`}
                    onClick={() => updateParam('category', c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-rail__group">
              <h4>Tags</h4>
              <div className="filter-rail__chips">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    className={`chip chip--button${tagId === t.id ? ' chip--selected' : ''}`}
                    onClick={() => updateParam('tag', tagId === t.id ? '' : t.id)}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            {isLoading ? (
              <Spinner label="Loading articles" />
            ) : articles.length === 0 ? (
              <EmptyState
                title="No articles found"
                description="Try a different search term or clear your filters."
              />
            ) : (
              <>
                <div className="article-grid">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
                {pageMeta && (
                  <Pagination
                    pageNumber={pageMeta.pageNumber}
                    totalPages={pageMeta.totalPages}
                    hasPreviousPage={pageMeta.hasPreviousPage}
                    hasNextPage={pageMeta.hasNextPage}
                    onChange={goToPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
