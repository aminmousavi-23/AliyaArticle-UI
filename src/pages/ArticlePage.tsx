import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { articleApi } from '@/api/articles'
import { commentApi } from '@/api/comments'
import { ArticleBlocks } from '@/components/ArticleBlocks'
import { CommentForm } from '@/components/CommentForm'
import { CommentList } from '@/components/CommentList'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Spinner } from '@/components/Spinner'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { countWords, estimateReadTime, formatDate} from '@/lib/format'
import { type ArticleDto, type CommentDto } from '@/types/api'
import {BlockType_Enum} from "@/enums/BlockType_Enum.ts";

export function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [article, setArticle] = useState<ArticleDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [comments, setComments] = useState<CommentDto[]>([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<string | null>(null)
  const [showDeleteArticle, setShowDeleteArticle] = useState(false)
  const [isDeletingArticle, setIsDeletingArticle] = useState(false)

  const loadComments = useCallback(() => {
    if (!id) return
    setIsCommentsLoading(true)
    commentApi
        .search({ articleId: id, pageNumber: 1, pageSize: 50 })
        .then((r) => setComments(r.data ?? []))
        .catch(() => setComments([]))
        .finally(() => setIsCommentsLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setNotFound(false)
    articleApi
        .getById(id)
        .then(setArticle)
        .catch(() => setNotFound(true))
        .finally(() => setIsLoading(false))
  }, [id])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  async function handlePostComment(values: { authorName: string; authorEmail: string; content: string }) {
    if (!id) return
    setIsPosting(true)
    try {
      await commentApi.create({ ...values, articleId: id })
      showToast('دیدگاه شما ثبت شد.', 'success')
      loadComments()
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
    } finally {
      setIsPosting(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await commentApi.remove(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      showToast('دیدگاه حذف شد.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
    } finally {
      setPendingDeleteCommentId(null)
    }
  }

  async function handleDeleteArticle() {
    if (!article) return
    setIsDeletingArticle(true)
    try {
      await articleApi.remove(article.id)
      showToast('مقاله حذف شد.', 'success')
      navigate('/my-articles')
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
      setIsDeletingArticle(false)
    }
  }

  if (isLoading) return <div className="page"><Spinner label="در حال بارگذاری مقاله" /></div>

  if (notFound || !article) {
    return (
        <div className="page">
          <div className="container">
            <h1>مقاله پیدا نشد</h1>
            <p>ممکن است حذف شده باشد یا لینک اشتباه باشد.</p>
            <Link className="btn btn--primary" to="/">بازگشت به مقالات</Link>
          </div>
        </div>
    )
  }

  const wordCount = article.blocks
      .filter((b) => b.type === BlockType_Enum.Paragraph)
      .reduce((sum, b) => sum + countWords(b.text ?? ''), 0)
  const isOwner = isAuthenticated && user?.id === article.author.id

  return (
      <div className="page">
        <div className="container">
          <div className="article-reader">
            <aside className="margin-rail" aria-hidden={article.tags.length === 0}>
              <div className="margin-rail__line" />
              {article.tags.map((tag) => (
                  <span key={tag.id} className="margin-rail__tag">#{tag.name}</span>
              ))}
              <div className="margin-rail__line" />
            </aside>

            <div>
              <span className="article-reader__category">{article.category.name}</span>
              <h1 className="article-reader__title">{article.title}</h1>
              {article.summary && <p className="article-reader__summary">{article.summary}</p>}

              <div className="article-reader__byline">
              <span className="nav__avatar" aria-hidden="true">
                {/*{initials(article.author.fullName || article.author.username)}*/}
              </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                    {/*{article.author.fullName || article.author.username}*/}
                  </div>
                  <div className="meta">
                    <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
                    <span className="meta__dot" />
                    <span>{estimateReadTime(wordCount)}</span>
                    {!article.isPublished && (
                        <>
                          <span className="meta__dot" />
                          <span className="badge badge--draft">پیش‌نویس — هنوز منتشر نشده</span>
                        </>
                    )}
                  </div>
                </div>
                {isOwner && (
                    <div className="article-reader__actions">
                      <button className="btn btn--danger btn--sm" onClick={() => setShowDeleteArticle(true)}>
                        حذف
                      </button>
                    </div>
                )}
              </div>

              <ArticleBlocks blocks={article.blocks} />

              <section className="comments">
                <h2>دیدگاه‌ها {comments.length > 0 && `(${comments.length})`}</h2>
                {isCommentsLoading ? (
                    <Spinner label="در حال بارگذاری دیدگاه‌ها" />
                ) : (
                    <CommentList
                        comments={comments}
                        canModerate={isAuthenticated}
                        onDelete={setPendingDeleteCommentId}
                    />
                )}
                <CommentForm isSubmitting={isPosting} onSubmit={handlePostComment} />
              </section>
            </div>
          </div>
        </div>

        {pendingDeleteCommentId && (
            <ConfirmDialog
                title="حذف این دیدگاه؟"
                description="این عمل قابل بازگشت نیست."
                onCancel={() => setPendingDeleteCommentId(null)}
                onConfirm={() => handleDeleteComment(pendingDeleteCommentId)}
            />
        )}

        {showDeleteArticle && (
            <ConfirmDialog
                title="حذف این مقاله؟"
                description="این عمل مقاله را به همراه تمام دیدگاه‌هایش به‌طور دائمی حذف می‌کند."
                isBusy={isDeletingArticle}
                onCancel={() => setShowDeleteArticle(false)}
                onConfirm={handleDeleteArticle}
            />
        )}
      </div>
  )
}
