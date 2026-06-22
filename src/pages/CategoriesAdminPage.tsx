import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { categoryApi } from '@/api/categories'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Spinner } from '@/components/Spinner'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import type { CategoryDto } from '@/types/api'

export function CategoriesAdminPage() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(() => {
    setIsLoading(true)
    categoryApi
        .search({ pageNumber: 1, pageSize: 100 })
        .then((r) => setCategories(r.data ?? []))
        .catch((err) => showToast(getApiErrorMessage(err), 'error'))
        .finally(() => setIsLoading(false))
  }, [showToast])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setIsCreating(true)
    try {
      await categoryApi.create({ name: name.trim() })
      setName('')
      showToast('دسته‌بندی ایجاد شد.', 'success')
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      await categoryApi.remove(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      showToast('دسته‌بندی حذف شد.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
      setPendingDeleteId(null)
    }
  }

  return (
      <div className="page page--narrow">
        <div className="container">
          <div className="page-header">
            <div>
              <h1>دسته‌بندی‌ها</h1>
              <p>هر مقاله به یک دسته‌بندی تعلق دارد.</p>
            </div>
          </div>

          {isAuthenticated ? (
              <form
                  className="card card--padded"
                  onSubmit={handleCreate}
                  style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}
              >
                <input
                    className="input"
                    placeholder="نام دسته‌بندی جدید"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="btn btn--primary" type="submit" disabled={isCreating}>
                  {isCreating ? 'در حال افزودن…' : 'افزودن'}
                </button>
              </form>
          ) : (
              <div className="alert alert--info" style={{ marginBottom: 'var(--space-5)' }}>
                <Link to="/login">وارد شوید</Link> تا بتوانید دسته‌بندی اضافه یا حذف کنید.
              </div>
          )}

          {isLoading ? (
              <Spinner label="در حال بارگذاری دسته‌بندی‌ها" />
          ) : categories.length === 0 ? (
              <EmptyState title="هنوز دسته‌بندی‌ای وجود ندارد" description="دسته‌بندی‌هایی که اضافه کنید اینجا نمایش داده می‌شوند." />
          ) : (
              <ul className="card">
                {categories.map((category, index) => (
                    <li
                        key={category.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-4) var(--space-5)',
                          borderTop: index === 0 ? 'none' : '1px solid var(--color-line)',
                        }}
                    >
                      <Link to={`/?category=${category.id}`}>{category.name}</Link>
                      {isAuthenticated && (
                          <button className="btn btn--danger btn--sm" onClick={() => setPendingDeleteId(category.id)}>
                            حذف
                          </button>
                      )}
                    </li>
                ))}
              </ul>
          )}
        </div>

        {pendingDeleteId && (
            <ConfirmDialog
                title="حذف این دسته‌بندی؟"
                description="مقالاتی که از این دسته‌بندی استفاده می‌کنند ممکن است تحت تأثیر قرار بگیرند."
                isBusy={isDeleting}
                onCancel={() => setPendingDeleteId(null)}
                onConfirm={() => handleDelete(pendingDeleteId)}
            />
        )}
      </div>
  )
}
