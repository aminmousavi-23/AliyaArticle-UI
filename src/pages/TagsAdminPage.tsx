import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { tagApi } from '@/api/tags'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Spinner } from '@/components/Spinner'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import type { TagDto } from '@/types/api'

export function TagsAdminPage() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [tags, setTags] = useState<TagDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(() => {
    setIsLoading(true)
    tagApi
      .search({ pageNumber: 1, pageSize: 100 })
      .then((r) => setTags(r.data ?? []))
      .catch((err) => showToast(getApiErrorMessage(err, 'Could not load tags.'), 'error'))
      .finally(() => setIsLoading(false))
  }, [showToast])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setIsCreating(true)
    try {
      await tagApi.create({ name: name.trim() })
      setName('')
      showToast('Tag created.', 'success')
      load()
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not create that tag.'), 'error')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true)
    try {
      await tagApi.remove(id)
      setTags((prev) => prev.filter((t) => t.id !== id))
      showToast('Tag deleted.', 'success')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not delete that tag.'), 'error')
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
            <h1>Tags</h1>
            <p>Articles can carry as many tags as make sense.</p>
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
              placeholder="New tag name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn btn--primary" type="submit" disabled={isCreating}>
              {isCreating ? 'Adding…' : 'Add'}
            </button>
          </form>
        ) : (
          <div className="alert alert--info" style={{ marginBottom: 'var(--space-5)' }}>
            <Link to="/login">Log in</Link> to add or remove tags.
          </div>
        )}

        {isLoading ? (
          <Spinner label="Loading tags" />
        ) : tags.length === 0 ? (
          <EmptyState title="No tags yet" description="Tags you add will show up here." />
        ) : (
          <div className="filter-rail__chips">
            {tags.map((tag) => (
              <span key={tag.id} className="chip" style={{ paddingRight: isAuthenticated ? '0.3rem' : undefined }}>
                <Link to={`/?tag=${tag.id}`} style={{ color: 'inherit' }}>
                  #{tag.name}
                </Link>
                {isAuthenticated && (
                  <button
                    className="chip--remove"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                    onClick={() => setPendingDeleteId(tag.id)}
                    aria-label={`Delete tag ${tag.name}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete this tag?"
          description="It will be removed from any articles using it, depending on how your backend handles this."
          isBusy={isDeleting}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => handleDelete(pendingDeleteId)}
        />
      )}
    </div>
  )
}
