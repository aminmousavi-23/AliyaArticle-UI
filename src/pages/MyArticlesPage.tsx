import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { articleApi } from '@/api/articles'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Spinner } from '@/components/Spinner'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { formatDate } from '@/lib/format'
import { type ArticleDto } from '@/types/api'
import { FilterOperation_Enum} from "@/enums/FilterOperation_Enum.ts";

export function MyArticlesPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [articles, setArticles] = useState<ArticleDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(() => {
    if (!user) return
    setIsLoading(true)
    articleApi
        .search({
          pageNumber: 1,
          pageSize: 100,
          filter: {
            isAnd: true,
            orderBy: 'createdAt',
            isAscending: false,
            items: [{ field: 'createdBy', operation: FilterOperation_Enum.Equal, value: user.id }],
          },
        })
        .then((r) => setArticles(r.data ?? []))
        .catch((err) => showToast(getApiErrorMessage(err), 'error'))
        .finally(() => setIsLoading(false))
  }, [user, showToast])

  useEffect(() => { load() }, [load])

  async function handlePublish(id: string) {
    setPublishingId(id)
    try {
      await articleApi.publish(id)
      showToast('مقاله منتشر شد.', 'success')
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
    } finally {
      setPublishingId(null)
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      await articleApi.remove(id)
      setArticles((prev) => prev.filter((a) => a.id !== id))
      showToast('مقاله حذف شد.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
      setPendingDeleteId(null)
    }
  }

  return (
      <div className="page">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>مقالات من</h1>
              <p>پیش‌نویس‌ها و مقالات منتشرشده‌ای که نوشته‌اید.</p>
            </div>
            <Link className="btn btn--accent" to="/write">+ مقاله جدید</Link>
          </div>

          {isLoading ? (
              <Spinner label="در حال بارگذاری مقالات شما" />
          ) : articles.length === 0 ? (
              <EmptyState
                  title="هنوز چیزی اینجا نیست"
                  description="اولین مقاله‌تان را بنویسید."
                  action={<Link className="btn btn--primary" to="/write">نوشتن مقاله</Link>}
              />
          ) : (
              <div className="card">
                {articles.map((article, index) => (
                    <div
                        key={article.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-4)',
                          padding: 'var(--space-4) var(--space-5)',
                          borderTop: index === 0 ? 'none' : '1px solid var(--color-line)',
                        }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/article/${article.id}`} style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
                          {article.title}
                        </Link>
                        <div className="meta" style={{ marginTop: 'var(--space-1)' }}>
                          <span>{article.category.name}</span>
                          <span className="meta__dot" />
                          <span>{formatDate(article.createdAt)}</span>
                          <span className="meta__dot" />
                          <span className={`badge ${article.isPublished ? 'badge--published' : 'badge--draft'}`}>
                      {article.isPublished ? 'منتشرشده' : 'پیش‌نویس'}
                    </span>
                        </div>
                      </div>
                      {!article.isPublished && (
                          <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => handlePublish(article.id)}
                              disabled={publishingId === article.id}
                          >
                            {publishingId === article.id ? 'در حال انتشار…' : 'انتشار'}
                          </button>
                      )}
                      <button className="btn btn--danger btn--sm" onClick={() => setPendingDeleteId(article.id)}>
                        حذف
                      </button>
                    </div>
                ))}
              </div>
          )}
        </div>

        {pendingDeleteId && (
            <ConfirmDialog
                title="حذف این مقاله؟"
                description="این عمل مقاله را به همراه تمام دیدگاه‌هایش به‌طور دائمی حذف می‌کند."
                isBusy={isDeleting}
                onCancel={() => setPendingDeleteId(null)}
                onConfirm={() => handleDelete(pendingDeleteId)}
            />
        )}
      </div>
  )
}