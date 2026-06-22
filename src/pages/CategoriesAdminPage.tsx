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
      .catch((err) => showToast(getApiErrorMessage(err, 'Could not load categories.'), 'error'))
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
      showToast('Category created.', 'success')
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not create that category.'), 'error')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      await categoryApi.remove(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      showToast('Category deleted.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete that category.'), 'error')
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
            <h1>Categories</h1>
            <p>Every article belongs to one category.</p>
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
              placeholder="New category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn--primary" type="submit" disabled={isCreating}>
              {isCreating ? 'Adding…' : 'Add'}
            </button>
          </form>
        ) : (
          <div className="alert alert--info" style={{ marginBottom: 'var(--space-5)' }}>
            <Link to="/login">Log in</Link> to add or remove categories.
          </div>
        )}

        {isLoading ? (
          <Spinner label="Loading categories" />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Categories you add will show up here." />
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
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete this category?"
          description="Articles using it may be affected, depending on how your backend handles this."
          isBusy={isDeleting}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => handleDelete(pendingDeleteId)}
        />
      )}
    </div>
  )
}
