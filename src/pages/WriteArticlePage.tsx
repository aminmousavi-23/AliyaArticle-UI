import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { articleApi } from '@/api/articles'
import { categoryApi } from '@/api/categories'
import { tagApi } from '@/api/tags'
import { BlockEditor } from '@/components/BlockEditor'
import { type EditableBlock, newTextBlock } from '@/components/editableBlock'
import { useToast } from '@/context/ToastContext'
import { getApiErrorMessage } from '@/lib/apiClient'
import { BlockType, type CategoryDto, type CreateArticleBlockDto, type TagDto } from '@/types/api'

export function WriteArticlePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [blocks, setBlocks] = useState<EditableBlock[]>([newTextBlock()])

  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [tags, setTags] = useState<TagDto[]>([])
  const [isSaving, setIsSaving] = useState<'draft' | 'publish' | null>(null)

  useEffect(() => {
    categoryApi
      .search({ pageNumber: 1, pageSize: 100 })
      .then((r) => setCategories(r.data ?? []))
      .catch(() => setCategories([]))
    tagApi
      .search({ pageNumber: 1, pageSize: 100 })
      .then((r) => setTags(r.data ?? []))
      .catch(() => setTags([]))
  }, [])

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function validate(): string | null {
    if (!title.trim()) return 'Give your article a title.'
    if (!summary.trim()) return 'Add a short summary.'
    if (!categoryId) return 'Choose a category.'
    const hasContent = blocks.some(
      (b) => (b.type === BlockType.Text && b.text.trim()) || (b.type === BlockType.Image && b.base64File),
    )
    if (!hasContent) return 'Add at least one block of content.'
    return null
  }

  async function handleSave(publishAfter: boolean) {
    const validationError = validate()
    if (validationError) {
      showToast(validationError, 'error')
      return
    }

    setIsSaving(publishAfter ? 'publish' : 'draft')
    try {
      const payloadBlocks: CreateArticleBlockDto[] = blocks
        .filter((b) => (b.type === BlockType.Text && b.text.trim()) || (b.type === BlockType.Image && b.base64File))
        .map((b, index) => ({
          type: b.type,
          text: b.type === BlockType.Text ? b.text.trim() : b.text.trim() || null,
          base64File: b.type === BlockType.Image ? b.base64File : null,
          order: index,
        }))

      const newId = await articleApi.create({
        title: title.trim(),
        summary: summary.trim(),
        categoryId,
        tagIds: selectedTagIds,
        blocks: payloadBlocks,
      })

      if (publishAfter && newId) {
        await articleApi.publish(newId)
      }

      showToast(publishAfter ? 'Article published.' : 'Draft saved.', 'success')
      navigate(newId ? `/article/${newId}` : '/my-articles')
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Could not save your article.'), 'error')
    } finally {
      setIsSaving(null)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="editor-layout">
          <div>
            <input
              className="editor-title-input"
              placeholder="Article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="editor-summary-input"
              placeholder="One or two sentences that sum up the article…"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
            />
            <hr className="editor-divider" />
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>

          <aside className="editor-sidebar">
            <div className="card card--padded">
              <div className="field">
                <label className="field__label" htmlFor="category">
                  Category
                </label>
                <select id="category" className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Choose one…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="field__hint">
                  Don't see the right one? <a href="/categories">Manage categories</a>.
                </span>
              </div>

              <div className="field">
                <span className="field__label">Tags</span>
                <div className="tag-picker">
                  {tags.length === 0 && <span className="field__hint">No tags yet.</span>}
                  {tags.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`chip chip--button${selectedTagIds.includes(t.id) ? ' chip--selected' : ''}`}
                      onClick={() => toggleTag(t.id)}
                    >
                      #{t.name}
                    </button>
                  ))}
                </div>
                <span className="field__hint">
                  Need a new tag? <a href="/tags">Manage tags</a>.
                </span>
              </div>

              <button className="btn btn--ghost btn--block" onClick={() => handleSave(false)} disabled={isSaving !== null}>
                {isSaving === 'draft' ? 'Saving…' : 'Save as draft'}
              </button>
              <button className="btn btn--accent btn--block" onClick={() => handleSave(true)} disabled={isSaving !== null}>
                {isSaving === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
