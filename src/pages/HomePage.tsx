import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { articleApi } from '@/api/articles'
import { categoryApi } from '@/api/categories'
import { ArticleCard } from '@/components/ArticleCard'
import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { Spinner } from '@/components/Spinner'
import { useToast } from '@/context/ToastContext'
import { buildFilter } from '@/lib/filter'
import { getApiErrorMessage } from '@/lib/apiClient'
import {
  buildPageMeta,
  type ArticleDto,
  type CategoryDto,
  type PageMeta,
} from '@/types/api'
import {FilterOperation_Enum} from "@/enums/FilterOperation_Enum.ts";

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    categoryApi
        .search({ pageNumber: 1, pageSize: 50 })
        .then((r) => setCategories(r.data ?? []))
        .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const filter = buildFilter(
        [
          { field: 'isPublished', operation: FilterOperation_Enum.Equal, value: true },
          { field: 'title', operation: FilterOperation_Enum.Contains, value: q || undefined },
          { field: 'categoryId', operation: FilterOperation_Enum.Equal, value: categoryId || undefined },
        ],
        { orderBy: 'createdAt', isAscending: false },
    )

    articleApi
        .search({ pageNumber: page, pageSize: PAGE_SIZE, filter })
        .then((r) => {
          if (cancelled) return
          setArticles(r.data ?? [])
          setPageMeta(buildPageMeta(r.totalCount, page, PAGE_SIZE))
        })
        .catch((err) => {
          if (!cancelled) showToast(getApiErrorMessage(err), 'error')
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
              <h1>{q ? `نتایج برای "${q}"` : 'جدیدترین مقالات'}</h1>
            </div>
          </div>

          <div className="browse-layout">
            <aside className="filter-rail">
              <div className="filter-rail__group">
                <h4>دسته‌بندی</h4>
                <div className="filter-rail__chips">
                  <button
                      className={`chip chip--button${categoryId === '' ? ' chip--selected' : ''}`}
                      onClick={() => updateParam('category', '')}
                  >
                    همه
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
            </aside>

            <div>
              {isLoading ? (
                  <Spinner label="در حال بارگذاری مقالات" />
              ) : articles.length === 0 ? (
                  <EmptyState
                      title="مقاله‌ای پیدا نشد"
                      description="عبارت دیگری جستجو کنید یا فیلترها را پاک کنید."
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
